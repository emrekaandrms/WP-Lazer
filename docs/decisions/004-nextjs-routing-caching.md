# ADR-002: Next.js App Router + ISR Caching Strategy

## Status
Accepted

## Date
2026-04-02

## Context
We need a frontend framework that supports server-side rendering for SEO, incremental static regeneration for performance, and a modern developer experience. React Server Components, built-in image optimization, and strong TypeScript support are required.

## Decision
Use **Next.js 14+ with App Router** as the frontend framework.

### Rendering Strategy (Context7 Verified - 2026-04-02)

| Route Type | Strategy | Revalidation |
|------------|----------|--------------|
| Homepage `/` | ISR | 60 seconds (featured products change frequently) |
| Category `/category/[slug]` | ISR | 300 seconds (5 min) |
| Product `/product/[slug]` | ISR + SSR hybrid | 60 seconds (stock-sensitive) |
| Static Pages `/page/[slug]` | ISR | 3600 seconds (1 hour) |
| Policies `/policy/[slug]` | ISR | 86400 seconds (1 day) |

### Caching Headers
- Set `Cache-Control: s-maxage=60, stale-while-revalidate=300` for ISR pages
- Use Next.js `revalidatePath()` and `revalidateTag()` for on-demand revalidation
- Cart/checkout pages: `no-store` (always fresh)

### Data Fetching
- Server Components: fetch data directly in component (server-side)
- Client Components: use Apollo Client hooks
- Parallel data fetching with `Promise.all()` for related data

### Image Optimization
- Use Next.js `<Image>` component for all WooCommerce images
- Configure `remotePatterns` for WordPress domain
- Prefer WebP format with fallback

## Consequences
### Positive
- RSC enables efficient data fetching without client-side waterfalls
- ISR provides static performance with dynamic revalidation
- Built-in image optimization reduces page weight
- Strong TypeScript support with typed GraphQL schema possible

### Negative
- Additional complexity vs simple SSR
- ISR latency on first cache miss after revalidation
- Must carefully manage client/server component boundaries
- Apollo Client cache invalidation requires careful configuration

## References
- Next.js ISR Docs: https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration
- Verify revalidation behavior via Context7 for your Next.js version
