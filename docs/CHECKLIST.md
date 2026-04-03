# Phase Checklist
## WP-Lzer Headless WooCommerce Implementation

---

## Phase 0: Foundation Setup

### Gate A: Documentation (Context7)
- [ ] WPGraphQL v1.17.x documentation validated via Context7
- [ ] WPGraphQL for WooCommerce v0.19.x compatibility verified
- [ ] WooCommerce version compatibility confirmed
- [ ] CORS configuration requirements documented
- [ ] Decision record created: `docs/decisions/001-wpgraphql-core-setup.md`

### Gate B: Implementation
- [ ] Docker containers installed and running
- [ ] WordPress installed via WP-CLI
- [ ] WooCommerce installed and configured
- [ ] WPGraphQL installed and activated
- [ ] WPGraphQL for WooCommerce installed and activated
- [ ] Permalinks set to "Post name"
- [ ] CORS headers configured for frontend domain
- [ ] GraphQL endpoint responding to test query

### Gate C: Verification
- [ ] `curl -X POST -H "Content-Type: application/json" -d '{"query":"{ __typename }"}' http://localhost:8080/graphql` returns valid response
- [ ] GraphQL IDE accessible at `/graphql/ide`
- [ ] WooCommerce product types visible in GraphQL schema
- [ ] Test product query returns expected fields

### Artifacts Required
- [ ] Context7 verification notes
- [ ] Docker container status output
- [ ] GraphQL test query output
- [ ] Decision record file

---

## Phase 1: Frontend Development

### Gate A: Documentation (Context7)
- [ ] Next.js 14 App Router documentation validated
- [ ] ISR revalidation behavior confirmed
- [ ] Apollo Client cache invalidation strategy documented
- [ ] Decision record created: `docs/decisions/002-nextjs-routing-caching.md`

### Gate B: Implementation
- [ ] Next.js project scaffolded with TypeScript
- [ ] Tailwind configured with design system tokens
- [ ] Apollo Client configured with WooGraphQL endpoint
- [ ] Homepage component built (from Stitch)
- [ ] Category page component built
- [ ] Product page component built
- [ ] Page slug route implemented
- [ ] Policy slug route implemented
- [ ] ISR configured for each route type

### Gate C: Verification
- [ ] `npm run build` completes without errors
- [ ] Homepage renders with placeholder data
- [ ] Category page shows filter sidebar
- [ ] Product page shows spec sheet layout
- [ ] Visual fidelity matches Stitch design
- [ ] Lighthouse score > 80 (performance)

### Artifacts Required
- [ ] Context7 verification notes
- [ ] Build output
- [ ] Screenshot of each page type
- [ ] Performance audit
- [ ] Code review sign-off

---

## Phase 2: Content Pipeline

### Gate A: Documentation (Context7)
- [ ] WP-CLI custom command registration documented
- [ ] WordPress import/update mechanisms verified
- [ ] Decision record created: `docs/decisions/005-content-pipeline-architecture.md`

### Gate B: Implementation
- [ ] Content schema files created
- [ ] `wp content import` command implemented
- [ ] `wp policy set` command implemented
- [ ] `wp settings sync` command implemented
- [ ] `node scripts/validate-content.js` working
- [ ] `node scripts/revalidate.js` working
- [ ] Markdown parser in headless-cli plugin
- [ ] Sample content files created

### Gate C: Verification
- [ ] Create new page: `wp content import content/pages/about.md`
- [ ] Verify page appears in WordPress admin
- [ ] Verify page accessible via GraphQL
- [ ] Verify page renders on frontend
- [ ] Update existing content and verify sync
- [ ] Test schema validation catches invalid frontmatter
- [ ] LLM-assisted content generation tested

### Artifacts Required
- [ ] Context7 verification notes
- [ ] WP-CLI command test outputs
- [ ] GraphQL query results for imported content
- [ ] Frontend screenshots
- [ ] Schema validation test output

---

## Phase 3: Ops Automation

### Gate A: Documentation
- [ ] Operations runbook drafted
- [ ] Backup strategy documented
- [ ] Deployment process documented

### Gate B: Implementation
- [ ] `Makefile` targets working
- [ ] Database backup script tested
- [ ] Database restore tested
- [ ] Deploy script created and tested
- [ ] Environment variable management in place
- [ ] Plugin version pinning implemented
- [ ] Staging environment configured

### Gate C: Verification
- [ ] Full backup created and verified
- [ ] Restore to fresh database tested
- [ ] Staging deployment tested
- [ ] Rollback procedure tested
- [ ] Runbook reviewed and complete

### Artifacts Required
- [ ] Backup file verified
- [ ] Runbook document
- [ ] Deployment checklist
- [ ] Code review sign-off

---

## Phase 4: Auth (Optional - If Required)

### Gate A: Documentation (Context7)
- [ ] JWT auth plugin security reviewed
- [ ] Token lifecycle requirements documented
- [ ] Decision record created: `docs/decisions/006-headless-auth-strategy.md`

### Gate B: Implementation
- [ ] JWT authentication configured
- [ ] Login/logout mutations working
- [ ] Token refresh implemented
- [ ] Customer account pages built
- [ ] Cart persistence via GraphQL

### Gate C: Verification
- [ ] Login flow tested end-to-end
- [ ] Token refresh tested
- [ ] Logout invalidates token
- [ ] Security audit passed

---

## Emergency Rollback Procedures

If any phase gate fails:

1. **Do not proceed** to next gate
2. **Document** the failure point
3. **Rollback** any changes made
4. **Fix** the root cause
5. **Re-run** the failed gate
6. **Document** the fix in decision record

## Sign-Off Requirements

| Phase | Gate A | Gate B | Gate C |
|-------|--------|--------|--------|
| Phase 0 | Context7 notes | Implementation complete | Verification artifacts |
| Phase 1 | Context7 notes | Build passes | Screenshots + Review |
| Phase 2 | Context7 notes | Commands work | Import verified |
| Phase 3 | Docs complete | Scripts work | Backup verified |

## Completion Criteria

All phases must have:
1. Gate A: Context7 validated decisions
2. Gate B: Working implementation
3. Gate C: Verification evidence
4. Code review sign-off (Phase 1 and 3)
