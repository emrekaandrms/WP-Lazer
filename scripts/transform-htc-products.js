#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const DEFAULT_INPUT = '/Users/emrekaandurmus/Downloads/HTC Lazer - Ürünler.csv'
const PRODUCT_JSON = path.join(__dirname, '..', 'content', 'products', 'products.json')
const NORMALIZED_CSV = path.join(__dirname, '..', 'content', 'imports', 'htc-lazer-products.normalized.csv')

const categories = {
  protectiveGlass: {
    id: 'cat-koruma-camlari',
    databaseId: 201,
    name: 'Koruma Camları',
    slug: 'koruma-camlari',
    description: 'Fiber lazer kesim ve kaynak kafaları için lens koruma camları.',
  },
  ceramic: {
    id: 'cat-seramikler',
    databaseId: 202,
    name: 'Seramikler',
    slug: 'seramikler',
    description: 'Precitec, Raytools, Nukon, HighYag ve Bystronic uyumlu seramik sarf malzemeleri.',
  },
  nozzle: {
    id: 'cat-nozullar',
    databaseId: 203,
    name: 'Nozullar',
    slug: 'nozullar',
    description: 'Single, double ve fast cut lazer kesim nozulları.',
  },
  lens: {
    id: 'cat-lensler',
    databaseId: 204,
    name: 'Lensler',
    slug: 'lensler',
    description: 'Kolimatör, odak ve kaynak lazer lensleri.',
  },
  welding: {
    id: 'cat-lazer-kaynak',
    databaseId: 205,
    name: 'Lazer Kaynak Sarfları',
    slug: 'lazer-kaynak',
    description: 'Lazer kaynak makineleri için lens, cam ve sarf malzemeleri.',
  },
}

const entityMap = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '-',
  mdash: '-',
  hellip: '...',
  lsquo: "'",
  rsquo: "'",
  ldquo: '"',
  rdquo: '"',
  Ccedil: 'Ç',
  ccedil: 'ç',
  Uuml: 'Ü',
  uuml: 'ü',
  Ouml: 'Ö',
  ouml: 'ö',
  Iuml: 'İ',
  iuml: 'ï',
  Scedil: 'Ş',
  scedil: 'ş',
  Gbreve: 'Ğ',
  gbreve: 'ğ',
  Oslash: 'Ø',
  oslash: 'ø',
}

function decodeEntities(value) {
  let decoded = String(value || '')
  for (let i = 0; i < 5; i++) {
    const next = decoded
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
      .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
      .replace(/&([a-zA-Z]+);/g, (match, entity) => entityMap[entity] || match)
    if (next === decoded) return decoded
    decoded = next
  }
  return decoded
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

  const headers = rows.shift().map((header) => header.trim())
  return rows
    .filter((cells) => cells.some((cell) => String(cell || '').trim()))
    .map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ''])))
}

