import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ExcelJS from 'exceljs'
import JSZip from 'jszip'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const inputFile = path.join(rootDir, 'src', 'data', 'products.xlsx')
const outputDir = path.join(rootDir, 'public', 'products', 'excel')
const generatedFile = path.join(rootDir, 'src', 'data', 'generatedProducts.js')

const REQUIRED_COLUMNS = {
  nameAr: 'Product Name Arabic',
  square: 'Final Ad Design 1080x1080',
  portrait: 'Final Ad Design 1080x1350',
}

const DEFAULT_CATEGORY = {
  categoryAr: 'كل المنتجات',
  categoryEn: 'All Products',
}

const EXPECTED_ZIP_PATH_PREFIXES = ['xl/media/', 'xl/drawings/', 'xl/worksheets/', 'xl/_rels/']

function padProductNumber(value) {
  return String(value).padStart(3, '0')
}

function normalizeHeader(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function xmlDecode(value = '') {
  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

function columnLettersToIndex(letters) {
  return letters.split('').reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0)
}

function toPublicPath(filePath) {
  return `/${filePath.split(path.sep).join('/')}`
}

function validateZipPath(zipPath) {
  const normalizedPath = path.posix.normalize(String(zipPath || '')).replace(/^\/+/, '')
  const isExpectedPath = EXPECTED_ZIP_PATH_PREFIXES.some((prefix) => normalizedPath.startsWith(prefix))

  if (
    !normalizedPath ||
    normalizedPath.startsWith('../') ||
    normalizedPath.includes('/../') ||
    !isExpectedPath
  ) {
    throw new Error(`Unexpected XLSX internal path: ${zipPath}`)
  }

  return normalizedPath
}

function englishNameFallback(nameAr, productNumber) {
  const code = String(nameAr || '').match(/[A-Za-z0-9]+(?:[/-][A-Za-z0-9]+)*/g)?.join(' ') || padProductNumber(productNumber)
  const phrase = String(nameAr || '').split('-')[0].trim()
  const dictionary = [
    ['طقم حمام', 'Bathroom Set'],
    ['طقم أكواب زجاج', 'Glass Cup Set'],
    ['كوب زجاج', 'Glass Cup'],
    ['طقم', 'Set'],
    ['حمام', 'Bathroom'],
    ['أكواب', 'Cups'],
    ['كوب', 'Cup'],
    ['زجاج', 'Glass'],
    ['طبق', 'Plate'],
    ['أطباق', 'Plates'],
    ['صينية', 'Tray'],
    ['حلل', 'Cookware'],
    ['حلة', 'Pot'],
    ['طاسة', 'Pan'],
    ['مقلاة', 'Pan'],
    ['خلاط', 'Blender'],
    ['كبة', 'Chopper'],
    ['غلاية', 'Kettle'],
    ['مكواة', 'Iron'],
    ['رف', 'Rack'],
    ['منظم', 'Organizer'],
  ]

  const match = dictionary.find(([arabic]) => phrase.includes(arabic))
  return `${match?.[1] || 'Product'} ${code}`.replace(/\s+/g, ' ').trim()
}

async function prepareOutput() {
  await fs.mkdir(outputDir, { recursive: true })
  const existing = await fs.readdir(outputDir).catch(() => [])
  await Promise.all(
    existing
      .filter((file) => /^product-\d{3}-(1080|1350)\.webp$/i.test(file))
      .map((file) => fs.rm(path.join(outputDir, file), { force: true })),
  )
}

async function saveWebp(buffer, fileName) {
  const outputPath = path.join(outputDir, fileName)
  await sharp(buffer)
    .rotate()
    .resize({ width: 1080, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(outputPath)
  return toPublicPath(path.join('products', 'excel', fileName))
}

function buildProduct({ productNumber, nameAr, squarePath }) {
  const productId = `product-${padProductNumber(productNumber)}`
  return {
    id: productId,
    nameAr,
    nameEn: englishNameFallback(nameAr, productNumber),
    image: squarePath,
    categoryAr: DEFAULT_CATEGORY.categoryAr,
    categoryEn: DEFAULT_CATEGORY.categoryEn,
    source: 'excel-final-ad',
  }
}

function getHeaderMapFromWorksheet(worksheet) {
  const row = worksheet.getRow(1)
  const headers = new Map()
  row.eachCell({ includeEmpty: false }, (cell, columnNumber) => {
    headers.set(normalizeHeader(cell.value), columnNumber)
  })
  return headers
}

function getImageBufferFromWorkbook(workbook, imageId) {
  const image = workbook.getImage(imageId)
  if (!image) return null
  if (image.buffer) return image.buffer
  if (image.base64) return Buffer.from(image.base64, 'base64')
  return null
}

async function importWithExcelJs() {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(inputFile)
  const worksheet = workbook.worksheets[0]
  if (!worksheet) throw new Error('No worksheets found in src/data/products.xlsx')

  const headers = getHeaderMapFromWorksheet(worksheet)
  const nameColumn = headers.get(REQUIRED_COLUMNS.nameAr)
  const squareColumn = headers.get(REQUIRED_COLUMNS.square)
  const portraitColumn = headers.get(REQUIRED_COLUMNS.portrait)

  if (!nameColumn || !squareColumn) {
    throw new Error(`Missing required columns: ${REQUIRED_COLUMNS.nameAr}, ${REQUIRED_COLUMNS.square}`)
  }

  const imagesByCell = new Map()
  worksheet.getImages().forEach((image) => {
    const rowNumber = Math.floor(image.range.tl.nativeRow ?? image.range.tl.row) + 1
    const columnNumber = Math.floor(image.range.tl.nativeCol ?? image.range.tl.col) + 1
    imagesByCell.set(`${rowNumber}:${columnNumber}`, image.imageId)
  })

  const products = []
  let productNumber = 1

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber)
    const nameAr = normalizeHeader(row.getCell(nameColumn).text || row.getCell(nameColumn).value)
    if (!nameAr) continue

    const squareImageId = imagesByCell.get(`${rowNumber}:${squareColumn}`)
    if (squareImageId == null) {
      console.warn(`Skipping row ${rowNumber}: no image in "${REQUIRED_COLUMNS.square}"`)
      continue
    }

    const productId = `product-${padProductNumber(productNumber)}`
    const squareBuffer = getImageBufferFromWorkbook(workbook, squareImageId)
    const portraitImageId = portraitColumn ? imagesByCell.get(`${rowNumber}:${portraitColumn}`) : null
    const portraitBuffer = portraitImageId != null ? getImageBufferFromWorkbook(workbook, portraitImageId) : null

    const [squarePath] = await Promise.all([
      saveWebp(squareBuffer, `${productId}-1080.webp`),
      portraitBuffer ? saveWebp(portraitBuffer, `${productId}-1350.webp`) : Promise.resolve(null),
    ])
    products.push(buildProduct({ productNumber, nameAr, squarePath }))
    productNumber += 1
  }

  return products
}

function parseCellsByRow(sheetXml) {
  const rows = new Map()
  const cellRegex = /<c\s+([^>]*?r="([A-Z]+\d+)"[^>]*)>([\s\S]*?)<\/c>/g

  for (const match of sheetXml.matchAll(cellRegex)) {
    const [, attrs, ref, inner] = match
    const column = ref.match(/[A-Z]+/)?.[0]
    const rowNumber = Number(ref.match(/\d+/)?.[0])
    const inlineText = inner.match(/<is>[\s\S]*?<t[^>]*>([\s\S]*?)<\/t>[\s\S]*?<\/is>/)?.[1]
    const valueText = inner.match(/<v>([\s\S]*?)<\/v>/)?.[1]
    const value = attrs.includes('t="inlineStr"') ? xmlDecode(inlineText || '') : xmlDecode(valueText || '')

    if (!rows.has(rowNumber)) rows.set(rowNumber, new Map())
    rows.get(rowNumber).set(column, normalizeHeader(value))
  }

  return rows
}

function parseRelationships(xml) {
  const relationships = new Map()
  const regex = /<Relationship\b([^>]+?)\/>/g
  for (const match of xml.matchAll(regex)) {
    const attrs = match[1]
    const id = attrs.match(/\bId="([^"]+)"/)?.[1]
    const target = attrs.match(/\bTarget="([^"]+)"/)?.[1]
    if (id && target) relationships.set(id, target)
  }
  return relationships
}

