<?php
/**
 * Root router for Hostinger static frontend + WordPress/WooCommerce backend.
 *
 * The customer-facing homepage is the static Next export at /index.html.
 * WordPress still handles WooCommerce checkout, REST, admin, media, and any
 * route not materialized by the static export.
 */

$request_path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

if ($request_path === '/' && file_exists(__DIR__ . '/index.html')) {
    header('Content-Type: text/html; charset=UTF-8');
    readfile(__DIR__ . '/index.html');
    exit;
}

define('WP_USE_THEMES', true);
require __DIR__ . '/wp-blog-header.php';
