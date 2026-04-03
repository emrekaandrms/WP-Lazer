# Docker Setup

This directory contains the Docker Compose configuration for the WP-Lzer project.

## Services

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| WordPress | wp-lzer-wordpress | 8080 | WordPress with PHP 8.2 |
| MySQL | wp-lzer-mysql | 3306 | MySQL 8.0 database |
| WP-CLI | wp-lzer-wpcli | - | WordPress CLI tool |

## Quick Start

1. Copy environment file:
```
cp .env.example .env
```

2. Start containers:
```
docker-compose up -d
```

3. Wait for WordPress to initialize (~2 minutes)

4. Install WordPress:
```
docker exec -it wp-lzer-wpcli wp core install --url=http://localhost:8080 --title="WP-Lzer" --admin_user=admin --admin_password=password --admin_email=admin@example.com
```

5. Install required plugins:
```
docker exec -it wp-lzer-wpcli wp plugin install wp-graphql wp-graphql-woocommerce --activate
```

## Useful Commands

```
# View logs
docker logs -f wp-lzer-wordpress

# Run WP-CLI commands
docker exec -it wp-lzer-wpcli wp <command>

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Completely reset (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

## File Structure

```
docker/
├── docker-compose.yml    # Service definitions
├── .env.example         # Environment template
└── README.md            # This file
```

## Volumes

| Volume | Description |
|--------|-------------|
| wp-lzer-db-data | MySQL data |

## Ports

- 8080: WordPress (Apache)
- 3306: MySQL (internal only)