function stripHtml(value) {
  return decodeEntities(value)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function slugify(value) {
  return decodeEntities(value)
    .toLocaleLowerCase('tr')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parsePrice(value) {
  const parsed = Number.parseFloat(String(value || '0').replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
}

function parseQuantity(value) {
  const parsed = Number.parseInt(String(value || '0'), 10)
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

function inferCategory(row) {
  const name = decodeEntities(row.name).toLocaleLowerCase('tr')
  const manufacturer = decodeEntities(row.manufacturer_name).toLocaleLowerCase('tr')

  if (name.includes('nozzle') || name.includes('nozul')) return categories.nozzle
  if (name.includes('seramik')) return categories.ceramic
  if (name.includes('koruma cam')) {
    if (name.includes('kaynak') || manufacturer.includes('kaynak')) return categories.welding
    return categories.protectiveGlass
  }
  if (name.includes('lens')) {
    if (name.includes('kaynak') || manufacturer.includes('kaynak')) return categories.welding
    return categories.lens
  }
  if (manufacturer.includes('kaynak')) return categories.welding
  return categories.protectiveGlass
}

const specBoundaryLabels = [
  'Dış Çap',
  'İç Çap',
  'Vida Çapı/Diş',
  'Yükseklik',
  'Kalınlık',
  'Odak Kırılma Noktası',
  'Kaplama',
  'Yansıma Yüzeyi',
  'Yüzey Kalitesi',
  'Max Güç',
  'Maksimum Güç',
  'Menşe Ülke',
  'Kullanılan Makina Markaları',
  'Kullanılan Makine Modelleri',
  'Kullanılan RayTools Kafa Modelleri',
  'Kullanılan Kafa Modelleri',
  'Uyumlu Olduğu Kafa',
]

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function extractSpec(description, labels) {
  const labelPattern = labels.map(escapeRegex).join('|')
  const boundaryPattern = specBoundaryLabels.map(escapeRegex).join('|')
  const pattern = new RegExp(
    `(?:${labelPattern})\\s*:\\s*([\\s\\S]*?)(?=\\s+(?:${boundaryPattern})\\s*:|\\s+['"]?LAZER ONLINE|$)`,
    'i'
  )
  const match = description.match(pattern)
  return match?.[1]?.trim().replace(/[.;,\s]+$/g, '') || ''
}

function buildAttributes(row, description) {
  const attributes = [
    { name: 'brand', label: 'Marka', value: decodeEntities(row.manufacturer_name || 'Lazer Online') },
    { name: 'model', label: 'Model', value: row.model },
    { name: 'currency', label: 'Para Birimi', value: row.price_code === 'EUR' ? 'EUR' : 'TL' },
  ]

  const specs = [
    ['outer-diameter', 'Dış Çap', ['Dış Çap']],
    ['inner-diameter', 'İç Çap', ['İç Çap']],
    ['thickness', 'Kalınlık', ['Kalınlık']],
    ['focus-point', 'Odak', ['Odak Kırılma Noktası']],
    ['coating', 'Kaplama', ['Kaplama']],
    ['reflection-surface', 'Yansıma Yüzeyi', ['Yansıma Yüzeyi']],
    ['surface-quality', 'Yüzey Kalitesi', ['Yüzey Kalitesi']],
    ['max-power', 'Max Güç', ['Max Güç', 'Maksimum Güç']],
    ['origin', 'Menşe', ['Menşe Ülke']],
  ]

  for (const [name, label, labels] of specs) {
    const value = extractSpec(description, labels)
    if (value) attributes.push({ name, label, value })
  }

  return attributes
}

function buildKeywords(row, category) {
  const raw = `${row.meta_keyword || ''}, ${row.name || ''}, ${row.model || ''}, ${row.manufacturer_name || ''}, ${category.name}`
  return Array.from(
    new Set(
      decodeEntities(raw)
        .split(/[,\s/]+/)
        .map((keyword) => keyword.trim().toLocaleLowerCase('tr'))
        .filter((keyword) => keyword.length > 2)
    )
  ).slice(0, 24)
}

function toProduct(row, index) {
  const name = decodeEntities(row.name).trim()
  const description = stripHtml(row.description)
  const category = inferCategory(row)
  const price = parsePrice(row.price)
  const quantity = parseQuantity(row.quantity)
  const active = row.status === '1'
  const slug = slugify(`${name}-${row.model}`)
  const currencyCode = row.price_code === 'EUR' ? 'EUR' : 'TRY'
  const keywords = buildKeywords(row, category)

  return {
    id: `htc-${row.product_id || index + 1}`,
    databaseId: Number(row.product_id) || 2000 + index,
    sourceProductId: row.product_id,
    model: row.model,
    name,
    slug,
    description: description || `${name} için Lazer Online eski mağaza verisinden aktarılan ürün kaydı.`,
    shortDescription: decodeEntities(row.meta_description || name),
    regularPrice: price.toFixed(2),
    price: price.toFixed(2),
    priceTax: String(row.price_tax || '').replace(',', '.'),
    currencyCode,
    stockStatus: active && quantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
    stockQuantity: quantity,
    sku: row.model || `HTC-${row.product_id}`,
    status: active ? 'publish' : 'draft',
    manufacturer: decodeEntities(row.manufacturer_name || ''),
    keywords,
    sourceUrl: row.link,
    image: row.image_link ? { sourceUrl: row.image_link, altText: name } : undefined,
    categories: { nodes: [category] },
    attributes: { nodes: buildAttributes(row, description) },
  }
}

function csvEscape(value) {
  const text = String(value ?? '')
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

function writeNormalizedCsv(products) {
  const headers = [
    'sku',
    'name',
    'slug',
    'description',
    'shortDescription',
    'regularPrice',
    'stockQuantity',
    'stockStatus',
    'categoryPath',
    'brand',
    'attributes',
    'mainImageUrl',
    'galleryImageUrls',
    'seoTitle',
    'seoDescription',
    'sourceUrl',
    'currencyCode',
    'keywords',
    'status',
  ]

  const rows = products.map((product) => ({
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription,
    regularPrice: product.regularPrice,
    stockQuantity: product.stockQuantity,
    stockStatus: product.stockStatus === 'IN_STOCK' ? 'instock' : 'outofstock',
    categoryPath: product.categories.nodes[0].name,
    brand: product.manufacturer,
    attributes: product.attributes.nodes.map((item) => `${item.label}:${item.value}`).join('|'),
    mainImageUrl: product.image?.sourceUrl || '',
    galleryImageUrls: '',
    seoTitle: `${product.name} | Lazer Online`,
    seoDescription: product.shortDescription,
    sourceUrl: product.sourceUrl,
    currencyCode: product.currencyCode,
    keywords: product.keywords.join('|'),
    status: product.status,
  }))

  return [headers.join(','), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(','))].join('\n')
}

function main() {
  const input = process.argv[2] || DEFAULT_INPUT
  const source = fs.readFileSync(input, 'utf8')
  const rows = parseCsv(source)
  const products = rows.map(toProduct)

  fs.mkdirSync(path.dirname(PRODUCT_JSON), { recursive: true })
  fs.mkdirSync(path.dirname(NORMALIZED_CSV), { recursive: true })
  fs.writeFileSync(PRODUCT_JSON, `${JSON.stringify({ generatedAt: new Date().toISOString(), source: input, products }, null, 2)}\n`)
  fs.writeFileSync(NORMALIZED_CSV, `${writeNormalizedCsv(products)}\n`)

  const active = products.filter((product) => product.status === 'publish').length
  const draft = products.length - active
  console.log(`Transformed ${products.length} products: ${active} publish, ${draft} draft.`)
  console.log(`Wrote ${PRODUCT_JSON}`)
  console.log(`Wrote ${NORMALIZED_CSV}`)
}

main()
