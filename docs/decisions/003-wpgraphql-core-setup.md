# ADR-001: WPGraphQL + WooGraphQL as API Foundation

## Status
Accepted

## Date
2026-04-02

## Context
We need a GraphQL API layer to expose WooCommerce products, categories, orders, and customer data to a decoupled Next.js frontend. WordPress REST API was considered but GraphQL's query flexibility, nested data fetching, and typed schema make it superior for this use case.

## Decision
Use `WPGraphQL` as the base WordPress GraphQL plugin and `WPGraphQL for WooCommerce` (WooGraphQL) to expose WooCommerce data through the schema.

### Plugin Versions (Context7 Verified - 2026-04-02)
- **WPGraphQL**: v1.17.x (latest stable as of Q1 2026)
- **WPGraphQL for WooCommerce**: v0.19.x (verify compatible WooCommerce version)
- **WooCommerce**: v8.5.x minimum, v9.x recommended

### Schema Design
- Products via `products` query with `where` argument for filtering
- Product details via `product(id: $slug, idType: SLUG)`
- Categories via `productCategories` query
- Cart/Session via WooGraphQL cart mutations
- Customer data via WooGraphQL customer queries (auth required)

### Authentication
- Public read access for catalog data (no auth required)
- Mutations and customer data require JWT authentication (Phase 2)
- Application Passwords also supported as fallback auth method

## Consequences
### Positive
- Single unified GraphQL endpoint for all headless data needs
- Type-safe schema enables code generation for TypeScript
- Nested queries reduce over-fetching
- WooGraphQL handles complex product variations and attributes

### Negative
- Plugin dependency - must monitor compatibility with WooCommerce core updates
- Schema must be extended carefully to avoid breaking changes
- Real-time stock updates require polling or WebSocket extension

## References
- WPGraphQL Docs: https://www.wpgraphql.com/
- WooGraphQL Repo: https://github.com/wp-graphql/woo-graphql
- Verify current versions via Context7 before installation
