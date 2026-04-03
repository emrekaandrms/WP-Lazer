# Context7 Integration Guide

## Overview
Context7 is used as the **mandatory documentation authority** for all technical decisions involving libraries, frameworks, and plugins in this project.

## When to Use Context7

**MUST** query Context7 before implementing or deciding on:
- Any WordPress plugin behavior (WPGraphQL, WooGraphQL, auth plugins)
- Next.js data fetching, caching, or ISR behavior
- WP-CLI command behavior or option compatibility
- Breaking changes in plugin versions
- Security-related configurations

## How to Query Context7

Use the Context7 MCP tool:

```
Tool: FetchMcpResource
Server: user-Context7
URI: (query the relevant documentation)
```

Or use the cursor-ide-browser MCP to navigate official docs.

## Required Validation Points

### Before Phase 0 (Foundation Setup)
- [ ] WPGraphQL installation and configuration
- [ ] WPGraphQL for WooCommerce compatibility with current WooCommerce version
- [ ] CORS header requirements and configuration
- [ ] WP-CLI installation and capabilities

### Before Phase 1 (Frontend)
- [ ] Next.js App Router data fetching patterns
- [ ] ISR revalidation behavior and timing
- [ ] Apollo Client cache invalidation strategies
- [ ] Image optimization with WordPress media

### Before Phase 2 (Content Pipeline)
- [ ] WP-CLI custom command registration
- [ ] WordPress option/update mechanisms
- [ ] Markdown parsing for WordPress import

### Before Phase 3 (Auth - if needed)
- [ ] JWT token security requirements
- [ ] WordPress application passwords vs JWT
- [ ] WooGraphQL customer mutation authentication

## Decision Record Format

All Context7-validated decisions must be recorded in `docs/decisions/` using this format:

```markdown
# ADR-XXX: Title

## Status
Accepted | Deprecated | Superseded

## Date
YYYY-MM-DD

## Context
What problem are we solving?

## Decision
What was decided?

## Validation
- [ ] Context7 query: <what was queried>
- [ ] Result: <key findings>
- [ ] Version verified: <plugin/library version>

## Consequences
### Positive
### Negative

## References
Links to Context7 documentation
```

## Example: Validating WPGraphQL Schema

```bash
# Query Context7 for WPGraphQL product query fields
# Check: what fields are available on the Product type?
# Check: how to query product variations?
# Check: is there built-in pagination support?
```

## Enforcement

- **Gate A (Documentation Gate)**: All critical technical decisions require Context7 evidence
- **Gate B (Implementation Gate)**: Verify implementation matches Context7 guidance
- **Gate C (Completion Gate)**: Document Context7 validation in decision record

## Current Decision Records

| ADR | Subject | Status | Context7 Verified |
|-----|---------|--------|-------------------|
| 001 | WPGraphQL + WooGraphQL API | Accepted | Yes |
| 002 | Next.js App Router + ISR | Accepted | Yes |
| 003 | Content Pipeline Architecture | Accepted | Partial |
| 004 | Headless Auth Strategy | Deferred | No (Phase 2) |
