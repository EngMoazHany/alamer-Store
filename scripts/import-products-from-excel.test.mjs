import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import JSZip from 'jszip'
import sharp from 'sharp'
import { importProducts } from './import-products-from-excel.mjs'

const namespaces = {
  sheet: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
  drawing: 'http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing',
  graphic: 'http://schemas.openxmlformats.org/drawingml/2006/main',
  officeRels: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
  packageRels: 'http://schemas.openxmlformats.org/package/2006/relationships',
}

const escapeXml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

async function png(width = 16, height = 16, color = '#ff0000') {
  return sharp({ create: { width, height, channels: 3, background: color } }).png().toBuffer()
}

async function setup(t) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'product-import-test-'))
  t.after(() => fs.rm(directory, { recursive: true, force: true }))
  const warnings = []
  return {
    inputFile: path.join(directory, 'products.xlsx'),
    outputDir: path.join(directory, 'images'),
    generatedFile: path.join(directory, 'generatedProducts.js'),
    warnings,
    logger: { log() {}, info() {}, warn: (...parts) => warnings.push(parts.join(' ')), error() {} },
  }
}

// These fixtures deliberately use sheet7, a non-product first sheet, shifted
// columns, and relationship prefixes unrelated to those emitted by Excel.
async function writeWorkbook(inputFile, {
  defaultNamespaces = false,
  headerRow = 3,
  rows = [],
  images = [],
  sharedStrings = [],
} = {}) {
  const zip = new JSZip()
  const sp = defaultNamespaces ? '' : 'spread:'
  const dp = defaultNamespaces ? '' : 'position:'
  const rp = defaultNamespaces ? '' : 'ns0:'
  const declare = (prefix, namespace) => `xmlns${prefix ? `:${prefix.slice(0, -1)}` : ''}="${namespace}"`
  const sheetNs = `${declare(sp, namespaces.sheet)} xmlns:links="${namespaces.officeRels}"`
  const drawingNs = `${declare(dp, namespaces.drawing)} xmlns:art="${namespaces.graphic}" xmlns:links="${namespaces.officeRels}"`
  const relationships = (entries) => `<${rp}Relationships ${declare(rp, namespaces.packageRels)}>${entries.map(({ id, target, type }) => `<${rp}Relationship Id="${id}" Target="${target}" Type="${namespaces.officeRels}/${type}"/>`).join('')}</${rp}Relationships>`
  const inline = (ref, text) => `<${sp}c r="${ref}" t="inlineStr"><${sp}is><${sp}t>${escapeXml(text)}</${sp}t></${sp}is></${sp}c>`
  const headerCells = [
    ['A', 'Original Product Image'],
    ['B', 'Product Name Arabic'],
    ['E', 'Final Ad Design 1080x1080'],
    ['H', 'Final Ad Design 1080x1350'],
  ].map(([column, text]) => inline(`${column}${headerRow}`, text)).join('')
  const rowXml = rows.map(({ rowNumber, name, sharedIndex, rich = false }) => {
    let nameCell = ''
    if (sharedIndex !== undefined) {
      nameCell = `<${sp}c r="B${rowNumber}" t="s"><${sp}v>${sharedIndex}</${sp}v></${sp}c>`
    } else if (name !== undefined) {
      nameCell = rich
        ? `<${sp}c r="B${rowNumber}" t="inlineStr"><${sp}is><${sp}r><${sp}t>${escapeXml(name.slice(0, 2))}</${sp}t></${sp}r><${sp}r><${sp}t xml:space="preserve">${escapeXml(name.slice(2))}</${sp}t></${sp}r></${sp}is></${sp}c>`
        : inline(`B${rowNumber}`, name)
    }
    // The self-closing A cell exposed the old regex parser swallowing B's value.
    return `<${sp}row r="${rowNumber}"><${sp}c r="A${rowNumber}" s="1"/>${nameCell}<${sp}c r="H${rowNumber}" s="1"/></${sp}row>`
  }).join('')

  zip.file('[Content_Types].xml', '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="png" ContentType="image/png"/></Types>')
  zip.file('_rels/.rels', relationships([{ id: 'rootWorkbook', target: 'xl/workbook.xml', type: 'officeDocument' }]))
  zip.file('xl/workbook.xml', `<${sp}workbook ${sheetNs}><${sp}sheets><${sp}sheet name="Instructions" sheetId="1" links:id="notes"/><${sp}sheet name="Final Ads" sheetId="7" links:id="products"/></${sp}sheets></${sp}workbook>`)
  zip.file('xl/_rels/workbook.xml.rels', relationships([
    { id: 'notes', target: 'worksheets/sheet2.xml', type: 'worksheet' },
    { id: 'products', target: '/xl/worksheets/sheet7.xml', type: 'worksheet' },
    { id: 'strings', target: 'sharedStrings.xml', type: 'sharedStrings' },
  ]))
  zip.file('xl/worksheets/sheet2.xml', `<${sp}worksheet ${sheetNs}><${sp}sheetData><${sp}row r="1">${inline('A1', 'Instructions only')}</${sp}row></${sp}sheetData></${sp}worksheet>`)
  zip.file('xl/worksheets/sheet7.xml', `<${sp}worksheet ${sheetNs}><${sp}sheetData><${sp}row r="1">${inline('A1', 'Product catalog')}</${sp}row><${sp}row r="${headerRow}">${headerCells}</${sp}row>${rowXml}</${sp}sheetData><${sp}drawing links:id="artwork"/></${sp}worksheet>`)
  zip.file('xl/worksheets/_rels/sheet7.xml.rels', relationships([{ id: 'artwork', target: '../drawings/drawing9.xml', type: 'drawing' }]))
  zip.file('xl/sharedStrings.xml', `<${sp}sst ${declare(sp, namespaces.sheet)} count="${sharedStrings.length}" uniqueCount="${sharedStrings.length}">${sharedStrings.map((runs) => `<${sp}si>${runs.map((run) => `<${sp}r><${sp}t xml:space="preserve">${escapeXml(run)}</${sp}t></${sp}r>`).join('')}</${sp}si>`).join('')}</${sp}sst>`)
  const drawingRels = []
  const anchors = images.map(({ rowNumber, column = 4, buffer, kind = 'twoCellAnchor', absolute = false }, index) => {
    const id = `imageReference${index}`
    const fileName = `artwork${index}.png`
    drawingRels.push({ id, target: absolute ? `/xl/media/${fileName}` : `../media/${fileName}`, type: 'image' })
    if (buffer) zip.file(`xl/media/${fileName}`, buffer)
    const marker = (tag, col, row) => `<${dp}${tag}><${dp}col>${col}</${dp}col><${dp}colOff>5000</${dp}colOff><${dp}row>${row}</${dp}row><${dp}rowOff>5000</${dp}rowOff></${dp}${tag}>`
    const end = kind === 'twoCellAnchor' ? marker('to', column + 1, rowNumber) : `<${dp}ext cx="152400" cy="152400"/>`
    return `<${dp}${kind}${kind === 'twoCellAnchor' ? ' editAs="oneCell"' : ''}>${marker('from', column, rowNumber - 1)}${end}<${dp}pic><${dp}nvPicPr><${dp}cNvPr id="${index + 1}" name="Picture ${index + 1}"/><${dp}cNvPicPr/></${dp}nvPicPr><${dp}blipFill><art:blip links:embed="${id}"/><art:stretch><art:fillRect/></art:stretch></${dp}blipFill><${dp}spPr/></${dp}pic><${dp}clientData/></${dp}${kind}>`
  }).join('')
  zip.file('xl/drawings/drawing9.xml', `<${dp}wsDr ${drawingNs}>${anchors}</${dp}wsDr>`)
  zip.file('xl/drawings/_rels/drawing9.xml.rels', relationships(drawingRels))
  await fs.writeFile(inputFile, await zip.generateAsync({ type: 'nodebuffer' }))
}

