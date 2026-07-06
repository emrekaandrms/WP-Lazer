#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const rootDir = path.join(__dirname, '..')
const contentDir = path.join(rootDir, 'content')
const publicDir = path.join(rootDir, 'frontend', 'public')
const merchantDir = path.join(publicDir, 'merchant')

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function xmlEscape(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&uuml;/g, 'ü')
    .replace(/&Uuml;/g, 'Ü')
    .replace(/&ouml;/g, 'ö')
    .replace(/&Ouml;/g, 'Ö')
    .replace(/&ccedil;/g, 'ç')
    .replace(/&Ccedil;/g, 'Ç')
    .replace(/&ş/g, 'ş')
    .replace(/&Ş/g, 'Ş')
    .replace(/\s+/g, ' ')
    .trim()
}

function canonicalPath(route) {
  if (!route || route === '/') return '/'
  return route.endsWith('/') ? route : `${route}/`
}

function absoluteUrl(siteUrl, route) {
  return `${siteUrl.replace(/\/$/, '')}${canonicalPath(route)}`
}

function parsePrice(value) {
  const parsed = Number.parseFloat(String(value || '').replace(/<[^>]*>/g, '').replace(/[^0-9.,-]/g, '').replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---/)
  if (!match) return {}

  const frontmatter = {}
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':')
    if (colon === -1 || /^\s/.test(line)) continue
    const key = line.slice(0, colon).trim()
    const value = line.slice(colon + 1).trim().replace(/^['"]|['"]$/g, '')
    frontmatter[key] = value
  }
  return frontmatter
}

function getMarkdownRoutes(kind, routePrefix) {
  const dir = path.join(contentDir, kind)
  if (!fs.existsSync(dir)) return []

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8')
      const frontmatter = parseFrontmatter(raw)
      const slug = frontmatter.slug || file.replace(/\.md$/, '')
      return {
        loc: `${routePrefix}/${slug}`,
        lastmod: (frontmatter.lastModified || '').slice(0, 10) || undefined,
      }
    })
}

function assetUrl(siteUrl, src) {
  if (!src) return ''
  return /^https?:\/\//.test(src) ? src : `${siteUrl.replace(/\/$/, '')}${src}`
}

function productImages(siteUrl, product) {
  const list = []
  if (product.image?.sourceUrl) list.push(assetUrl(siteUrl, product.image.sourceUrl))
  for (const node of product.galleryImages?.nodes || []) {
    if (node?.sourceUrl) list.push(assetUrl(siteUrl, node.sourceUrl))
  }
  return Array.from(new Set(list))
}

