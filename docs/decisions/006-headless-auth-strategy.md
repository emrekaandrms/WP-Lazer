# ADR-004: Headless Authentication Strategy

## Status
Deferred to Phase 2

## Date
2026-04-02

## Context
We need to decide how to handle authentication for headless frontend users. Options include native WooCommerce checkout (Phase 1 default), JWT-based headless login, or session-based authentication with cookies.

## Decision (Phase 1)
**Native WooCommerce checkout** - no headless authentication in Phase 1.

### Rationale
- Faster time-to-market
- Lower security complexity
- WooCommerce handles payment processing
- User accounts managed by WooCommerce natively

## Decision (Phase 2 - Pending Context7 Validation)
**JWT-based authentication** via WPGraphQL JWT Authentication plugin

### Required Investigation (Context7)
Before Phase 2 implementation, validate:
1. Current WPGraphQL JWT Auth plugin maintenance status
2. Alternative: WPGraphQL Ideation or similar headless auth plugins
3. WooGraphQL customer mutation compatibility
4. Token refresh strategy and security considerations

### Phase 2 Scope (Tentative)
- Headless login/logout/register mutations
- JWT token generation and refresh
- Customer account pages (order history, addresses)
- Persistent cart via WooGraphQL cart mutations
- Secure token storage and refresh flow

## Consequences
### Phase 1
- Checkout redirects to WooCommerce native pages
- No account pages on headless frontend
- Simple public catalog implementation

### Phase 2 (if implemented)
- Additional complexity in frontend auth flow
- Token lifecycle management
- Security hardening required
- Potential need for backend session management

## References
- WPGraphQL JWT Auth: https://github.com/wp-graphql/wp-graphql-jwt-authentication
- Verify via Context7 for current maintenance status
- WooGraphQL Account Mutations: https://docs.woographql.com/mutations/account
