# Operations Runbook
## WP-Lzer Headless WooCommerce

> Last updated: 2026-04-02

---

## 1. Content Management

### 1.1 Creating a New Page

```bash
# 1. Create the markdown file
cat > content/pages/contact.md << 'EOF'
---
slug: contact
title: Contact Us
status: draft
template: default
seo:
  title: Contact - Precision CNC
  description: Get in touch with our engineering team.
lastModified: "2026-04-02T10:00:00Z"
---

# Contact Us

Your content here...
EOF

# 2. Validate
node scripts/validate-content.js

# 3. Import to WordPress
wp content import content/pages/contact.md

# 4. Publish
wp post update $(wp post list --post_type=page --pagename=contact --field=ID) --post_status=publish

# 5. Trigger frontend revalidation
node scripts/revalidate.js /page/contact
```

### 1.2 Updating a Policy

```bash
# 1. Edit the policy file
# ... make changes in content/policies/privacy.md ...

# 2. Validate
node scripts/validate-content.js

# 3. Update in WordPress
wp policy set privacy --file=content/policies/privacy.md

# 4. Revalidate
node scripts/revalidate.js /policy/privacy
```

### 1.3 Syncing Site Settings

```bash
# Edit settings
# ... make changes in content/settings/site.json ...

# Sync to WordPress options
wp settings sync content/settings/site.json
```

### 1.4 Batch Content Operations

```bash
# Import all pages
wp content import-dir content/pages --type=page

# Import all policies
wp content import-dir content/policies --type=policy

# Revalidate entire site
node scripts/revalidate.js / /category /page /product /policy
```

---

## 2. Plugin Management

### 2.1 Install WPGraphQL Plugins

```bash
# Using Docker WP-CLI
docker exec -it wp-lzer-wpcli wp plugin install wp-graphql wp-graphql-woocommerce --activate

# Or locally (if WP-CLI installed)
wp plugin install wp-graphql wp-graphql-woocommerce --activate
```

### 2.2 Check Plugin Status

```bash
wp plugin list --status=active
```

### 2.3 Update Plugins (Staging First!)

```bash
# Always test on staging first
wp plugin update wp-graphql --dry-run
wp plugin update wp-graphql-woocommerce --dry-run

# Apply updates on staging
wp plugin update wp-graphql wp-graphql-woocommerce

# Verify GraphQL still works
curl -X POST -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}' \
  http://localhost:8080/graphql
```

---

## 3. Database Operations

### 3.1 Backup Database

```bash
# Create backup
docker exec wp-lzer-mysql mysqldump -u wordpress -pwordpress_secret wp_lzer > backups/wp_lzer_$(date +%Y%m%d_%H%M%S).sql

# Compress
gzip backups/wp_lzer_*.sql
```

### 3.2 Export Content from WordPress

```bash
# Export all pages to markdown (via custom WP-CLI)
wp content export --format=markdown --output=./content/backups/
```

### 3.3 Reset Development Database

```bash
# Drop and recreate
docker exec wp-lzer-mysql mysql -u root -proot_secret -e "DROP DATABASE wp_lzer; CREATE DATABASE wp_lzer;"
docker exec -it wp-lzer-wpcli wp db import
```

---

## 4. Frontend Operations

### 4.1 Start Development Server

```bash
cd frontend
npm run dev
```

### 4.2 Build for Production

```bash
cd frontend
npm run build
npm run start
```

### 4.3 Trigger Manual Revalidation

```bash
# Single path
node scripts/revalidate.js /

# Multiple paths
node scripts/revalidate.js / /category/bearings /product/6205-2rs

# By tag
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: your-secret" \
  -d '{"tags":["products","categories"]}'
```

### 4.4 Clear Next.js Cache

```bash
# Delete .next cache
rm -rf frontend/.next

# Or via API
curl -X POST http://localhost:3000/api/revalidate \
  -d '{"paths":["*"]}' # Use with caution
```

---

## 5. Deployment

### 5.1 Staging Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Update Docker containers
cd docker
docker-compose pull
docker-compose up -d

# 3. Run database migrations if any
docker exec -it wp-lzer-wpcli wp core update-db

# 4. Sync content
wp content import-dir content/pages
wp content import-dir content/policies

# 5. Clear caches
docker exec wp-lzer-wordpress wp cache flush
rm -rf frontend/.next

# 6. Rebuild frontend
cd frontend && npm run build
```

### 5.2 Production Deployment Checklist

- [ ] All staging tests passed
- [ ] Decision records updated for any breaking changes
- [ ] Plugin versions pinned in docker-compose.yml
- [ ] Environment variables configured in production
- [ ] Backup created
- [ ] Smoke test: GraphQL queries return expected data
- [ ] Smoke test: Frontend pages load without errors
- [ ] Monitor error logs for 24 hours post-deployment

---

## 6. Troubleshooting

### 6.1 GraphQL Returns Null

```bash
# Check WPGraphQL is active
wp plugin is-active wp-graphql

# Check GraphQL endpoint
curl -X POST http://localhost:8080/graphql -d '{"query":"{ __typename }"}'

# Enable debug mode
wp config set WP_DEBUG true --raw
wp config set GRAPHQL_DEBUG true --raw
```

### 6.2 Content Not Appearing on Frontend

```bash
# Verify imported in WordPress
wp post list --post_type=page --post_status=publish

# Check GraphQL query
curl -X POST http://localhost:8080/graphql \
  -d '{"query":"{ page(id: \"about\", idType: URI) { id title } }"}'

# Force revalidation
node scripts/revalidate.js /page/about --force
```

### 6.3 Docker Container Issues

```bash
# View container logs
docker logs wp-lzer-wordpress
docker logs wp-lzer-mysql

# Restart containers
cd docker
docker-compose restart

# Rebuild from scratch (WARNING: deletes data)
docker-compose down -v
docker-compose up -d
```

---

## 7. Emergency Procedures

### 7.1 Site Down - Frontend

1. Check Vercel/hosting status
2. Verify WordPress is responding: `curl http://localhost:8080`
3. Check GraphQL: `curl -X POST http://localhost:8080/graphql -d '{"query":"{ __typename }"}'`
4. If WP down: `cd docker && docker-compose restart`
5. If WP up but GraphQL fails: check WPGraphQL plugin status
6. Rollback frontend if recent deploy: `vercel rollback`

### 7.2 Site Down - WordPress

1. Check Docker containers: `docker ps`
2. If exited: `docker-compose up -d`
3. Check database: `docker exec wp-lzer-mysql mysqladmin ping`
4. View error logs: `docker logs wp-lzer-wordpress`
5. If DB corrupted: restore from latest backup

### 7.3 Security Incident

1. Isolate affected container: `docker network disconnect wp-lzer-network wp-lzer-wordpress`
2. Rotate all secrets immediately
3. Check access logs for unauthorized access
4. Restore from clean backup if needed
5. Document incident in security log

---

## 8. Quick Reference Commands

```bash
# Start everything
cd docker && docker-compose up -d

# Stop everything
cd docker && docker-compose down

# View logs
docker logs -f wp-lzer-wordpress

# WP-CLI inside container
docker exec -it wp-lzer-wpcli wp <command>

# Restart services
docker-compose restart wordpress

# Import all content
wp content import-dir content/pages && wp content import-dir content/policies

# Validate all content
node scripts/validate-content.js

# Rebuild frontend
cd frontend && npm run build
```