function buildSitemap(siteUrl, products) {
  const today = new Date().toISOString().slice(0, 10)
  const categories = new Map()

  for (const product of products) {
    for (const category of product.categories?.nodes || []) {
      if (category?.slug) categories.set(category.slug, category)
    }
  }

  const guides = (readJson(path.join(contentDir, 'guides', 'guides.json'), { guides: [] }).guides) || []
  const brands = (readJson(path.join(contentDir, 'brands.json'), { brands: [] }).brands) || []

  const routes = [
    { loc: '/', priority: '1.0' },
    { loc: '/products', priority: '0.9' },
    { loc: '/categories', priority: '0.8' },
    { loc: '/rehber', priority: '0.7' },
    { loc: '/siparis-takibi', priority: '0.5' },
    ...Array.from(categories.values()).map((category) => ({ loc: `/category/${category.slug}`, priority: '0.8' })),
    ...brands.map((brand) => ({ loc: `/marka/${brand.slug}`, priority: '0.7' })),
    ...products.map((product) => ({ loc: `/product/${product.slug}`, priority: '0.9', images: productImages(siteUrl, product) })),
    ...guides.map((guide) => ({ loc: `/rehber/${guide.slug}`, priority: '0.6', lastmod: (guide.updated || '').slice(0, 10) || undefined })),
    ...getMarkdownRoutes('pages', '/page').map((route) => ({ ...route, priority: '0.6' })),
    ...getMarkdownRoutes('policies', '/policy').map((route) => ({ ...route, priority: '0.4' })),
  ]

  const unique = new Map()
  for (const route of routes) {
    unique.set(canonicalPath(route.loc), route)
  }

  const body = Array.from(unique.entries())
    .map(([loc, route]) => {
      const lastmod = route.lastmod || today
      const images = (route.images || [])
        .map((img) => `    <image:image>\n      <image:loc>${xmlEscape(img)}</image:loc>\n    </image:image>`)
        .join('\n')
      return [
        '  <url>',
        `    <loc>${xmlEscape(absoluteUrl(siteUrl, loc))}</loc>`,
        `    <lastmod>${xmlEscape(lastmod)}</lastmod>`,
        '    <changefreq>weekly</changefreq>',
        `    <priority>${route.priority || '0.5'}</priority>`,
        images || null,
        '  </url>',
      ].filter((line) => line !== null).join('\n')
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${body}\n</urlset>\n`
}

function buildRobots(siteUrl) {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /wp-admin/',
    'Disallow: /wp-login.php',
    'Disallow: /my-account/',
    'Disallow: /orders/',
    'Disallow: /addresses/',
    'Disallow: /checkout/',
    '',
    `Sitemap: ${absoluteUrl(siteUrl, '/sitemap.xml').replace(/\/$/, '')}`,
    '',
  ].join('\n')
}

function buildMerchantFeed(siteUrl, siteName, products) {
  const items = []
  const missingIdentifiers = []

  for (const product of products) {
    const price = parsePrice(product.price)
    if (!product.slug || !price || !product.image?.sourceUrl) continue

    if (!product.sku) missingIdentifiers.push(product.slug)

    const category = product.categories?.nodes?.[0]
    const description =
      stripHtml(product.shortDescription || product.description) ||
      `${product.name} fiber lazer sarf malzemesi.`
    const availability = product.stockStatus === 'OUT_OF_STOCK' ? 'out of stock' : 'in stock'
    const additionalImages = (product.galleryImages?.nodes || [])
      .map((node) => assetUrl(siteUrl, node?.sourceUrl))
      .filter((url) => url && url !== product.image.sourceUrl)
      .slice(0, 10)

    items.push([
      '    <item>',
      `      <g:id>${xmlEscape(product.sku || product.id)}</g:id>`,
      `      <g:title>${xmlEscape(product.name)}</g:title>`,
      `      <g:description>${xmlEscape(description.slice(0, 5000))}</g:description>`,
      `      <g:link>${xmlEscape(absoluteUrl(siteUrl, `/product/${product.slug}`))}</g:link>`,
      `      <g:image_link>${xmlEscape(product.image.sourceUrl)}</g:image_link>`,
      ...additionalImages.map((url) => `      <g:additional_image_link>${xmlEscape(url)}</g:additional_image_link>`),
      `      <g:availability>${availability}</g:availability>`,
      `      <g:price>${price.toFixed(2)} ${xmlEscape(product.currencyCode || 'TRY')}</g:price>`,
      '      <g:condition>new</g:condition>',
      `      <g:brand>${xmlEscape(product.manufacturer || siteName)}</g:brand>`,
      product.model || product.sku ? `      <g:mpn>${xmlEscape(product.model || product.sku)}</g:mpn>` : '',
      '      <g:shipping>',
      '        <g:country>TR</g:country>',
      '        <g:price>0 TRY</g:price>',
      '      </g:shipping>',
      category?.name ? `      <g:product_type>${xmlEscape(category.name)}</g:product_type>` : '',
      '    </item>',
    ].filter(Boolean).join('\n'))
  }

  if (missingIdentifiers.length) {
    console.warn(`Merchant feed: ${missingIdentifiers.length} product(s) missing SKU identifier.`)
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n  <channel>\n    <title>${xmlEscape(siteName)}</title>\n    <link>${xmlEscape(siteUrl)}</link>\n    <description>${xmlEscape(`${siteName} ürün kataloğu`)}</description>\n${items.join('\n')}\n  </channel>\n</rss>\n`
}

function main() {
  const settings = readJson(path.join(contentDir, 'settings', 'site.json'), {})
  const productData = readJson(path.join(contentDir, 'products', 'products.json'), { products: [] })
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || settings.siteUrl || 'https://lazeronline.com.tr').replace(/\/$/, '')
  const siteName = settings.siteName || 'Lazer Online'
  const products = (productData.products || []).filter((product) => product.status !== 'draft')

  ensureDir(publicDir)
  ensureDir(merchantDir)

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), buildSitemap(siteUrl, products))
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), buildRobots(siteUrl))
  fs.writeFileSync(path.join(merchantDir, 'google-products.xml'), buildMerchantFeed(siteUrl, siteName, products))

  console.log(`Generated SEO assets for ${products.length} products.`)
}

main()
