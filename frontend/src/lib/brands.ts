import fs from 'fs'
import path from 'path'

export type Brand = {
  slug: string
  name: string
  manufacturers: string[]
  /** Also match products whose description/name mentions any of these terms (machine brands). */
  descriptionContains?: string[]
  metaTitle: string
  metaDescription: string
  keywords: string[]
  intro: string[]
}

function loadBrands(): Brand[] {
  const file = path.join(process.cwd(), '..', 'content', 'brands.json')
  if (!fs.existsSync(file)) return []
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8')) as { brands?: Brand[] }
    return data.brands || []
  } catch {
    return []
  }
}

export function getBrands(): Brand[] {
  return loadBrands()
}

export function getBrand(slug: string): Brand | null {
  return loadBrands().find((brand) => brand.slug === slug) || null
}

// True if a product belongs to this brand page: manufacturer match (head brands)
// OR name/description mention (machine brands like Durma, Ermaksan).
export function productMatchesBrand(
  product: { manufacturer?: string; name?: string; description?: string },
  brand: Brand
): boolean {
  const m = (product.manufacturer || '').trim().toUpperCase()
  if (m && brand.manufacturers.some((entry) => entry.trim().toUpperCase() === m)) return true

  if (brand.descriptionContains?.length) {
    const haystack = `${product.name || ''} ${product.description || ''}`.toLocaleLowerCase('tr')
    return brand.descriptionContains.some((term) => haystack.includes(term.toLocaleLowerCase('tr')))
  }
  return false
}
