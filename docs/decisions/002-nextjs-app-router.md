# ADR-002: Next.js App Router for Frontend

## Status
Accepted

## Date
2026-04-02

## Context

The frontend needs to be a modern React framework with excellent developer experience, TypeScript support, and ISR (Incremental Static Regeneration) for content caching. We evaluated Next.js (Pages vs App Router), Nuxt, and Remix.

## Decision

We will use **Next.js with App Router** as the frontend framework.

## Reasons

1. App Router provides React Server Components for better performance
2. Native ISR support for headless content caching
3. Built-in image optimization
4. Strong TypeScript support
5. Large ecosystem and community
6. Vercel deployment options (optional)

## Consequences

### Positive
- Server Components reduce client-side JS
- ISR enables stale-while-revalidate for products
- API routes for revalidation webhook
- Excellent developer experience

### Negative
- Newer App Router has some instability
- Learning curve for Server Components
- Deployment complexity vs static hosting

## Verification

Verified via Context7: Next.js 14.x App Router caching behavior and ISR revalidation patterns confirmed.
