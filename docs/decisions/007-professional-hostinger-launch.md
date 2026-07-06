# ADR 007: Professional Hostinger Launch Standard

## Status

Accepted

## Context

The storefront is intended to compete with serious ecommerce alternatives, not to behave like a default WooCommerce theme. The client-facing experience must justify a premium implementation budget and support ongoing commercial growth.

The project uses Hostinger access and WooCommerce, but the business requirement is a polished headless storefront:

- The customer must see a consistent Lazer Online frontend experience.
- WooCommerce may power checkout, payments, orders, products, and admin workflows.
- WordPress implementation details must not leak into customer-facing navigation, URLs, templates, or account screens.
- The goal is the most professional durable result, not the fastest shortcut.

## Decision

Production will use a headless commerce shape:

```text
lazeronline.com.tr              -> static Next.js storefront
lazeronline.com.tr/products     -> static frontend catalog
lazeronline.com.tr/product/*    -> static frontend product pages
lazeronline.com.tr/category/*   -> static frontend category pages
lazeronline.com.tr/login        -> static frontend account UX
lazeronline.com.tr/signup       -> static frontend account UX
lazeronline.com.tr/my-account   -> static frontend account UX
lazeronline.com.tr/checkout     -> frontend checkout handoff
lazeronline.com.tr/odeme        -> clean WooCommerce payment route
```

WordPress/WooCommerce remains the backend commerce engine, but it must be hidden behind clean routing or an admin/backend location that customers do not encounter during normal shopping.

Visible routes such as `/wp/checkout`, `/wordpress/my-account`, raw WooCommerce account templates, and default WordPress frontend pages are not acceptable for the final customer experience.

## Implementation Rules

- Deploy only the static `frontend/out` artifact to the public storefront root.
- Keep frontend account pages in the project design system.
- Build a WordPress REST bridge for account login, registration, current customer, orders, and addresses.
- Keep checkout URL clean, even if WooCommerce handles the payment flow internally.
- Keep all Woo admin/consumer secrets server-side.
- Maintain pre-deploy backups and rollback artifacts.
- Treat Hostinger SSH as an operations channel, not as a place to improvise destructive changes.

## Consequences

- Deployment is more complex than simply uploading WordPress or redirecting users to WooCommerce pages.
- Account work requires custom WordPress plugin endpoints and frontend state handling.
- Checkout routing must be tested carefully because WooCommerce still owns payment/order internals.
- The customer-facing result remains consistent, branded, and professionally defensible.

## Current Production Note

As of 2026-05-20, SSH access confirmed WordPress is installed at:

```text
/home/u870711808/domains/lazeronline.com.tr/public_html
```

Backups were created before any live relocation/deploy work:

```text
/home/u870711808/backups/wp-lazer-20260520-103426/public_html-files.tar.gz
/home/u870711808/backups/wp-lazer-20260520-103426/lazeronline-db.sql.gz
```

Current clean WooCommerce checkout route:

```text
https://lazeronline.com.tr/odeme/
```
