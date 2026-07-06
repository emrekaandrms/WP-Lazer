#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const readXlsxFile = require('read-excel-file/node')

const REQUIRED_COLUMNS = ['sku', 'name', 'regularPrice', 'categoryPath']

function usage() {
  console.log(`
Usage:
  node scripts/import-products.js <products.xlsx|products.csv> [--apply]

Environment for --apply:
  WOO_REST_URL=https://example.com/wp-json/wc/v3
  WOO_CONSUMER_KEY=ck_...
  WOO_CONSUMER_SECRET=cs_...

Required columns:
  ${REQUIRED_COLUMNS.join(', ')}

Optional columns:
  slug, description, shortDescription, salePrice, stockQuantity, stockStatus,
  brand, attributes, mainImageUrl, galleryImageUrls, seoTitle, seoDescription,
  sourceUrl, currencyCode, status

Currency note:
  WooCommerce has one store currency. Rows with currencyCode=EUR require
  WOO_EUR_TRY_RATE during --apply so prices can be converted for a TRY store.
`)
}

function parseArgs() {
  const args = process.argv.slice(2)
  const file = args.find((arg) => !arg.startsWith('--'))
  return {
    file,
    apply: args.includes('--apply'),
  }
}

function normalizeHeader(value) {
  return String(value || '').trim()
}

function normalizeRow(row) {
  const normalized = {}
  for (const [key, value] of Object.entries(row)) {
    normalized[normalizeHeader(key)] = typeof value === 'string' ? value.trim() : value
  }
  return normalized
}

async function readWorkbook(filePath) {
  const ext = path.extname(filePath).toLowerCase()

  if (ext === '.csv') {
    return tableToRows(parseCsv(fs.readFileSync(filePath, 'utf8')))
  }

  if (ext === '.xlsx') {
    return tableToRows(await readXlsxFile(filePath))
  }

  throw new Error('Only .xlsx and .csv files are supported.')
}

function parseCsv(content) {
  const rows = []
  let row = []
  let value = ''
  let quoted = false

  for (let i = 0; i < content.length; i++) {
    const char = content[i]
    const next = content[i + 1]

    if (quoted) {
      if (char === '"' && next === '"') {
        value += '"'
        i++
      } else if (char === '"') {
        quoted = false
      } else {
        value += char
      }
      continue
    }

    if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(value)
      value = ''
    } else if (char === '\n') {
      row.push(value)
      rows.push(row)
      row = []
      value = ''
    } else if (char !== '\r') {
      value += char
    }
  }

  if (value || row.length) {
    row.push(value)
    rows.push(row)
  }

  return rows
}

function tableToRows(table) {
  if (!table || table.length === 0) return []

  const headers = table[0].map(normalizeHeader)

  const rows = []
  table.slice(1).forEach((row) => {
    const record = {}
    headers.forEach((header, index) => {
      if (!header) return
      record[header] = row[index] === null || row[index] === undefined ? '' : String(row[index])
    })
    if (Object.values(record).some((value) => String(value || '').trim())) {
      rows.push(normalizeRow(record))
    }
  })

  return rows
}

function validateRows(rows) {
  const errors = []
  rows.forEach((row, index) => {
    for (const column of REQUIRED_COLUMNS) {
      if (!row[column]) {
        errors.push(`Row ${index + 2}: missing ${column}`)
      }
    }

    if (row.regularPrice && Number.isNaN(Number(row.regularPrice))) {
      errors.push(`Row ${index + 2}: regularPrice must be numeric`)
    }

    if (row.salePrice && Number.isNaN(Number(row.salePrice))) {
      errors.push(`Row ${index + 2}: salePrice must be numeric`)
    }
  })

  return errors
}

