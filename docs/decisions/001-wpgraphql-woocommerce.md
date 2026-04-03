# ADR-001: WPGraphQL + WooGraphQL as API Layer

## Status
Accepted

## Date
2026-04-02

## Context

We needed a GraphQL API layer to expose WooCommerce data (products, categories, orders) and WordPress content (pages, policies) to a headless Next.js frontend. The alternative was pure WooCommerce REST API, but that would require separate handling for WordPress content.

## Decision

We will use:
- **WPGraphQL** as the base GraphQL layer for WordPress
- **WPGraphQL for WooCommerce** (WooGraphQL) for e-commerce data

This provides a unified GraphQL endpoint for all data types.

## Reasons

1. Single endpoint for all content types
2. Native GraphQL mutations for WooCommerce (cart, checkout, etc.)
3. Strongly-typed schema with fragments
4. Built-in support for WordPress custom post types and ACF
5. Active maintenance and community

## Consequences

### Positive
- Unified data fetching for frontend
- Type-safe queries with TypeScript definitions
- Better performance via query batching

### Negative
- Additional plugin dependency
- Schema customization requires PHP hooks
- Caching strategy more complex

## Verification

Verified via Context7: WPGraphQL 1.14+ and WooGraphQL 0.13+ compatibility confirmed.
