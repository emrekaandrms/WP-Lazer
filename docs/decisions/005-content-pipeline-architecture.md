# ADR-003: Terminal-First Content Pipeline Architecture

## Status
Accepted

## Date
2026-04-02

## Context
We need to manage all content (pages, policies, settings) without opening WordPress Admin. Content should be version-controlled in Git, editable via LLM prompts, and synchronized to WordPress through an automated pipeline.

## Decision
Implement a **Git-based content pipeline** with WP-CLI as the synchronization layer.

### Directory Structure
```
content/
├── pages/           # Static pages (about.md, contact.md)
├── policies/        # Legal/policy pages (privacy.md, terms.md)
├── settings/        # Site configuration (site.json)
└── schemas/        # JSON Schema definitions for validation
```

### File Format: Markdown + Frontmatter
```yaml
---
slug: about
title: About Us
status: draft
template: default
seo:
  title: About - Precision CNC
  description: Learn about our precision engineering services.
lastModified: "2026-04-02T10:00:00Z"
---

# Content below frontmatter
```

### Pipeline Steps

1. **Create/Edit** → Write markdown file in `content/` directory
2. **Validate** → `node scripts/validate-content.js` (validates against JSON Schema)
3. **Import** → `wp content import content/pages/about.md` (WP-CLI custom command)
4. **Sync Settings** → `wp settings sync content/settings/site.json`
5. **Revalidate** → `node scripts/revalidate.js /page/about` (triggers Next.js ISR)

### LLM Integration Workflow
```bash
# Example: Generate and publish a new policy
$ llm "Write a KVKK compliance policy for our B2B CNC parts store"
$ # LLM writes to content/policies/kvkk.md
$ node scripts/validate-content.js
$ wp policy set kvkk --file=content/policies/kvkk.md
$ node scripts/revalidate.js /policy/kvkk
```

### WP-CLI Custom Commands (to be implemented)

| Command | Description |
|---------|-------------|
| `wp content import <file>` | Import single content file |
| `wp content import-dir <dir>` | Batch import directory |
| `wp policy set <slug> --file=<path>` | Set/update policy page |
| `wp settings sync <file>` | Sync settings from JSON |
| `wp validate content` | Validate all content against schemas |

## Consequences
### Positive
- Full version control for all content
- No WordPress Admin needed for daily content operations
- LLM can generate content directly into the pipeline
- Audit trail for all content changes via Git history
- CI/CD integration possible

### Negative
- Requires WP-CLI on the server (standard in Docker setup)
- Markdown to HTML conversion may need refinement
- Complex nested content (e.g., page builders) not supported
- Requires discipline to keep Git and WordPress in sync

## References
- WP-CLI Commands: https://developer.wordpress.org/cli/commands/
- JSON Schema: https://json-schema.org/
- Frontmatter spec: https://jekyllrb.com/docs/front-matter/