function resolveZipPath(baseFile, target) {
  if (target.startsWith('/')) return validateZipPath(target)
  const baseDir = path.posix.dirname(baseFile)
  return validateZipPath(path.posix.join(baseDir, target))
}

function parseAnchoredImages(drawingXml, drawingRels, drawingFile) {
  const images = []
  const anchorRegex = /<(?:xdr:)?(?:oneCellAnchor|twoCellAnchor)>[\s\S]*?<\/(?:xdr:)?(?:oneCellAnchor|twoCellAnchor)>/g

  for (const match of drawingXml.matchAll(anchorRegex)) {
    const anchor = match[0]
    const from = anchor.match(/<(?:xdr:)?from>([\s\S]*?)<\/(?:xdr:)?from>/)?.[1]
    if (!from) continue

    const columnIndex = Number(from.match(/<(?:xdr:)?col>(\d+)<\/(?:xdr:)?col>/)?.[1])
    const rowIndex = Number(from.match(/<(?:xdr:)?row>(\d+)<\/(?:xdr:)?row>/)?.[1])
    const relId = anchor.match(/\br:embed="([^"]+)"/)?.[1]
    const target = relId ? drawingRels.get(relId) : null
    if (!Number.isFinite(columnIndex) || !Number.isFinite(rowIndex) || !target) continue

    images.push({
      rowNumber: rowIndex + 1,
      columnNumber: columnIndex + 1,
      mediaPath: resolveZipPath(drawingFile, target),
    })
  }

  return images
}