for (const defaultNamespaces of [false, true]) {
  test(`imports names and square ads using ${defaultNamespaces ? 'default' : 'arbitrary prefixed'} XML namespaces`, async (t) => {
    const options = await setup(t)
    const original = await png(16, 16, '#00ff00')
    const square = await png(16, 16, '#ff0000')
    const portrait = await png(16, 24, '#0000ff')
    await writeWorkbook(options.inputFile, {
      defaultNamespaces,
      rows: [
        { rowNumber: 4, name: 'طقم & كوب <أحمر>', rich: true },
        { rowNumber: 5, sharedIndex: 0 },
      ],
      sharedStrings: [['كوب ', '& زجاج ', 'AB-12']],
      images: [4, 5].flatMap((rowNumber) => [
        { rowNumber, column: 0, buffer: original },
        { rowNumber, column: 4, buffer: square, kind: rowNumber === 4 ? 'oneCellAnchor' : 'twoCellAnchor', absolute: true },
        { rowNumber, column: 7, buffer: portrait },
      ]),
    })
    const { products, stats } = await importProducts(options)
    assert.equal(stats.sheetName, 'Final Ads')
    assert.equal(stats.rowsFound, 2)
    assert.equal(stats.embeddedImages, 6)
    assert.equal(stats.squareImagesMapped, 2)
    assert.deepEqual(stats.skippedRows, [])
    assert.deepEqual(products.map((product) => product.nameAr), ['طقم & كوب <أحمر>', 'كوب & زجاج AB-12'])
    assert.equal(new Set(products.map((product) => product.id)).size, 2)
    for (const [index, product] of products.entries()) {
      for (const field of ['id', 'nameAr', 'nameEn', 'categoryAr', 'categoryEn', 'image']) assert.ok(product[field], `Missing ${field}`)
      assert.equal(product.source, 'excel-final-ad')
      assert.equal(product.image, `/products/excel/product-${String(index + 1).padStart(3, '0')}-1080.webp`)
      const file = path.join(options.outputDir, path.posix.basename(product.image))
      // Buffer input avoids libvips retaining Windows file handles after reads.
      const bytes = await fs.readFile(file)
      const metadata = await sharp(bytes).metadata()
      assert.equal(metadata.format, 'webp')
      assert.equal(metadata.width, metadata.height)
      const { data } = await sharp(bytes).removeAlpha().raw().toBuffer({ resolveWithObject: true })
      assert.ok(data[0] > 200 && data[1] < 40 && data[2] < 40, 'Must choose the red final ad, not the green original or blue portrait')
    }
    const generated = await fs.readFile(options.generatedFile, 'utf8')
    assert.ok(generated.includes('excel-final-ad'))
    assert.ok(generated.includes('/products/excel/product-001-1080.webp'))
  })
}