function splitList(value) {
  return String(value || '')
    .split(/[|,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseAttributes(value) {
  return splitList(value).map((pair) => {
    const [name, option] = pair.split(':').map((item) => item.trim())
    return {
      name,
      visible: true,
      options: option ? [option] : [],
    }
  }).filter((attribute) => attribute.name)
}

function getWooPrice(row) {
  const price = Number(row.regularPrice)
  if (row.currencyCode === 'EUR') {
    const rate = Number(process.env.WOO_EUR_TRY_RATE || 0)
    if (!rate) {
      throw new Error(`EUR product requires WOO_EUR_TRY_RATE: ${row.sku}`)
    }
    return (price * rate).toFixed(2)
  }
  return price.toFixed(2)
}

function normalizeWooStatus(value) {
  if (value === 'draft') return 'draft'
  if (value === 'private') return 'private'
  return 'publish'
}

async function ensureCategory(config, name) {
  const normalized = String(name || '').trim()
  if (!normalized) return null

  config.categoryCache ||= new Map()
  if (config.categoryCache.has(normalized)) return config.categoryCache.get(normalized)

  const existing = await wooRequest(config, 'GET', `/products/categories?search=${encodeURIComponent(normalized)}&per_page=100`)
  const match = Array.isArray(existing)
    ? existing.find((category) => category.name.toLocaleLowerCase('tr') === normalized.toLocaleLowerCase('tr'))
    : null

  if (match) {
    config.categoryCache.set(normalized, match.id)
    return match.id
  }

  const created = await wooRequest(config, 'POST', '/products/categories', { name: normalized })
  config.categoryCache.set(normalized, created.id)
  return created.id
}

async function toWooPayload(config, row) {
  const images = []
  if (row.mainImageUrl) images.push({ src: row.mainImageUrl })
  for (const url of splitList(row.galleryImageUrls)) {
    images.push({ src: url })
  }

  const categoryIds = []
  for (const name of splitList(row.categoryPath)) {
    const id = await ensureCategory(config, name)
    if (id) categoryIds.push({ id })
  }

  return {
    sku: row.sku,
    name: row.name,
    slug: row.slug || undefined,
    type: 'simple',
    status: normalizeWooStatus(row.status),
    regular_price: getWooPrice(row),
    sale_price: row.salePrice ? String(row.salePrice) : undefined,
    description: row.description || '',
    short_description: row.shortDescription || '',
    manage_stock: row.stockQuantity !== undefined && row.stockQuantity !== '',
    stock_quantity: row.stockQuantity ? Number(row.stockQuantity) : undefined,
    stock_status: row.stockStatus || 'instock',
    categories: categoryIds,
    images,
    attributes: parseAttributes(row.attributes),
    tags: splitList(row.keywords).map((name) => ({ name })),
    meta_data: [
      row.brand ? { key: 'brand', value: row.brand } : null,
      row.seoTitle ? { key: '_yoast_wpseo_title', value: row.seoTitle } : null,
      row.seoDescription ? { key: '_yoast_wpseo_metadesc', value: row.seoDescription } : null,
      row.sourceUrl ? { key: '_legacy_source_url', value: row.sourceUrl } : null,
      row.currencyCode ? { key: '_legacy_currency', value: row.currencyCode } : null,
      row.currencyCode === 'EUR' ? { key: '_legacy_regular_price', value: row.regularPrice } : null,
    ].filter(Boolean),
  }
}

function getWooConfig() {
  const baseUrl = process.env.WOO_REST_URL
  const key = process.env.WOO_CONSUMER_KEY
  const secret = process.env.WOO_CONSUMER_SECRET

  if (!baseUrl || !key || !secret) {
    throw new Error('WOO_REST_URL, WOO_CONSUMER_KEY and WOO_CONSUMER_SECRET are required for --apply')
  }

  return {
    baseUrl: baseUrl.replace(/\/+$/, ''),
    authHeader: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`,
  }
}

async function wooRequest(config, method, endpoint, payload) {
  const response = await fetch(`${config.baseUrl}${endpoint}`, {
    method,
    headers: {
      Authorization: config.authHeader,
      'Content-Type': 'application/json',
    },
    body: payload ? JSON.stringify(payload) : undefined,
  })

  const json = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(json.message || `WooCommerce request failed: ${response.status}`)
  }
  return json
}

async function findProductBySku(config, sku) {
  const results = await wooRequest(config, 'GET', `/products?sku=${encodeURIComponent(sku)}`)
  return Array.isArray(results) ? results[0] : null
}

async function importRows(rows) {
  const config = getWooConfig()
  const report = { created: 0, updated: 0, failed: [] }

  for (const row of rows) {
    try {
      const existing = await findProductBySku(config, row.sku)
      const payload = await toWooPayload(config, row)
      if (existing) {
        await wooRequest(config, 'PUT', `/products/${existing.id}`, payload)
        report.updated++
      } else {
        await wooRequest(config, 'POST', '/products', payload)
        report.created++
      }
    } catch (error) {
      report.failed.push({ sku: row.sku, error: error.message })
    }
  }

  return report
}

async function main() {
  const { file, apply } = parseArgs()
  if (!file) {
    usage()
    process.exit(1)
  }

  const filePath = path.resolve(file)
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`)
    process.exit(1)
  }

  const rows = await readWorkbook(filePath)
  const errors = validateRows(rows)

  if (errors.length) {
    console.error('Validation failed:')
    errors.forEach((error) => console.error(`  - ${error}`))
    process.exit(1)
  }

  console.log(`Validated ${rows.length} product rows.`)

  if (!apply) {
    console.log('Dry run only. Re-run with --apply to write to WooCommerce.')
    return
  }

  const report = await importRows(rows)
  console.log(JSON.stringify(report, null, 2))

  if (report.failed.length) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
