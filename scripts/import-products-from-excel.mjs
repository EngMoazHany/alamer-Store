import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import JSZip from 'jszip'
import { SaxesParser } from 'saxes'
import sharp from 'sharp'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const defaultInput = path.join(rootDir, 'src', 'data', 'products.xlsx')
const defaultOutput = path.join(rootDir, 'public', 'products', 'excel')
const defaultGenerated = path.join(rootDir, 'src', 'data', 'generatedProducts.js')
const normalizeText = (value) => String(value ?? '').replace(/\s+/gu, ' ').trim()
const padProductNumber = (value) => String(value).padStart(3, '0')
const children = (node, name) => (node?.children || []).filter((item) => item.name === name)
const child = (node, name) => children(node, name)[0]

function descendants(node, name) {
  return (node?.children || []).flatMap((item) => [
    ...(item.name === name ? [item] : []), ...descendants(item, name),
  ])
}

// Match local XML names, never fixed r:/xdr:/ns0: prefixes. A real parser also
// keeps self-closing cells separate and correctly decodes text/attribute entities.
function parseXml(xml, fileName) {
  const document = { children: [] }
  const stack = [document]
  const parser = new SaxesParser({ xmlns: true, fileName })
  parser.on('opentag', (tag) => {
    const node = { name: tag.local, attrs: Object.create(null), children: [], text: '' }
    for (const attribute of Object.values(tag.attributes)) {
      if (attribute.uri !== 'http://www.w3.org/2000/xmlns/') node.attrs[attribute.local] = attribute.value
    }
    stack.at(-1).children.push(node)
    stack.push(node)
  })
  const appendText = (text) => { stack.at(-1).text += text }
  parser.on('text', appendText)
  parser.on('cdata', appendText)
  parser.on('closetag', () => stack.pop())
  parser.write(xml).close()
  return document.children[0]
}

async function readXml(zip, fileName) {
  const entry = zip.file(fileName)
  if (!entry) throw new Error(`Missing XLSX part: ${fileName}`)
  return parseXml(await entry.async('string'), fileName)
}

function resolveZipPath(baseFile, target) {
  const decoded = decodeURIComponent(target).replace(/\\/g, '/')
  const resolved = path.posix.normalize(decoded.startsWith('/')
    ? decoded.slice(1) : path.posix.join(path.posix.dirname(baseFile), decoded))
  if (!resolved || resolved === '..' || resolved.startsWith('../') || /^[a-z]+:/i.test(resolved)) {
    throw new Error(`Unexpected XLSX internal path: ${target}`)
  }
  return resolved
}

async function readRelationships(zip, sourceFile) {
  const fileName = sourceFile
    ? path.posix.join(path.posix.dirname(sourceFile), '_rels', `${path.posix.basename(sourceFile)}.rels`)
    : '_rels/.rels'
  if (!zip.file(fileName)) return new Map()
  const xml = await readXml(zip, fileName)
  return new Map(children(xml, 'Relationship').map(({ attrs }) => [attrs.Id, attrs]))
}

function relationshipPath(sourceFile, relationship, type) {
  if (!relationship?.Target || relationship.TargetMode?.toLowerCase() === 'external') {
    throw new Error(`Missing or external ${type} relationship in ${sourceFile || 'package'}`)
  }
  if (!relationship.Type?.endsWith(`/${type}`)) throw new Error(`Expected ${type} relationship in ${sourceFile || 'package'}`)
  return resolveZipPath(sourceFile, relationship.Target)
}

function columnLettersToIndex(letters) {
  return [...letters.toUpperCase()].reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0)
}

function columnLabel(index) {
  let label = ''
  for (let value = index; value > 0; value = Math.floor((value - 1) / 26)) {
    label = String.fromCharCode(65 + (value - 1) % 26) + label
  }
  return label
}

function richText(node) {
  // Phonetic annotations (rPh) are not part of the visible product name.
  return (node?.children || []).map((item) => {
    if (item.name === 't') return item.text
    return item.name === 'r' ? richText(item) : ''
  }).join('')
}

function cellText(cell, sharedStrings) {
  const value = child(cell, 'v')?.text ?? ''
  if (cell.attrs.t === 'inlineStr') return richText(child(cell, 'is'))
  if (cell.attrs.t === 's') {
    const index = Number(value)
    if (!value.trim() || !Number.isInteger(index) || sharedStrings[index] === undefined) {
      throw new Error(`Invalid shared-string index ${JSON.stringify(value)}`)
    }
    return sharedStrings[index]
  }
  if (cell.attrs.t === 'e') throw new Error(`Excel cell error: ${value}`)
  return value // Also supports cached formula results and ordinary string cells.
}

