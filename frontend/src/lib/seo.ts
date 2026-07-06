import { absoluteUrl, siteUrl, stripHtml } from './site'
import type { StaticCategory, StaticProduct } from './static-data'

export const SITE_NAME = 'Lazer Online'

// Brands whose products we stock compatible consumables for.
export const COMPAT_BRANDS = ['Precitec', 'Raytools', 'Bystronic', 'Nukon', 'HighYag', 'WSX', 'Boci']

// Offer price validity (Google Merchant/Product rich-result requirement) — 1 year out, set at build time.
const PRICE_VALID_UNTIL = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

// Manufacturer values in the data are upper-cased / mixed; present them with
// correct proper-noun casing (NOT Turkish locale, which would turn I -> ı).
// "LAZER KAYNAK" is a category bucket, not a brand.
const BRAND_MAP: Record<string, string> = {
  PRECITEC: 'Precitec',
  RAYTOOLS: 'Raytools',
  BYSTRONIC: 'Bystronic',
  NUKON: 'Nukon',
  HIGHYAG: 'HighYag',
  'NUKON/HIGHYAG': 'Nukon/HighYag',
  WSX: 'WSX',
  BOCI: 'Boci',
  OSPRI: 'Ospri',
}

export function brandLabel(manufacturer?: string): string {
  if (!manufacturer) return ''
  const raw = manufacturer.trim()
  const key = raw.toUpperCase()
  if (!raw || key === 'LAZER KAYNAK') return ''
  if (BRAND_MAP[key]) return BRAND_MAP[key]
  if (raw.includes('/')) return raw
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
}

function clamp(text: string, max = 158): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  return t.slice(0, max - 1).replace(/\s+\S*$/, '') + '…'
}

// ---- Product ----

export function productMetaTitle(product: StaticProduct): string {
  const category = product.categories?.nodes?.[0]?.name
  const brand = brandLabel(product.manufacturer)
  const compat = brand ? `${brand} Uyumlu ` : ''
  return `${product.name} Fiyatı – ${compat}Fiber Lazer ${category || 'Sarf Malzemesi'}`
}

export function productMetaDescription(product: StaticProduct): string {
  const category = (product.categories?.nodes?.[0]?.name || 'sarf malzemesi').toLocaleLowerCase('tr')
  const brand = brandLabel(product.manufacturer)
  const compat = brand ? `${brand} uyumlu, ` : ''
  const sku = product.sku ? `Ürün kodu ${product.sku}. ` : ''
  const base = `${product.name}: ${compat}fiber lazer kesim ve kaynak makineleri için ${category} sarf malzemesi. ${sku}Stokta, hızlı kargo ve teknik destek — Lazer Online.`
  const detail = stripHtml(product.shortDescription || product.description)
  return clamp(detail && detail.toLocaleLowerCase('tr') !== product.name.toLocaleLowerCase('tr') ? `${base}` : base)
}

export function productLd(product: StaticProduct, images: string[]) {
  const category = product.categories?.nodes?.[0]
  const brand = brandLabel(product.manufacturer) || SITE_NAME
  const price = Number.parseFloat(String(product.price || '0').replace(/[^0-9.,-]/g, '').replace(',', '.')) || 0
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: stripHtml(product.shortDescription || product.description) || productMetaDescription(product),
    sku: product.sku || product.id,
    mpn: product.model || product.sku || undefined,
    image: images.length ? images : undefined,
    brand: { '@type': 'Brand', name: brand },
    category: category?.name,
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/product/${product.slug}`),
      priceCurrency: product.currencyCode || 'TRY',
      price: price.toFixed(2),
      priceValidUntil: PRICE_VALID_UNTIL,
      availability:
        product.stockStatus === 'OUT_OF_STOCK'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: SITE_NAME },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'TRY' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'TR' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 2, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 5, unitCode: 'DAY' },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'TR',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
      },
    },
  }
}

// ---- Category ----

export function categoryMetaTitle(category: { name: string }): string {
  const clean = category.name.replace(' Sarfları', '')
  return `Fiber Lazer ${clean} – Precitec, Raytools, Bystronic Uyumlu Sarf Malzemeleri`
}

export function breadcrumbLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function itemListLd(products: StaticProduct[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.slice(0, 100).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(`/product/${product.slug}`),
      name: product.name,
    })),
  }
}

export function faqLd(faq: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

// ---- Site-wide ----

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: siteUrl,
    logo: absoluteUrl('/brand/lazer-online-kare.png'),
    email: 'bilgi@lazeronline.com.tr',
    description:
      'Fiber lazer kesim ve kaynak makineleri için koruma camı, seramik, nozul, lens ve sarf malzemeleri tedarikçisi.',
    areaServed: 'TR',
    sameAs: [] as string[],
  }
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: siteUrl,
    inLanguage: 'tr-TR',
    publisher: { '@type': 'Organization', name: SITE_NAME },
  }
}

export type { StaticCategory }
