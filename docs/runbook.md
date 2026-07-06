# Operations Runbook

## WP-Lzer Hostinger Production

Last updated: 2026-05-20

Production target is Hostinger Web/WordPress hosting with a static Next.js export. Do not use Vercel, Netlify, a Node.js production server, ISR, Next API routes, middleware, or customer-visible WooCommerce account templates unless the architecture decision is explicitly changed.

The business rule is simple: professional customer experience beats shortcuts. WordPress/WooCommerce is the commerce engine; the public storefront is the Lazer Online frontend.

## Production Shape

- `https://lazeronline.com.tr/` serves the static Next.js storefront.
- `/products/`, `/product/*`, `/category/*`, `/login/`, `/signup/`, `/my-account/`, `/orders/`, and `/addresses/` are frontend-owned routes.
- `/checkout/` is the frontend handoff page.
- `/odeme/` is the clean WooCommerce payment page.
- WordPress admin, WooCommerce products, orders, email, payment settings, and media stay in WordPress.
- The custom `headless-cli` plugin exposes the narrow REST bridge used by the frontend.

## Deploy Flow

1. Create production backups before changing live files:
   ```bash
   mkdir -p /home/u870711808/backups/wp-lazer-$(date +%Y%m%d-%H%M%S)
   ```
   Back up `public_html`, the database, and any import files/reports.

2. Validate content locally:
   ```bash
   npm run validate
   ```

3. Import products when needed:
   ```bash
   wp lzer-products import /home/u870711808/products.json --report=/home/u870711808/products-import-report.json
   ```

4. Build the static storefront:
   ```bash
   npm run hostinger:build
   ```

5. Upload only `frontend/out/` contents to Hostinger `public_html`. Preserve WordPress core files, `wp-content`, `wp-config.php`, `.htaccess`, and the static root router.

6. Purge cache:
   ```bash
   wp litespeed-purge all --allow-root
   wp cache flush --allow-root
   ```

7. Smoke test:
   ```bash
   curl -I https://lazeronline.com.tr/
   curl -I https://lazeronline.com.tr/products/
   curl -I https://lazeronline.com.tr/login/
   curl -I https://lazeronline.com.tr/odeme/
   ```

## Required Smoke Tests

- Home page renders the static frontend, not Astra or a default WordPress theme.
- Product listing links to real `/product/*` pages.
- Product page descriptions are Turkish and decoded, with no HTML entities such as `&Ccedil;`.
- SEO metadata uses `https://lazeronline.com.tr`, not localhost.
- `/checkout/` posts the frontend cart into WooCommerce through `POST /wp-json/wp-lzer/v1/checkout`.
- `/odeme/` opens with the WooCommerce cart session.
- `/login/`, `/signup/`, `/my-account/`, `/orders/`, and `/addresses/` stay in the frontend design system.
- Frontend bundle contains no Woo consumer secret, admin token, revalidation secret, or SSH credential.

## Product Import Rule

Excel or CSV is not uploaded blindly. First transform and validate the file into the project product schema, then import by SKU. Imports should be idempotent: same SKU updates the existing WooCommerce product instead of creating duplicates.

Images should be sideloaded into the WordPress Media Library and attached to products. The static product JSON must then be regenerated with live WooCommerce IDs and live media URLs before rebuilding the frontend.

## Checkout Bridge

Endpoint:

```text
POST /wp-json/wp-lzer/v1/checkout
```

Payload:

```json
{
  "items": [
    { "product_id": 2171, "quantity": 1 }
  ]
}
```

Expected response includes `checkout_url`, currently:

```text
https://lazeronline.com.tr/odeme/
```

## Account Bridge

The account UX is frontend-owned. The plugin exposes:

```text
POST /wp-json/wp-lzer/v1/auth/login
POST /wp-json/wp-lzer/v1/auth/register
POST /wp-json/wp-lzer/v1/auth/logout
GET  /wp-json/wp-lzer/v1/customer/me
GET  /wp-json/wp-lzer/v1/customer/orders
GET  /wp-json/wp-lzer/v1/customer/addresses
PUT  /wp-json/wp-lzer/v1/customer/addresses
```

The browser only receives public URLs and an HTTP-only customer session cookie. Woo REST consumer secrets and admin credentials stay server-side.

## Rollback

- Frontend rollback: re-upload the previous known-good `frontend/out/` artifact and purge LiteSpeed cache.
- Product rollback: restore the WooCommerce database and `wp-content/uploads` backup, or reverse from the import report.
- WordPress rollback: restore both database and files from the same backup timestamp.

## Security Notes

- Rotate any credential that has been shared in chat or terminal history.
- Do not commit `.env.local`, SSH passwords, Woo consumer secrets, or WordPress admin passwords.
- Keep Hostinger SSH as an operations channel; avoid destructive commands unless the rollback point is confirmed.