function parseRows(sheet, sharedStrings) {
  const rows = new Map()
  let previousRow = 0
  for (const row of children(child(sheet, 'sheetData'), 'row')) {
    const rowNumber = Number(row.attrs.r || previousRow + 1)
    previousRow = rowNumber
    const cells = new Map()
    const errors = []
    let previousColumn = 0
    for (const cell of children(row, 'c')) {
      const letters = cell.attrs.r?.match(/^([A-Z]+)\d+$/i)?.[1]
      const column = letters ? columnLettersToIndex(letters) : previousColumn + 1
      previousColumn = column
      try {
        cells.set(column, normalizeText(cellText(cell, sharedStrings)))
      } catch (error) {
        errors.push(`${cell.attrs.r || columnLabel(column)}: ${error.message}`)
      }
    }
    rows.set(rowNumber, { cells, errors })
  }
  return rows
}

function detectHeaders(rows) {
  for (const [headerRow, { cells }] of rows) {
    const names = []
    const squares = []
    for (const [column, header] of cells) {
      const value = header.normalize('NFKC').toLowerCase().replace(/[_-]/g, ' ')
      if (/\bproduct\b/.test(value) && /\bname\b/.test(value) && /\b(arabic|ar)\b/.test(value)) names.push(column)
      const dimensions = value.match(/(\d+)\s*[x×*]\s*(\d+)/)
      const square = dimensions ? Number(dimensions[1]) === Number(dimensions[2]) : /\bsquare\b/.test(value)
      if (/\bfinal\b/.test(value) && /\b(ad|advert|advertisement)\b/.test(value) && !/\boriginal\b/.test(value) && square) {
        squares.push(column)
      }
    }
    if (names.length && squares.length) {
      if (names.length !== 1 || squares.length !== 1) throw new Error(`Ambiguous product-name or square Final Ad columns in row ${headerRow}`)
      return { headerRow, headers: cells, nameColumn: names[0], squareColumn: squares[0] }
    }
  }
  return null
}

async function selectWorksheet(zip, logger) {
  const rootRels = await readRelationships(zip, '')
  const officeDocument = [...rootRels.values()].find((rel) => rel.Type?.endsWith('/officeDocument'))
  const workbookFile = officeDocument ? relationshipPath('', officeDocument, 'officeDocument') : 'xl/workbook.xml'
  const workbook = await readXml(zip, workbookFile)
  const workbookRels = await readRelationships(zip, workbookFile)
  const sharedRel = [...workbookRels.values()].find((rel) => rel.Type?.endsWith('/sharedStrings'))
  const sharedStrings = sharedRel
    ? children(await readXml(zip, relationshipPath(workbookFile, sharedRel, 'sharedStrings')), 'si').map(richText) : []
  const matches = []
  const inspected = []
  for (const sheetInfo of children(child(workbook, 'sheets'), 'sheet')) {
    const sheetName = sheetInfo.attrs.name
    try {
      const sheetFile = relationshipPath(workbookFile, workbookRels.get(sheetInfo.attrs.id), 'worksheet')
      const sheet = await readXml(zip, sheetFile)
      const rows = parseRows(sheet, sharedStrings)
      const detected = detectHeaders(rows)
      inspected.push(sheetName)
      if (detected) matches.push({ sheetName, sheetFile, sheet, rows, ...detected })
    } catch (error) {
      logger.warn(`Could not read sheet ${JSON.stringify(sheetName)}: ${error.message}`)
    }
  }
  const preferred = matches.filter((sheet) => normalizeText(sheet.sheetName).toLowerCase() === 'final ads')
  if (preferred.length === 1) return preferred[0]
  if (matches.length === 1) return matches[0]
  if (matches.length > 1) throw new Error(`Multiple product sheets found: ${matches.map((sheet) => sheet.sheetName).join(', ')}`)
  throw new Error(`No sheet has an Arabic product-name column and a square Final Ad column. Sheets inspected: ${inspected.join(', ') || '(none)'}`)
}

