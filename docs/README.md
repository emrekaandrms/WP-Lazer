# WP-Lzer Project

Headless WooCommerce implementation with WordPress, WPGraphQL, and Next.js

## Project Structure

```
WP-Lzer/
├── content/                    # Git-tracked content (source of truth)
│   ├── pages/                  # Static pages (about.md, contact.md)
│   ├── policies/               # Policy pages (privacy.md, terms.md, kvkk.md)
│   ├── settings/               # Site settings (site.json)
│   └── schemas/                # JSON schemas for validation
├── docker/                     # Docker setup
│   ├── docker-compose.yml      # WordPress + MySQL + WP-CLI
│   └── .env.example
├── docs/                       # Documentation
│   └── decisions/              # Architecture decision records
├── frontend/                   # Next.js frontend
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   ├── category/[slug]/
│   │   │   ├── page/[slug]/
│   │   │   ├── policy/[slug]/
│   │   │   └── product/[slug]/
│   │   └── lib/              # GraphQL client and types
│   ├── scripts/               # Build and validation scripts
│   └── package.json
├── scripts/                    # Operational scripts
│   ├── bootstrap-wp.ps1       # Quick start script
│   ├── validate-content.js    # Content schema validation
│   ├── revalidate.js          # Next.js ISR revalidation
│   └── seed-content.js        # Sample content seeder
└── wordpress/                  # WordPress files
    └── wp-content/
        ├── plugins/            # Custom plugins
        │   └── headless-cli/   # WP-CLI custom commands
        └── themes/
            └── headless-theme/ # Minimal headless theme
```

## Quick Start

### Prerequisites

- Docker Desktop
- Node.js 18+
- WP-CLI (for terminal operations)

### Setup

1. Clone the repository
2. Run the bootstrap script:

```powershell
.\scripts\bootstrap-wp.ps1
```

3. Configure environment variables in `docker/.env` and `frontend/.env.local`

4. Install WordPress plugins:
   - WPGraphQL
   - WPGraphQL for WooCommerce

5. Start the frontend:

```bash
cd frontend
npm run dev
```

## Content Management (Terminal-First)

### Workflow

1. Edit content files in `content/` directory
2. Validate content:

```bash
node scripts/validate-content.js
```

3. Import to WordPress:

```bash
wp content import content/pages/about.md
wp content import-dir content/policies --type=policy
```

4. Sync settings:

```bash
wp settings sync content/settings/site.json
```

5. Trigger frontend revalidation:

```bash
node scripts/revalidate.js / /category/bearings
```

## Environment Variables

### Frontend (.env.local)

```env
WP_GRAPHQL_URL=http://localhost:8080/graphql
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_REVALIDATE_SECRET=your-secret
```

### Docker (.env)

```env
WORDPRESS_DB_HOST=wp-lzer-db:3306
WORDPRESS_DB_USER=wordpress
WORDPRESS_DB_PASSWORD=wordpress_secret
WORDPRESS_DB_NAME=wp_lzer
HEADLESS_FRONTEND_URL=http://localhost:3000
```

## Development

### Frontend

```bash
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Lint
npm run type-check   # TypeScript check
```

### Content Validation

```bash
node scripts/validate-content.js
```

### Revalidation

```bash
# Single route
node scripts/revalidate.js /category/bearings

# Multiple routes
node scripts/revalidate.js / /category/bearings /product/6205-2rs
```

## Architecture Decisions

See `docs/decisions/` for architecture decision records (ADRs).

Key decisions:
- WPGraphQL + WooGraphQL for API layer
- Next.js App Router for frontend
- Markdown/JSON files as content source of truth
- WP-CLI for terminal-based content management
