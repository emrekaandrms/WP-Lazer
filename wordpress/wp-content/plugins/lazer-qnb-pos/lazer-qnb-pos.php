<?php
/**
 * Plugin Name: Lazer Online - QNB Finansbank Sanal POS
 * Description: QNB Finansbank (PayFor) 3D Secure ile dogrudan WooCommerce odeme gateway'i. Araci SaaS kullanmaz; mews/pos kutuphanesi uzerinden bankaya dogrudan baglanir.
 * Version: 1.0.0
 * Requires Plugins: woocommerce
 */

if (!defined('ABSPATH')) {
    exit;
}

// Credentials & mode live in wp-config.php as constants (never in git, never in WC admin DB rows,
// never in this repo). See docs/decisions/ or ask the deploy owner for the constant block.
// Required constants: QNB_MERCHANT_ID, QNB_USER_CODE, QNB_USER_PASSWORD, QNB_3D_MERCHANT_KEY
// Optional: QNB_PAYFOR_TEST_MODE (default true)

add_action('plugins_loaded', function () {
    if (!class_exists('WC_Payment_Gateway')) {
        return; // WooCommerce not active
    }

    $autoload = __DIR__ . '/vendor/autoload.php';
    if (!file_exists($autoload)) {
        add_action('admin_notices', function () {
            echo '<div class="notice notice-error"><p><strong>Lazer QNB POS:</strong> vendor/autoload.php bulunamadi. Sunucuda <code>composer install</code> calistirilmali.</p></div>';
        });
        return;
    }
    require_once $autoload;

    require_once __DIR__ . '/class-wc-gateway-qnb-payfor.php';

    add_filter('woocommerce_payment_gateways', function ($gateways) {
        $gateways[] = 'WC_Gateway_QNB_PayFor';
        return $gateways;
    });
});
