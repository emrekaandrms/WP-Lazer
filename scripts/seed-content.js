#!/usr/bin/env node
/**
 * Content Seeder Script
 * Seeds WordPress with sample content for development/testing
 *
 * Usage: node scripts/seed-content.js
 */

const GRAPHQL_URL = process.env.WP_GRAPHQL_URL || 'http://localhost:8080/graphql'

async function runQuery(query, variables = {}) {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })

  const json = await response.json()

  if (json.errors) {
    console.error('GraphQL Error:', json.errors)
    throw new Error(json.errors[0].message)
  }

  return json.data
}

async function seedProducts() {
  console.log('Seeding sample products...')

  // This would be implemented with actual WooGraphQL mutations
  // For now, just a placeholder
  console.log('  [SKIP] Product seeding requires WooGraphQL mutations')
}

async function seedPages() {
  console.log('Seeding sample pages...')

  const pages = [
    {
      title: 'About Us',
      slug: 'about',
      content: '<h2>About Our Company</h2><p>Precision CNC has been delivering high-quality industrial components since 1998.</p>'
    },
    {
      title: 'Contact',
      slug: 'contact',
      content: '<h2>Get in Touch</h2><p>Technical Support: +1 800-CNC-OPS</p><p>Email: hq@industrial-ops.com</p>'
    }
  ]

  for (const page of pages) {
    console.log(`  Creating page: ${page.slug}`)
    // Mutation would go here
  }
}

async function seedCategories() {
  console.log('Seeding sample categories...')

  const categories = [
    { name: 'Bearings', slug: 'bearings', description: 'High-precision ball and roller bearings' },
    { name: 'Linear Rails', slug: 'linear-rails', description: 'Precision linear guide systems' },
    { name: 'CNC Tools', slug: 'cnc-tools', description: 'Carbide and diamond cutting tools' },
    { name: 'Motors', slug: 'motors', description: 'High-performance servo and stepper motors' },
    { name: 'Controllers', slug: 'controllers', description: 'CNC control systems and drives' },
  ]

  for (const cat of categories) {
    console.log(`  Creating category: ${cat.slug}`)
    // Mutation would go here
  }
}

async function main() {
  console.log('Content Seeder\n')

  try {
    await seedProducts()
    await seedPages()
    await seedCategories()
    console.log('\nSeeding complete!')
  } catch (error) {
    console.error('\nSeeding failed:', error.message)
    process.exit(1)
  }
}

main()