async function importWithZipFallback() {
  const zip = await JSZip.loadAsync(await fs.readFile(inputFile))
  const sheetFile = validateZipPath('xl/worksheets/sheet1.xml')
  const sheetXml = await zip.file(sheetFile)?.async('string')
  if (!sheetXml) throw new Error('Could not find xl/worksheets/sheet1.xml')

  const rows = parseCellsByRow(sheetXml)
  const headerRow = rows.get(1) || new Map()
  const headerToColumn = new Map([...headerRow.entries()].map(([column, header]) => [header, columnLettersToIndex(column)]))

  const nameColumn = headerToColumn.get(REQUIRED_COLUMNS.nameAr)
  const squareColumn = headerToColumn.get(REQUIRED_COLUMNS.square)
  const portraitColumn = headerToColumn.get(REQUIRED_COLUMNS.portrait)

  if (!nameColumn || !squareColumn) {
    throw new Error(`Missing required columns: ${REQUIRED_COLUMNS.nameAr}, ${REQUIRED_COLUMNS.square}`)
  }

  const sheetRelsFile = validateZipPath('xl/worksheets/_rels/sheet1.xml.rels')
  const sheetRelsXml = await zip.file(sheetRelsFile)?.async('string')
  const sheetRels = parseRelationships(sheetRelsXml || '')
  const drawingTarget = [...sheetRels.values()].find((target) => target.includes('drawing'))
  const drawingFile = drawingTarget ? resolveZipPath(sheetFile, drawingTarget) : validateZipPath('xl/drawings/drawing1.xml')
  const drawingRelsFile = `${path.posix.dirname(drawingFile)}/_rels/${path.posix.basename(drawingFile)}.rels`
  const drawingXml = await zip.file(validateZipPath(drawingFile))?.async('string')
  const drawingRelsXml = await zip.file(validateZipPath(drawingRelsFile))?.async('string')

  if (!drawingXml || !drawingRelsXml) throw new Error('Could not find drawing XML relationships for embedded images')

  const anchoredImages = parseAnchoredImages(drawingXml, parseRelationships(drawingRelsXml), drawingFile)
  const imagesByCell = new Map(anchoredImages.map((image) => [`${image.rowNumber}:${image.columnNumber}`, image.mediaPath]))
  const products = []
  let productNumber = 1

  for (const rowNumber of [...rows.keys()].sort((a, b) => a - b)) {
    if (rowNumber === 1) continue
    const row = rows.get(rowNumber)
    const nameAr = row.get('B') || [...row.entries()].find(([column]) => columnLettersToIndex(column) === nameColumn)?.[1]
    if (!nameAr) continue

    const squareMediaPath = imagesByCell.get(`${rowNumber}:${squareColumn}`)
    if (!squareMediaPath) {
      console.warn(`Skipping row ${rowNumber}: no image in "${REQUIRED_COLUMNS.square}"`)
      continue
    }

    const productId = `product-${padProductNumber(productNumber)}`
    const squareBuffer = await zip.file(validateZipPath(squareMediaPath))?.async('nodebuffer')
    const portraitMediaPath = portraitColumn ? imagesByCell.get(`${rowNumber}:${portraitColumn}`) : null
    const portraitBuffer = portraitMediaPath ? await zip.file(validateZipPath(portraitMediaPath))?.async('nodebuffer') : null

    const [squarePath] = await Promise.all([
      saveWebp(squareBuffer, `${productId}-1080.webp`),
      portraitBuffer ? saveWebp(portraitBuffer, `${productId}-1350.webp`) : Promise.resolve(null),
    ])
    products.push(buildProduct({ productNumber, nameAr, squarePath }))
    productNumber += 1
  }

  return products
}

async function writeGeneratedProducts(products) {
  await fs.writeFile(
    generatedFile,
    `export const generatedProducts = ${JSON.stringify(products, null, 2)}\n`,
    'utf8',
  )
}

async function main() {
  await prepareOutput()

  let products
  try {
    products = await importWithExcelJs()
  } catch (error) {
    console.warn(`ExcelJS direct import failed: ${error.message}`)
    console.warn('Falling back to XLSX drawing XML extraction.')
    products = await importWithZipFallback()
  }

  await writeGeneratedProducts(products)
  console.log(`Imported ${products.length} products from src/data/products.xlsx`)
  console.log(`Images: ${path.relative(rootDir, outputDir)}`)
  console.log(`Data: ${path.relative(rootDir, generatedFile)}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
