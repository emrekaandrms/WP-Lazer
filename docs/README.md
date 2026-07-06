# WP-Lzer Project

Hostinger-only headless WooCommerce implementation with WordPress, WPGraphQL, and a static Next.js frontend.

## Project Structure

```
WP-Lzer/
├── content/                    # Git-tracked content (source of truth)
│   ├── pages/                  # Static pages (about.md, contact.md)
│   ├── policies/               # Policy pages (privacy.md, terms.md, kvkk.md)
│   ├── settings/               # Site settings (site.json)
│   └── schemas/                # JSON schemas for validation
├── docker/                     # Legacy local sandbox files, not used for production
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

- Node.js 18+
- Hostinger Web/WordPress hosting for production
- WP-CLI or WordPress admin access for production operations

### Setup

1. Clone the repository
2. Configure environment variables in `frontend/.env.local`
3. Install WordPress plugins:
   - WPGraphQL
   - WPGraphQL for WooCommerce
   - WooCommerce
   - Headless CLI Commands
4. Start the frontend:

```bash
cd frontend
npm run dev
```

For production deployment, see `docs/hostinger-static-runbook.md`.

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

5. Rebuild and upload the static frontend after content or product changes.

## Environment Variables

### Frontend (.env.local)

```env
WP_GRAPHQL_URL=https://lazeronline.com.tr/graphql
NEXT_PUBLIC_WP_HOME=https://lazeronline.com.tr
NEXT_PUBLIC_WP_REST_URL=https://lazeronline.com.tr/wp-json
NEXT_PUBLIC_GRAPHQL_URL=https://lazeronline.com.tr/graphql
NEXT_PUBLIC_WOO_CHECKOUT_PATH=/odeme/
NEXT_PUBLIC_SITE_URL=https://lazeronline.com.tr
```

### Local WordPress (optional)

The production deployment does not require Docker or a Node.js runtime on Hostinger. If a local WordPress sandbox is used later, keep those environment values in a local-only file and do not deploy them to `public_html`.

## Development

### Frontend

```bash
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Lint
npm run type-check   # TypeScript check
```

`npm run build` creates a static export in `frontend/out/` for Hostinger `public_html`.

### Content Validation

```bash
node scripts/validate-content.js
```

### Static Publish

```bash
npm run validate
npm run build
# Upload frontend/out/ to Hostinger public_html
```

## Architecture Decisions

See `docs/decisions/` for architecture decision records (ADRs).

Key decisions:
- WPGraphQL + WooGraphQL for API layer
- Next.js App Router for frontend
- Markdown/JSON files as content source of truth
- WP-CLI for terminal-based content management
