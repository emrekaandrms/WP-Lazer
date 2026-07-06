import fs from 'fs'
import path from 'path'
import { formatCurrencyAmount } from './money'

export type StaticImage = {
  sourceUrl: string
  altText?: string
}

export type StaticCategory = {
  id: string
  databaseId?: number
  name: string
  slug: string
  description?: string
  count?: number
  image?: StaticImage
}

export type StaticProduct = {
  id: string
  databaseId?: number
  sourceProductId?: string
  model?: string
  name: string
  slug: string
  description?: string
  shortDescription?: string
  regularPrice?: string
  salePrice?: string
  price?: string
  stockStatus?: string
  stockQuantity?: number
  sku?: string
  status?: string
  currencyCode?: string
  manufacturer?: string
  keywords?: string[]
  sourceUrl?: string
  priceTax?: string
  image?: StaticImage
  galleryImages?: { nodes: StaticImage[] }
  categories?: { nodes: StaticCategory[] }
  attributes?: {
    nodes: Array<{
      id?: string
      name: string
      label?: string
      value: string
    }>
  }
  related?: { nodes: StaticProduct[] }
}

export type StaticPage = {
  id: string
  title: string
  slug: string
  content?: string
  effectiveDate?: string
  version?: string
  seo?: {
    title?: string
    metaDesc?: string
    description?: string
  }
}

const fallbackCategories: StaticCategory[] = [
  { id: 'cat-bearings', databaseId: 101, name: 'Rulmanlar', slug: 'bearings', description: 'Hassas CNC rulmanları' },
  { id: 'cat-linear-rails', databaseId: 102, name: 'Lineer Raylar', slug: 'linear-rails', description: 'Lineer hareket sistemleri' },
  { id: 'cat-cnc-tools', databaseId: 103, name: 'CNC Takımlar', slug: 'cnc-tools', description: 'Kesici ve işleme takımları' },
  { id: 'cat-motors', databaseId: 104, name: 'Motorlar', slug: 'motors', description: 'Servo ve step motorlar' },
  { id: 'cat-controllers', databaseId: 105, name: 'Kontrolcüler', slug: 'controllers', description: 'CNC kontrol ekipmanları' },
]

const fallbackProducts: StaticProduct[] = [
  {
    id: 'product-6205-2rs',
    databaseId: 1001,
    name: '6205-2RS Derin Oluklu Rulman',
    slug: '6205-2rs',
    description: 'Yüksek hızlı CNC uygulamaları için hassas derin oluklu rulman.',
    price: '42.50',
    regularPrice: '42.50',
    stockStatus: 'IN_STOCK',
    stockQuantity: 24,
    sku: 'PB-6205-2RS',
    categories: { nodes: [fallbackCategories[0]] },
    attributes: {
      nodes: [
        { name: 'material', label: 'Malzeme', value: 'AISI 52100' },
        { name: 'precision', label: 'Hassasiyet', value: 'ABEC-7' },
        { name: 'speed', label: 'Limit Hız', value: '18.000 RPM' },
      ],
    },
  },
  {
    id: 'product-hgr20-linear-rail',
    databaseId: 1002,
    name: 'HGR20 Lineer Ray Seti',
    slug: 'hgr20-linear-rail',
    description: 'CNC eksenleri ve otomasyon hatları için yüksek rijitlikli lineer ray seti.',
    price: '128.00',
    regularPrice: '128.00',
    stockStatus: 'IN_STOCK',
    stockQuantity: 12,
    sku: 'LR-HGR20-1000',
    categories: { nodes: [fallbackCategories[1]] },
    attributes: {
      nodes: [
        { name: 'length', label: 'Uzunluk', value: '1000 mm' },
        { name: 'rail', label: 'Ray Tipi', value: 'HGR20' },
        { name: 'block', label: 'Araba', value: 'HGW20CC' },
      ],
    },
  },
  {
    id: 'product-carbide-end-mill-10mm',
    databaseId: 1003,
    name: '10 mm Karbür Freze Ucu',
    slug: 'carbide-end-mill-10mm',
    description: 'Çelik ve alüminyum işleme için kaplamalı karbür CNC freze ucu.',
    price: '34.90',
    regularPrice: '34.90',
    stockStatus: 'IN_STOCK',
    stockQuantity: 48,
    sku: 'CT-EM-10-CARBIDE',
    categories: { nodes: [fallbackCategories[2]] },
    attributes: {
      nodes: [
        { name: 'diameter', label: 'Çap', value: '10 mm' },
        { name: 'flute', label: 'Ağız Sayısı', value: '4' },
        { name: 'coating', label: 'Kaplama', value: 'TiAlN' },
      ],
    },
  },
  {
    id: 'product-nema34-step-motor',
    databaseId: 1004,
    name: 'NEMA 34 Step Motor',
    slug: 'nema34-step-motor',
    description: 'CNC router ve hareket kontrol sistemleri için yüksek torklu step motor.',
    price: '96.00',
    regularPrice: '96.00',
    stockStatus: 'IN_STOCK',
    stockQuantity: 18,
    sku: 'MT-NEMA34-8NM',
    categories: { nodes: [fallbackCategories[3]] },
    attributes: {
      nodes: [
        { name: 'torque', label: 'Tork', value: '8 Nm' },
        { name: 'current', label: 'Akım', value: '6 A' },
        { name: 'shaft', label: 'Mil', value: '14 mm' },
      ],
    },
  },
  {
    id: 'product-mach3-controller-card',
    databaseId: 1005,
    name: 'Mach3 USB Kontrol Kartı',
    slug: 'mach3-controller-card',
    description: 'CNC kontrol sistemleri için USB bağlantılı 4 eksen hareket kontrol kartı.',
    price: '74.50',
    regularPrice: '74.50',
    stockStatus: 'IN_STOCK',
    stockQuantity: 9,
    sku: 'CN-MACH3-USB-4X',
    categories: { nodes: [fallbackCategories[4]] },
    attributes: {
      nodes: [
        { name: 'axis', label: 'Eksen', value: '4 Eksen' },
        { name: 'connection', label: 'Bağlantı', value: 'USB' },
        { name: 'software', label: 'Yazılım', value: 'Mach3' },
      ],
    },
  },
]

