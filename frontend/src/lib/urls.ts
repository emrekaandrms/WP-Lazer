const DEFAULT_WP_HOME = 'http://localhost:8080'
const DEFAULT_WOO_CHECKOUT_PATH = '/odeme/'

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

export function getWordPressHome() {
  return trimTrailingSlash(process.env.NEXT_PUBLIC_WP_HOME || DEFAULT_WP_HOME)
}

export function getWooUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getWordPressHome()}${normalizedPath}`
}

export function getWooAccountUrl() {
  return getWooUrl('/my-account/')
}

export function getWooCheckoutUrl() {
  const absoluteCheckoutUrl = process.env.NEXT_PUBLIC_WOO_CHECKOUT_URL
  if (absoluteCheckoutUrl) return trimTrailingSlash(absoluteCheckoutUrl) + '/'

  return getWooUrl(process.env.NEXT_PUBLIC_WOO_CHECKOUT_PATH || DEFAULT_WOO_CHECKOUT_PATH)
}

export function getWooCartUrl() {
  return getWooUrl('/cart/')
}

export function getWpRestBaseUrl() {
  return trimTrailingSlash(process.env.NEXT_PUBLIC_WP_REST_URL || `${getWordPressHome()}/wp-json`)
}
