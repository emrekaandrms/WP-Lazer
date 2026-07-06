export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://lazeronline.com.tr').replace(/\/$/, '')

export function canonicalPath(path: string) {
  if (!path || path === '/') return '/'
  return path.endsWith('/') ? path : `${path}/`
}

export function absoluteUrl(path: string) {
  return new URL(canonicalPath(path), `${siteUrl}/`).toString()
}

export function stripHtml(value?: string) {
  return (value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}