async function readAnchoredImages(zip, selected, logger) {
  const { sheet, sheetFile } = selected
  const sheetRels = await readRelationships(zip, sheetFile)
  const imagesByCell = new Map()
  let embeddedImages = 0
  for (const drawingRef of descendants(sheet, 'drawing')) {
    try {
      const drawingFile = relationshipPath(sheetFile, sheetRels.get(drawingRef.attrs.id), 'drawing')
      const drawing = await readXml(zip, drawingFile)
      const drawingRels = await readRelationships(zip, drawingFile)
      const anchors = drawing.children.filter((node) => ['oneCellAnchor', 'twoCellAnchor', 'absoluteAnchor'].includes(node.name))
      for (const anchor of anchors) {
        const blips = descendants(anchor, 'blip').filter((blip) => blip.attrs.embed)
        embeddedImages += blips.length
        if (!blips.length) continue
        const from = child(anchor, 'from')
        const rowText = child(from, 'row')?.text.trim()
        const colText = child(from, 'col')?.text.trim()
        if (!/^\d+$/.test(rowText ?? '') || !/^\d+$/.test(colText ?? '')) {
          logger.warn(`Ignoring ${blips.length} image(s) in ${drawingFile}: ${anchor.name} has no valid cell origin`)
          continue
        }
        // Drawing origins are zero-based, worksheet rows and columns one-based.
        const rowNumber = Number(rowText) + 1
        const columnNumber = Number(colText) + 1
        const key = `${rowNumber}:${columnNumber}`
        if (!imagesByCell.has(key)) imagesByCell.set(key, [])
        for (const blip of blips) {
          const image = { rowNumber, columnNumber }
          try {
            image.mediaPath = relationshipPath(drawingFile, drawingRels.get(blip.attrs.embed), 'image')
            if (!zip.file(image.mediaPath)) throw new Error(`Missing embedded image: ${image.mediaPath}`)
          } catch (error) {
            image.error = error.message
          }
          imagesByCell.get(key).push(image)
        }
      }
    } catch (error) {
      logger.warn(`Could not read worksheet drawing: ${error.message}`)
    }
  }
  return { imagesByCell, embeddedImages }
}

function englishNameFallback(nameAr, productNumber) {
  const code = nameAr.match(/[A-Za-z0-9]+(?:[/-][A-Za-z0-9]+)*/g)?.join(' ') || padProductNumber(productNumber)
  const phrase = nameAr.split('-')[0].trim()
  const dictionary = [
    ['طقم حمام', 'Bathroom Set'], ['طقم أكواب زجاج', 'Glass Cup Set'],
    ['كوب زجاج', 'Glass Cup'], ['طقم', 'Set'], ['حمام', 'Bathroom'],
    ['أكواب', 'Cups'], ['كوب', 'Cup'], ['زجاج', 'Glass'], ['طبق', 'Plate'],
    ['أطباق', 'Plates'], ['صينية', 'Tray'], ['حلل', 'Cookware'], ['حلة', 'Pot'],
    ['طاسة', 'Pan'], ['مقلاة', 'Pan'], ['خلاط', 'Blender'], ['كبة', 'Chopper'],
    ['غلاية', 'Kettle'], ['مكواة', 'Iron'], ['رف', 'Rack'], ['منظم', 'Organizer'],
  ]
  const match = dictionary.find(([arabic]) => phrase.includes(arabic))
  return `${match?.[1] || 'Product'} ${code}`
}

async function saveSquareImage(zip, candidates, outputPath, rowNumber, logger) {
  const errors = []
  for (const image of candidates) {
    try {
      if (image.error) throw new Error(image.error)
      const buffer = await zip.file(image.mediaPath).async('nodebuffer')
      const processor = sharp(buffer, { failOn: 'warning' })
      const metadata = await processor.metadata()
      if (!metadata.width || metadata.width !== metadata.height) {
        throw new Error(`Final Ad is not square (${metadata.width}x${metadata.height})`)
      }
      await processor.rotate().resize({ width: 1080, withoutEnlargement: true }).webp({ quality: 85 }).toFile(outputPath)
      if (candidates.length > 1) logger.warn(`Row ${rowNumber}: multiple Final Ad images; selected ${image.mediaPath}`)
      return
    } catch (error) {
      errors.push(`${image.mediaPath || 'image relationship'}: ${error.message}`)
      logger.warn(`Row ${rowNumber}: unusable Final Ad image: ${errors.at(-1)}`)
    }
  }
  throw new Error(errors.join('; '))
}