function getImportedProducts() {
  const file = path.join(process.cwd(), '..', 'content', 'products', 'products.json')
  if (!fs.existsSync(file)) return []

  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8')) as { products?: StaticProduct[] }
    return (data.products || []).filter((product) => product.status !== 'draft')
  } catch {
    return []
  }
}

function getImportedCategories(products: StaticProduct[]) {
  const categories = new Map<string, StaticCategory>()
  const counts = new Map<string, number>()

  for (const product of products) {
    for (const category of product.categories?.nodes || []) {
      categories.set(category.slug, category)
      counts.set(category.slug, (counts.get(category.slug) || 0) + 1)
    }
  }

  return Array.from(categories.values()).map((category) => ({
    ...category,
    count: counts.get(category.slug) || category.count || 0,
  }))
}

function getGraphQLEndpoint() {
  return process.env.WP_GRAPHQL_URL || process.env.NEXT_PUBLIC_GRAPHQL_URL || ''
}

async function fetchGraphQL<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
  const endpoint = getGraphQLEndpoint()
  if (!endpoint) return null

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
    })

    if (!response.ok) return null

    const json = await response.json()
    if (json.errors) return null
    return json.data as T
  } catch {
    return null
  }
}

export function parsePrice(value?: string) {
  if (!value) return 0
  const normalized = value.replace(/<[^>]*>/g, '').replace(/[^0-9.,-]/g, '').replace(',', '.')
  const parsed = Number.parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatPrice(value?: string) {
  const parsed = parsePrice(value)
  return formatCurrencyAmount(parsed)
}

export function formatProductPrice(product: Pick<StaticProduct, 'price' | 'currencyCode'>) {
  const parsed = parsePrice(product.price)
  return formatCurrencyAmount(parsed, product.currencyCode)
}

export async function getProducts() {
  const importedProducts = getImportedProducts()
  if (importedProducts.length) return importedProducts

  const data = await fetchGraphQL<{ products?: { nodes?: StaticProduct[] } }>(`
    query StaticProducts {
      products(first: 100) {
        nodes {
          id
          databaseId
          name
          slug
          description
          shortDescription
          regularPrice
          salePrice
          price
          stockStatus
          stockQuantity
          sku
          image { sourceUrl altText }
          categories { nodes { id databaseId name slug description count image { sourceUrl altText } } }
          attributes { nodes { id name label value } }
        }
      }
    }
  `)

  return data?.products?.nodes?.length ? data.products.nodes : fallbackProducts
}

export async function getProduct(slug: string) {
  const importedProduct = getImportedProducts().find((product) => product.slug === slug)
  if (importedProduct) return importedProduct

  const data = await fetchGraphQL<{ product?: StaticProduct }>(
    `
      query StaticProduct($slug: ID!) {
        product(id: $slug, idType: SLUG) {
          id
          databaseId
          name
          slug
          description
          shortDescription
          regularPrice
          salePrice
          price
          stockStatus
          stockQuantity
          sku
          image { sourceUrl altText }
          galleryImages { nodes { sourceUrl altText } }
          categories { nodes { id databaseId name slug description count image { sourceUrl altText } } }
          attributes { nodes { id name label value } }
          related { nodes { id databaseId name slug price image { sourceUrl altText } } }
        }
      }
    `,
    { slug }
  )

  return data?.product || (await getProducts()).find((product) => product.slug === slug) || null
}

export async function getCategories() {
  const importedProducts = getImportedProducts()
  if (importedProducts.length) return getImportedCategories(importedProducts)

  const data = await fetchGraphQL<{ productCategories?: { nodes?: StaticCategory[] } }>(`
    query StaticCategories {
      productCategories(first: 100) {
        nodes {
          id
          databaseId
          name
          slug
          description
          count
          image { sourceUrl altText }
        }
      }
    }
  `)

  return data?.productCategories?.nodes?.length ? data.productCategories.nodes : fallbackCategories
}

export async function getCategory(slug: string) {
  const importedProducts = getImportedProducts()
  if (importedProducts.length) {
    const category = getImportedCategories(importedProducts).find((item) => item.slug === slug)
    if (!category) return null
    const products = importedProducts.filter((product) => product.categories?.nodes?.some((item) => item.slug === slug))
    return { ...category, products: { nodes: products } }
  }

  const data = await fetchGraphQL<{ productCategory?: StaticCategory & { products?: { nodes?: StaticProduct[] } } }>(
    `
      query StaticCategory($slug: ID!) {
        productCategory(id: $slug, idType: SLUG) {
          id
          databaseId
          name
          slug
          description
          count
          image { sourceUrl altText }
          products(first: 100) {
            nodes {
              id
              databaseId
              name
              slug
              price
              stockStatus
              stockQuantity
              sku
              image { sourceUrl altText }
            }
          }
        }
      }
    `,
    { slug }
  )

  if (data?.productCategory) return data.productCategory

  const category = (await getCategories()).find((item) => item.slug === slug)
  if (!category) return null

  const products = (await getProducts()).filter((product) =>
    product.categories?.nodes?.some((item) => item.slug === slug)
  )

  return { ...category, products: { nodes: products.length ? products : fallbackProducts } }
}

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)
  if (!match) return { frontmatter: {} as Record<string, any>, body: raw }

  const frontmatter: Record<string, any> = {}
  const stack: Array<{ indent: number; value: Record<string, any> }> = [{ indent: -1, value: frontmatter }]

  for (const line of match[1].split('\n')) {
    if (!line.trim()) continue
    const indent = line.match(/^\s*/)?.[0].length || 0
    const [, key = '', rawValue = ''] = line.match(/^\s*([^:]+):\s*(.*)$/) || []
    if (!key) continue

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop()

    const parent = stack[stack.length - 1].value
    const value = rawValue.trim()
    if (!value) {
      parent[key.trim()] = {}
      stack.push({ indent, value: parent[key.trim()] })
      continue
    }

    parent[key.trim()] = value.replace(/^['"]|['"]$/g, '')
  }

  return { frontmatter, body: match[2] }
}

function markdownToHtml(markdown: string) {
  return markdown
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      if (trimmed.startsWith('## ')) return `<h2>${trimmed.slice(3)}</h2>`
      if (trimmed.startsWith('# ')) return `<h1>${trimmed.slice(2)}</h1>`
      if (trimmed.startsWith('- ')) {
        const items = trimmed
          .split('\n')
          .map((item) => `<li>${item.replace(/^-\s*/, '')}</li>`)
          .join('')
        return `<ul>${items}</ul>`
      }
      return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`
    })
    .join('\n')
}

async function getLocalMarkdownPages(kind: 'pages' | 'policies') {
  const dir = path.join(process.cwd(), '..', 'content', kind)
  if (!fs.existsSync(dir)) return []

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8')
      const parsed = parseFrontmatter(raw)
      const slug = parsed.frontmatter.slug || file.replace(/\.md$/, '')
      return {
        id: `${kind}-${slug}`,
        title: parsed.frontmatter.title || slug,
        slug,
        content: markdownToHtml(parsed.body),
        effectiveDate: parsed.frontmatter.effectiveDate,
        version: parsed.frontmatter.version,
        seo: parsed.frontmatter.seo,
      } satisfies StaticPage
    })
}

export async function getPages() {
  const data = await fetchGraphQL<{ pages?: { nodes?: StaticPage[] } }>(`
    query StaticPages {
      pages(first: 100) {
        nodes {
          id
          title
          slug
          content
          seo { title metaDesc }
        }
      }
    }
  `)

  return data?.pages?.nodes?.length ? data.pages.nodes : getLocalMarkdownPages('pages')
}

export async function getPage(slug: string) {
  const pages = await getPages()
  return pages.find((page) => page.slug === slug) || null
}

export async function getPolicies() {
  return getLocalMarkdownPages('policies')
}

export async function getPolicy(slug: string) {
  const policies = await getPolicies()
  return policies.find((policy) => policy.slug === slug) || null
}
