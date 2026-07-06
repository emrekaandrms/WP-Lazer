import fs from 'fs'
import path from 'path'

export type GuideSection = { heading: string; body: string[]; list?: string[] }
export type GuideFaq = { question: string; answer: string }
export type Guide = {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  category: string
  updated: string
  intro: string
  sections: GuideSection[]
  faq: GuideFaq[]
  relatedCategories?: string[]
  relatedGuides?: string[]
}

// Display names for category slugs referenced by guides (for internal-link anchors).
export const CATEGORY_NAMES: Record<string, string> = {
  'koruma-camlari': 'Koruma Camları',
  seramikler: 'Seramikler',
  nozullar: 'Nozullar',
  lensler: 'Lensler',
  'lazer-kaynak': 'Lazer Kaynak Sarfları',
}

function loadGuides(): Guide[] {
  const file = path.join(process.cwd(), '..', 'content', 'guides', 'guides.json')
  if (!fs.existsSync(file)) return []
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8')) as { guides?: Guide[] }
    return data.guides || []
  } catch {
    return []
  }
}

export function getGuides(): Guide[] {
  return loadGuides()
}

export function getGuide(slug: string): Guide | null {
  return loadGuides().find((guide) => guide.slug === slug) || null
}
