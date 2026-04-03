# Superpowers Integration Guide

## Overview
This project uses Superpowers skills as **mandatory process controls** for execution quality, not optional guidance.

## Skills and Trigger Points

### 1. `using-superpowers`
**When**: Start of every execution session
**Purpose**: Establish context and skill awareness

```bash
# At the start of each session, read the skill file:
# C:\Users\Kaan\.cursor\plugins\cache\cursor-public\superpowers\...\skills\using-superpowers\SKILL.md
```

### 2. `writing-plans`
**When**: Before touching implementation scope in each phase
**Purpose**: Lock scope and acceptance criteria

```bash
# Before starting Phase 0:
# Read: C:\Users\Kaan\.cursor\plugins\cache\cursor-public\superpowers\...\skills\writing-plans\SKILL.md
# Output: Phase-specific sub-plan with acceptance criteria
```

### 3. `test-driven-development`
**When**: Before implementing content pipeline, GraphQL contracts, or critical adapters
**Purpose**: Use test/fixture-first approach

```bash
# Read: C:\Users\Kaan\.cursor\plugins\cache\cursor-public\superpowers\...\skills\test-driven-development\SKILL.md
# Apply to:
#   - Content validation scripts
#   - GraphQL query fixtures
#   - WP-CLI command behavior
```

### 4. `systematic-debugging`
**When**: Any failure in API, auth, cache, import, revalidate, or deployment
**Purpose**: Require root-cause analysis

```bash
# Read: C:\Users\Kaan\.cursor\plugins\cache\cursor-public\superpowers\...\skills\systematic-debugging\SKILL.md
# Required for:
#   - GraphQL query failures
#   - WP-CLI import errors
#   - Cache invalidation issues
#   - Docker container failures
```

### 5. `verification-before-completion`
**When**: Before claiming any phase complete
**Purpose**: No "done" without evidence

```bash
# Read: C:\Users\Kaan\.cursor\plugins\cache\cursor-public\superpowers\...\skills\verification-before-completion\SKILL.md
# Required artifacts:
#   - Command output (test results, import logs)
#   - API response samples
#   - Screenshot/verification of UI
```

### 6. `requesting-code-review`
**When**: After major phase completion before merge/release
**Purpose**: Mandatory review checkpoint

```bash
# Read: C:\Users\Kaan\.cursor\plugins\cache\cursor-public\superpowers\...\skills\requesting-code-review\SKILL.md
# Required for:
#   - Phase 0 completion (foundation)
#   - Phase 1 completion (frontend)
#   - Phase 2 completion (content pipeline)
```

## Phase-Gate Checklist

### Phase 0: Foundation
- [ ] `writing-plans` skill read and applied
- [ ] Context7 validated: WPGraphQL setup
- [ ] Context7 validated: WooGraphQL compatibility
- [ ] Docker containers running
- [ ] GraphQL endpoint responding
- [ ] `verification-before-completion` evidence captured

### Phase 1: Frontend
- [ ] `writing-plans` skill read and applied
- [ ] Context7 validated: Next.js ISR behavior
- [ ] Context7 validated: Apollo Client caching
- [ ] Homepage component complete
- [ ] Category page with GraphQL data
- [ ] Product page with GraphQL data
- [ ] Visual fidelity verified against Stitch
- [ ] `verification-before-completion` evidence captured
- [ ] `requesting-code-review` completed

### Phase 2: Content Pipeline
- [ ] `writing-plans` skill read and applied
- [ ] `test-driven-development` for validation scripts
- [ ] WP-CLI commands implemented
- [ ] Content import working end-to-end
- [ ] Schema validation passing
- [ ] LLM-assisted content generation tested
- [ ] `verification-before-completion` evidence captured

### Phase 3: Ops Automation
- [ ] `writing-plans` skill read and applied
- [ ] Backup scripts tested
- [ ] Deploy scripts tested
- [ ] Runbook documented
- [ ] `verification-before-completion` evidence captured
- [ ] `requesting-code-review` completed

## Enforcement Rules

1. **Single phase**: Only one phase can be "in progress" at a time
2. **No "works on my machine"**: All completions require verification artifacts
3. **Bugfixes require RCA**: Systematic debugging evidence for all bugs
4. **Gate failure = rollback**: If any gate fails, rollback and fix before proceeding

## Superpowers Skill Files

| Skill | Path |
|-------|------|
| using-superpowers | `C:\Users\Kaan\.cursor\plugins\cache\cursor-public\superpowers\...\skills\using-superpowers\SKILL.md` |
| writing-plans | `C:\Users\Kaan\.cursor\plugins\cache\cursor-public\superpowers\...\skills\writing-plans\SKILL.md` |
| test-driven-development | `C:\Users\Kaan\.cursor\plugins\cache\cursor-public\superpowers\...\skills\test-driven-development\SKILL.md` |
| systematic-debugging | `C:\Users\Kaan\.cursor\plugins\cache\cursor-public\superpowers\...\skills\systematic-debugging\SKILL.md` |
| verification-before-completion | `C:\Users\Kaan\.cursor\plugins\cache\cursor-public\superpowers\...\skills\verification-before-completion\SKILL.md` |
| requesting-code-review | `C:\Users\Kaan\.cursor\plugins\cache\cursor-public\superpowers\...\skills\requesting-code-review\SKILL.md` |

## Deliverables Per Phase

### Artifacts Required
- Phase plan output
- Context7 decision records
- Test output (if applicable)
- Verification evidence
- Review checkpoint log

### File Naming Convention
```
artifacts/
├── phase-0/
│   ├── plan.md
│   ├── context7-wpgraphql.md
│   └── verification.md
├── phase-1/
│   ├── plan.md
│   ├── context7-nextjs.md
│   ├── test-output.md
│   └── verification.md
└── ...
```
