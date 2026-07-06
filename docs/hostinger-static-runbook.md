# Hostinger Production Runbook

WP-Lazer runs as a professional headless WooCommerce storefront on Hostinger. The goal is not the fastest or easiest deployment path; the goal is a production-grade customer experience that can support a serious ecommerce business without exposing WordPress implementation details to shoppers.

## Production Shape

- `https://lazeronline.com.tr` serves the static Next.js export from `public_html`.
- Public customer routes must stay brand-native and frontend-owned: `/`, `/products`, `/product/*`, `/category/*`, `/login`, `/signup`, `/my-account`, `/orders`, `/addresses`.
- WordPress/WooCommerce remains the commerce engine for product administration, checkout/payment processing, orders, email, and media, but customer-facing URLs must not expose `/wp`, `/wordpress`, `/wp-admin`, or raw WooCommerce templates.
- Checkout may be powered by WooCommerce behind clean routes such as `/checkout`, `/order-pay/*`, and `/order-received/*`. If a backend directory is used internally, hide it with server routing or use a non-customer admin subdomain.
- Account UX is frontend-owned. Login, signup, account overview, orders, and addresses must use the project design system and communicate with WordPress through a dedicated REST bridge plugin.
- Next.js must stay compatible with `output: 'export'`; do not add API routes, middleware, ISR, cookies, or server-only auth flows.
- Frontend secrets are public by definition. Never expose Woo REST consumer secrets, admin tokens, or private revalidation secrets in `NEXT_PUBLIC_*`.
- Do not deploy source code, `node_modules`, `.env`, build caches, or private credentials into the public web root. Only deploy the static export artifact plus intentional server routing files.

## Non-Negotiables

- Professional result beats shortcut implementation. Do not choose an easier route if it makes the site look like default WordPress/WooCommerce.
- Customer-visible WordPress paths are not acceptable for production storefront UX.
- WooCommerce native templates are acceptable only for behind-the-scenes payment/order handling, and only when wrapped behind clean URLs.
- Account pages must visually match the frontend storefront.
- Any production move must start with a file backup and database backup.
- Any deploy must end with a smoke test of frontend routes, checkout, account bridge endpoints, and Woo admin access.

## Environment

```env
WP_GRAPHQL_URL=https://lazeronline.com.tr/graphql
NEXT_PUBLIC_GRAPHQL_URL=https://lazeronline.com.tr/graphql
NEXT_PUBLIC_WP_HOME=https://lazeronline.com.tr
NEXT_PUBLIC_WP_REST_URL=https://lazeronline.com.tr/wp-json
NEXT_PUBLIC_WOO_CHECKOUT_PATH=/odeme/
NEXT_PUBLIC_SITE_URL=https://lazeronline.com.tr
```

`WP_GRAPHQL_URL` is used during build. `NEXT_PUBLIC_*` values are bundled into the static frontend.

## Deploy Flow

1. Backup production files and database before changing live paths.
2. Validate content:
   ```bash
   npm run validate
   ```
3. Dry-run product import:
   ```bash
   npm run products:import -- products.xlsx
   ```
4. Apply product import when Woo credentials are configured:
   ```bash
   WOO_REST_URL=https://example.com/wp-json/wc/v3 \
   WOO_CONSUMER_KEY=ck_xxx \
   WOO_CONSUMER_SECRET=cs_xxx \
   npm run products:import -- products.xlsx --apply
   ```
5. Build the static frontend:
   ```bash
   npm run hostinger:build
   ```
6. Upload only `frontend/out/` contents to Hostinger `public_html`.
7. Preserve the root static router and production routing rules that keep commerce/backend internals hidden.
8. Smoke test:
   - `/`
   - `/products/`
   - `/categories/`
   - one `/category/<slug>/`
   - one `/product/<slug>/`
   - `/checkout/`
   - `/odeme/`
   - `/login/`
   - `/signup/`
   - `/my-account/`
   - WooCommerce admin access through the agreed private/admin route
   - clean checkout and order-received flow

## WooCommerce Checkout Bridge

The `headless-cli` WordPress plugin exposes:

```text
POST /wp-json/wp-lzer/v1/checkout
```

Payload:

```json
{
  "items": [
    { "product_id": 123, "quantity": 2 }
  ]
}
```

The endpoint validates purchasable, in-stock WooCommerce products, creates a Woo cart session, and returns `checkout_url`.

## Account Bridge

The storefront account area must remain frontend-owned. WordPress should expose narrowly scoped REST endpoints through the project plugin:

```text
POST /wp-json/wp-lzer/v1/auth/login
POST /wp-json/wp-lzer/v1/auth/register
POST /wp-json/wp-lzer/v1/auth/logout
GET  /wp-json/wp-lzer/v1/customer/me
GET  /wp-json/wp-lzer/v1/customer/orders
GET  /wp-json/wp-lzer/v1/customer/addresses
PUT  /wp-json/wp-lzer/v1/customer/addresses
```

Never place Woo REST consumer secrets in the browser. The bridge must enforce user ownership for orders and customer data.

## Rollback

- Frontend rollback: re-upload the previous known-good `frontend/out/` artifact.
- Product rollback: restore WooCommerce DB/media backup or reverse the import from the generated import report.
- WordPress rollback: restore database plus `wp-content/uploads`.