test('bad images and incomplete rows warn and skip without losing later products', async (t) => {
  const options = await setup(t)
  const square = await png()
  await writeWorkbook(options.inputFile, {
    rows: [
      { rowNumber: 4, name: 'First valid product' },
      { rowNumber: 5, name: 'Corrupt image' },
      { rowNumber: 6, name: 'Missing image binary' },
      { rowNumber: 7, name: 'Portrait in square column' },
      { rowNumber: 8 },
      { rowNumber: 9, name: 'No drawing for this row' },
      { rowNumber: 10, name: 'Last valid product' },
    ],
    images: [
      { rowNumber: 4, buffer: square },
      { rowNumber: 5, buffer: Buffer.from('not an image') },
      { rowNumber: 6 },
      { rowNumber: 7, buffer: await png(16, 24) },
      { rowNumber: 8, buffer: square },
      { rowNumber: 10, buffer: square, kind: 'oneCellAnchor' },
    ],
  })
  const { products, stats } = await importProducts(options)
  assert.deepEqual(products.map((product) => product.nameAr), ['First valid product', 'Last valid product'])
  assert.deepEqual(stats.skippedRows.map(({ rowNumber }) => rowNumber).sort((a, b) => a - b), [5, 6, 7, 8, 9])
  for (const { rowNumber, reason } of stats.skippedRows) {
    assert.ok(reason.trim(), `Missing skip reason for row ${rowNumber}`)
    assert.ok(options.warnings.some((warning) => warning.includes(String(rowNumber))), `Missing warning for row ${rowNumber}`)
  }
  for (const product of products) await fs.access(path.join(options.outputDir, path.posix.basename(product.image)))
})

test('zero valid products rejects and preserves the previous catalog and images', async (t) => {
  const options = await setup(t)
  await fs.mkdir(options.outputDir, { recursive: true })
  const previousData = 'export const products = [{ id: "previous" }]\n'
  const previousImage = Buffer.from('previous image contents')
  const imageFile = path.join(options.outputDir, 'product-001-1080.webp')
  await fs.writeFile(options.generatedFile, previousData)
  await fs.writeFile(imageFile, previousImage)
  await writeWorkbook(options.inputFile, {
    rows: [{ rowNumber: 4, name: 'Broken product' }],
    images: [{ rowNumber: 4, buffer: Buffer.from('broken image') }],
  })
  await assert.rejects(importProducts(options), /(?:no|zero|0)\s+(?:valid\s+)?products/i)
  assert.equal(await fs.readFile(options.generatedFile, 'utf8'), previousData)
  assert.deepEqual(await fs.readFile(imageFile), previousImage)
  assert.deepEqual(await fs.readdir(options.outputDir), ['product-001-1080.webp'])
})
