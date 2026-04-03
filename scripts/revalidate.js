#!/usr/bin/env node
/**
 * Next.js Revalidation Script
 * Triggers ISR revalidation for specific routes after content updates
 *
 * Usage: node scripts/revalidate.js <route> [route2] [route3]
 * Example: node scripts/revalidate.js /category/bearings /product/6205-2rs
 */

const REVALIDATE_SECRET = process.env.NEXT_PUBLIC_API_REVALIDATE_SECRET || 'development-secret'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

async function revalidateRoute(route) {
  const url = `${SITE_URL}/api/revalidate?path=${encodeURIComponent(route)}&secret=${REVALIDATE_SECRET}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.log(`  [FAIL] ${route} - ${error}`)
      return false
    }

    const data = await response.json()
    if (data.revalidated) {
      console.log(`  [OK] ${route} - revalidated`)
      return true
    } else {
      console.log(`  [WARN] ${route} - ${data.message || 'unknown'}`)
      return false
    }
  } catch (error) {
    console.log(`  [ERROR] ${route} - ${error.message}`)
    return false
  }
}

async function main() {
  const routes = process.argv.slice(2)

  if (routes.length === 0) {
    console.log('Usage: node scripts/revalidate.js <route> [route2] [route3]')
    console.log('Example: node scripts/revalidate.js / /category/bearings /product/6205-2rs')
    process.exit(1)
  }

  console.log(`Revalidating ${routes.length} route(s)...\n`)

  const results = await Promise.all(routes.map(route => revalidateRoute(route)))
  const success = results.filter(r => r).length

  console.log(`\nRevalidation complete: ${success}/${routes.length} successful`)

  process.exit(success === routes.length ? 0 : 1)
}

main()