// Direct ZIP/XML reading replaces ExcelJS: ExcelJS rejects valid drawings when
// another program rewrites their namespace prefixes.
export async function importProducts({
  inputFile = defaultInput,
  outputDir = defaultOutput,
  generatedFile = defaultGenerated,
  logger = console,
} = {}) {
  const zip = await JSZip.loadAsync(await fs.readFile(inputFile))
  const selected = await selectWorksheet(zip, logger)
  const { sheetName, rows, headerRow, headers, nameColumn, squareColumn } = selected
  logger.log(`Detected sheet: ${sheetName}`)
  logger.log(`Detected headers: ${[...headers].map(([column, name]) => `${columnLabel(column)}: ${name}`).join(' | ')}`)
  logger.log(`Selected square Final Ad column: ${columnLabel(squareColumn)} (${headers.get(squareColumn)})`)
  const { imagesByCell, embeddedImages } = await readAnchoredImages(zip, selected, logger)
  const candidateRows = new Set([...rows].filter(([row, { cells, errors }]) =>
    row > headerRow && (errors.length || [...cells.values()].some(Boolean)),
  ).map(([row]) => row))
  for (const images of imagesByCell.values()) {
    for (const image of images) if (image.rowNumber > headerRow) candidateRows.add(image.rowNumber)
  }
  const rowNumbers = [...candidateRows].sort((a, b) => a - b)
  const squareImagesMapped = rowNumbers.filter((row) =>
    imagesByCell.get(`${row}:${squareColumn}`)?.some((image) => !image.error),
  ).length
  const stats = { sheetName, rowsFound: rowNumbers.length, embeddedImages, squareImagesMapped, skippedRows: [] }
  logger.log(`Rows found: ${stats.rowsFound}`)
  logger.log(`Embedded images found: ${embeddedImages}`)
  logger.log(`Square final-ad images mapped: ${squareImagesMapped}`)

  // Stage conversions: a failed/empty import must not erase the existing catalog
  // or remove its images, as the old prepareOutput did.
  await fs.mkdir(outputDir, { recursive: true })
  const stagingDir = await fs.mkdtemp(path.join(outputDir, '.import-'))
  const products = []
  try {
    for (const [index, rowNumber] of rowNumbers.entries()) {
      try {
        const row = rows.get(rowNumber)
        if (row?.errors.length) throw new Error(row.errors.join('; '))
        const nameAr = row?.cells.get(nameColumn)
        if (!nameAr) throw new Error(`Missing Arabic product name in ${columnLabel(nameColumn)}${rowNumber}`)
        const candidates = imagesByCell.get(`${rowNumber}:${squareColumn}`) || []
        if (!candidates.length) throw new Error(`No embedded image in ${JSON.stringify(headers.get(squareColumn))}`)
        // An earlier bad row must not change the IDs of later products.
        const productNumber = index + 1
        const id = `product-${padProductNumber(productNumber)}`
        const fileName = `${id}-1080.webp`
        await saveSquareImage(zip, candidates, path.join(stagingDir, fileName), rowNumber, logger)
        products.push({
          id, nameAr, nameEn: englishNameFallback(nameAr, productNumber),
          categoryAr: 'كل المنتجات', categoryEn: 'All Products',
          image: `/products/excel/${fileName}`, source: 'excel-final-ad',
        })
      } catch (error) {
        stats.skippedRows.push({ rowNumber, reason: error.message })
        logger.warn(`Skipping row ${rowNumber}: ${error.message}`)
      }
    }
    logger.log(`Products imported: ${products.length}`)
    logger.log(`Skipped rows: ${stats.skippedRows.length}`)
    if (!products.length) throw new Error('No products could be imported; existing catalog and images were preserved. Check the diagnostics above.')
    const generatedText = `// Generated by scripts/import-products-from-excel.mjs\nexport const generatedProducts = ${JSON.stringify(products, null, 2)}\n`
    await fs.mkdir(path.dirname(generatedFile), { recursive: true })
    const stagedData = path.join(stagingDir, 'generatedProducts.js')
    await fs.writeFile(stagedData, generatedText, 'utf8')
    for (const product of products) {
      const fileName = path.posix.basename(product.image)
      await fs.rename(path.join(stagingDir, fileName), path.join(outputDir, fileName))
    }
    await fs.copyFile(stagedData, generatedFile)
    logger.log(`Images: ${path.relative(rootDir, outputDir)}`)
    logger.log(`Data: ${path.relative(rootDir, generatedFile)}`)
    return { products, stats }
  } finally {
    // Unique directory created by this invocation, never an input/user folder.
    await fs.rm(stagingDir, { recursive: true, force: true })
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  importProducts().catch((error) => {
    console.error(`Product import failed: ${error.message}`)
    process.exitCode = 1
  })
}
