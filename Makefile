.PHONY: help install start stop restart logs db-backup db-restore wp-cli validate revalidate clean

# Default goal
help:
	@echo "WP-Lzer Operations Makefile"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Docker targets:"
	@echo "  install      - Start Docker containers (first time)"
	@echo "  start        - Start Docker containers"
	@echo "  stop         - Stop Docker containers"
	@echo "  restart      - Restart Docker containers"
	@echo "  logs         - View WordPress logs"
	@echo "  wp-cli       - Run WP-CLI command (usage: make wp-cli CMD='plugin list')"
	@echo ""
	@echo "Content targets:"
	@echo "  validate     - Validate all content against schemas"
	@echo "  import-pages - Import all pages to WordPress"
	@echo "  import-policies - Import all policies to WordPress"
	@echo "  sync-settings - Sync site settings"
	@echo "  revalidate   - Trigger frontend revalidation"
	@echo ""
	@echo "Database targets:"
	@echo "  db-backup    - Backup database"
	@echo "  db-restore   - Restore database (usage: make db-restore FILE=backup.sql)"
	@echo ""
	@echo "Development targets:"
	@echo "  frontend-dev  - Start frontend dev server"
	@echo "  build        - Build frontend for production"
	@echo "  clean        - Clean caches"
	@echo ""

# Docker targets
install:
	cd docker && docker-compose up -d
	@echo "Waiting for WordPress to be ready..."
	@sleep 10
	@docker exec -it wp-lzer-wpcli wp core is-installed || echo "WordPress not installed yet"

start:
	cd docker && docker-compose start

stop:
	cd docker && docker-compose stop

restart:
	cd docker && docker-compose restart

logs:
	docker logs -f wp-lzer-wordpress

wp-cli:
	@docker exec -it wp-lzer-wpcli wp $(CMD)

# Content targets
validate:
	node scripts/validate-content.js

import-pages:
	@docker exec -it wp-lzer-wpcli wp content import-dir /var/www/html/content/pages || \
	echo "Note: Run 'cd docker && docker-compose up -d' first"

import-policies:
	@docker exec -it wp-lzer-wpcli wp content import-dir /var/www/html/content/policies

sync-settings:
	@docker exec -it wp-lzer-wpcli wp settings sync /var/www/html/content/settings/site.json

revalidate:
	node scripts/revalidate.js

revalidate-all:
	node scripts/revalidate.js / /category /page /product /policy

# Database targets
db-backup:
	@mkdir -p backups
	docker exec wp-lzer-mysql mysqldump -u wordpress -pwordpress_secret wp_lzer > backups/wp_lzer_$(shell date +%Y%m%d_%H%M%S).sql
	@gzip backups/wp_lzer_*.sql
	@echo "Backup created in backups/"

db-restore:
	@if [ -z "$(FILE)" ]; then echo "Usage: make db-restore FILE=backup.sql"; exit 1; fi
	gunzip -c $(FILE) | docker exec -i wp-lzer-mysql mysql -u wordpress -pwordpress_secret wp_lzer
	@echo "Database restored from $(FILE)"

# Development targets
frontend-dev:
	cd frontend && npm run dev

build:
	cd frontend && npm run build

type-check:
	cd frontend && npm run type-check

clean:
	cd frontend && rm -rf .next
	docker exec wp-lzer-wordpress wp cache flush
	@echo "Caches cleared"
