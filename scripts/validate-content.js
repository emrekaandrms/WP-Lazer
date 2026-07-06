#!/usr/bin/env node
/**
 * Content Validation Script
 * Validates markdown content against JSON schemas before import
 *
 * Usage: node scripts/validate-content.js
 */

const fs = require('fs')
const path = require('path')
const Ajv = require('ajv')
const addFormats = require('ajv-formats')

const CONTENT_DIR = path.join(__dirname, '..', 'content')
const SCHEMAS_DIR = path.join(CONTENT_DIR, 'schemas')

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

function loadSchema(name) {
  const schemaPath = path.join(SCHEMAS_DIR, `${name}.schema.json`)
  if (!fs.existsSync(schemaPath)) {
    return null
  }
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
  return schema
}

function extractFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/)
  if (!match) return {}

  const data = {}
  const stack = [{ indent: -1, value: data }]
  const lines = match[1].split('\n')

  for (const line of lines) {
    if (!line.trim()) continue
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue

    const indent = line.match(/^\s*/)[0].length
    const key = line.slice(0, colonIndex).trim()
    const value = line.slice(colonIndex + 1).trim()

    if (!key) continue

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop()
    }

    const parent = stack[stack.length - 1].value

    if (value === '') {
      parent[key] = {}
      stack.push({ indent, value: parent[key] })
      continue
    }

    // Handle quoted strings
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      parent[key] = value.slice(1, -1)
    } else if (value === '' || value === 'null') {
      parent[key] = null
    } else {
      parent[key] = value
    }
  }

  return data
}

function validateFile(filePath, schema) {
  const content = fs.readFileSync(filePath, 'utf8')
  const frontmatter = extractFrontmatter(content)
  const validate = ajv.compile(schema)
  const valid = validate(frontmatter)

  if (!valid) {
    return {
      valid: false,
      errors: validate.errors,
      frontmatter
    }
  }

  return { valid: true, frontmatter }
}

function getContentType(filePath) {
  const relative = path.relative(CONTENT_DIR, filePath)

  if (relative.startsWith('pages')) return 'page'
  if (relative.startsWith('policies')) return 'policy'
  return 'unknown'
}

function main() {
  console.log('Starting content validation...\n')

  const schemaFiles = fs.readdirSync(SCHEMAS_DIR)
    .filter(f => f.endsWith('.schema.json'))
    .map(f => f.replace('.schema.json', ''))

  const schemas = {}
  for (const name of schemaFiles) {
    schemas[name] = loadSchema(name)
  }

  let totalFiles = 0
  let validFiles = 0
  const errors = []

  // Validate pages
  const pagesDir = path.join(CONTENT_DIR, 'pages')
  if (fs.existsSync(pagesDir)) {
    const pageSchema = schemas.page
    if (pageSchema) {
      const pageFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.md'))
      for (const file of pageFiles) {
        totalFiles++
        const result = validateFile(path.join(pagesDir, file), pageSchema)
        if (result.valid) {
          validFiles++
          console.log(`  [OK] pages/${file}`)
        } else {
          errors.push({ file: `pages/${file}`, errors: result.errors })
          console.log(`  [FAIL] pages/${file}`)
          result.errors.forEach(e => {
            console.log(`       - ${e.instancePath || '/'}: ${e.message}`)
          })
        }
      }
    }
  }

  // Validate policies
  const policiesDir = path.join(CONTENT_DIR, 'policies')
  if (fs.existsSync(policiesDir)) {
    const policySchema = schemas.policy
    if (policySchema) {
      const policyFiles = fs.readdirSync(policiesDir).filter(f => f.endsWith('.md'))
      for (const file of policyFiles) {
        totalFiles++
        const result = validateFile(path.join(policiesDir, file), policySchema)
        if (result.valid) {
          validFiles++
          console.log(`  [OK] policies/${file}`)
        } else {
          errors.push({ file: `policies/${file}`, errors: result.errors })
          console.log(`  [FAIL] policies/${file}`)
          result.errors.forEach(e => {
            console.log(`       - ${e.instancePath || '/'}: ${e.message}`)
          })
        }
      }
    }
  }

  // Validate settings JSON
  const settingsDir = path.join(CONTENT_DIR, 'settings')
  if (fs.existsSync(settingsDir)) {
    const siteSchema = schemas.site
    if (siteSchema) {
      const jsonFiles = fs.readdirSync(settingsDir).filter(f => f === 'site.json')
      for (const file of jsonFiles) {
        totalFiles++
        const filePath = path.join(settingsDir, file)
        const validate = ajv.compile(siteSchema)
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        const valid = validate(data)

        if (valid) {
          validFiles++
          console.log(`  [OK] settings/${file}`)
        } else {
          errors.push({ file: `settings/${file}`, errors: validate.errors })
          console.log(`  [FAIL] settings/${file}`)
          validate.errors.forEach(e => {
            console.log(`       - ${e.instancePath || '/'}: ${e.message}`)
          })
        }
      }
    }
  }

  console.log(`\nValidation complete: ${validFiles}/${totalFiles} files valid`)

  if (errors.length > 0) {
    console.log('\nErrors:')
    for (const err of errors) {
      console.log(`  ${err.file}: ${err.errors.length} error(s)`)
    }
    process.exit(1)
  }

  process.exit(0)
}

main()
