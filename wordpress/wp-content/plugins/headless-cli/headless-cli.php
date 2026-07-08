<?php
/**
 * Plugin Name: Headless CLI Commands
 * Plugin URI: https://example.com
 * Description: Custom WP-CLI commands for headless WooCommerce content management
 * Version: 1.0.0
 * Author: WP-Lzer
 * Author URI: https://example.com
 * Requires at least: 6.0
 * Requires PHP: 8.1
 * License: GPL v2 or later
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {
    register_rest_route('wp-lzer/v1', '/checkout', [
        'methods' => 'POST',
        'callback' => 'wp_lzer_prepare_checkout',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('wp-lzer/v1', '/auth/login', [
        'methods' => 'POST',
        'callback' => 'wp_lzer_auth_login',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('wp-lzer/v1', '/auth/register', [
        'methods' => 'POST',
        'callback' => 'wp_lzer_auth_register',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('wp-lzer/v1', '/auth/logout', [
        'methods' => 'POST',
        'callback' => 'wp_lzer_auth_logout',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('wp-lzer/v1', '/customer/me', [
        'methods' => 'GET',
        'callback' => 'wp_lzer_customer_me',
        'permission_callback' => 'wp_lzer_rest_is_customer',
    ]);

    register_rest_route('wp-lzer/v1', '/customer/orders', [
        'methods' => 'GET',
        'callback' => 'wp_lzer_customer_orders',
        'permission_callback' => 'wp_lzer_rest_is_customer',
    ]);

    register_rest_route('wp-lzer/v1', '/customer/addresses', [
        'methods' => ['GET', 'PUT'],
        'callback' => 'wp_lzer_customer_addresses',
        'permission_callback' => 'wp_lzer_rest_is_customer',
    ]);

    register_rest_route('wp-lzer/v1', '/order-tracking', [
        'methods' => 'POST',
        'callback' => 'wp_lzer_order_tracking',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('wp-lzer/v1', '/newsletter/subscribe', [
        'methods' => 'POST',
        'callback' => 'wp_lzer_newsletter_subscribe',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('wp-lzer/v1', '/reviews', [
        'methods' => 'GET',
        'callback' => 'wp_lzer_get_reviews',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('wp-lzer/v1', '/review', [
        'methods' => 'POST',
        'callback' => 'wp_lzer_submit_review',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('wp-lzer/v1', '/qnb/checkout', [
        'methods' => 'POST',
        'callback' => 'wp_lzer_qnb_checkout',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('wp-lzer/v1', '/qnb-return', [
        'methods' => ['GET', 'POST'],
        'callback' => 'wp_lzer_qnb_return',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('wp-lzer/v1', '/order-summary', [
        'methods' => 'GET',
        'callback' => 'wp_lzer_order_summary',
        'permission_callback' => '__return_true',
    ]);
});

// Apply the order note captured during headless checkout to the created WooCommerce order.
add_action('woocommerce_checkout_create_order', function ($order) {
    if (function_exists('WC') && WC()->session) {
        $note = WC()->session->get('wp_lzer_order_note');
        if (!empty($note)) {
            $order->set_customer_note($note);
            WC()->session->__unset('wp_lzer_order_note');
        }
    }
}, 10, 1);

add_action('rest_pre_serve_request', function ($served, $result, $request) {
    if (strpos($request->get_route(), '/wp-lzer/v1/') !== 0) {
        return $served;
    }

    $origin = get_http_origin();
    $allowed_origin = get_option('headless_frontend_url');

    if ($origin && $allowed_origin && untrailingslashit($origin) === untrailingslashit($allowed_origin)) {
        header('Access-Control-Allow-Origin: ' . esc_url_raw($origin));
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Content-Type, X-WP-Nonce');
        header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
    }

    return $served;
}, 10, 3);

function wp_lzer_public_user(WP_User $user) {
    return [
        'id' => $user->ID,
        'email' => $user->user_email,
        'first_name' => get_user_meta($user->ID, 'first_name', true),
        'last_name' => get_user_meta($user->ID, 'last_name', true),
        'display_name' => $user->display_name,
        'is_admin' => user_can($user->ID, 'manage_options'),
    ];
}

function wp_lzer_auth_cookie_name() {
    return 'wp_lzer_customer';
}

function wp_lzer_sign_customer_token($user_id, $expiration) {
    $payload = absint($user_id) . '|' . absint($expiration);
    $signature = hash_hmac('sha256', $payload, wp_salt('auth'));
    return base64_encode($payload . '|' . $signature);
}

function wp_lzer_parse_customer_token($token) {
    $decoded = base64_decode((string) $token, true);
    if (!$decoded) {
        return 0;
    }

    $parts = explode('|', $decoded);
    if (count($parts) !== 3) {
        return 0;
    }

    [$user_id, $expiration, $signature] = $parts;
    $payload = absint($user_id) . '|' . absint($expiration);
    $expected = hash_hmac('sha256', $payload, wp_salt('auth'));

    if (!hash_equals($expected, $signature) || time() > absint($expiration)) {
        return 0;
    }

    return absint($user_id);
}

function wp_lzer_set_customer_cookie($user_id, $remember = true) {
    $expiration = time() + ($remember ? MONTH_IN_SECONDS : DAY_IN_SECONDS);
    $token = wp_lzer_sign_customer_token($user_id, $expiration);

    setcookie(wp_lzer_auth_cookie_name(), $token, [
        'expires' => $expiration,
        'path' => '/',
        'secure' => is_ssl(),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function wp_lzer_clear_customer_cookie() {
    setcookie(wp_lzer_auth_cookie_name(), '', [
        'expires' => time() - HOUR_IN_SECONDS,
        'path' => '/',
        'secure' => is_ssl(),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function wp_lzer_get_customer_user_id() {
    if (is_user_logged_in()) {
        return get_current_user_id();
    }

    $token = $_COOKIE[wp_lzer_auth_cookie_name()] ?? '';
    $user_id = wp_lzer_parse_customer_token($token);

    if ($user_id && get_user_by('id', $user_id)) {
        wp_set_current_user($user_id);
        return $user_id;
    }

    return 0;
}

function wp_lzer_rest_is_customer() {
    if (wp_lzer_get_customer_user_id()) {
        return true;
    }

    return new WP_Error('not_logged_in', 'Oturum bulunamadı.', ['status' => 401]);
}

function wp_lzer_customer_payload($user_id) {
    $user = get_user_by('id', $user_id);
    if (!$user) {
        return null;
    }

    return [
        'user' => wp_lzer_public_user($user),
        'addresses' => wp_lzer_get_customer_address_payload($user_id),
    ];
}

function wp_lzer_get_customer_address_payload($user_id) {
    $fields = ['first_name', 'last_name', 'company', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country', 'email', 'phone'];
    $addresses = [
        'billing' => [],
        'shipping' => [],
    ];

    foreach ($addresses as $type => $_) {
        foreach ($fields as $field) {
            $addresses[$type][$field] = get_user_meta($user_id, $type . '_' . $field, true);
        }
    }

    return $addresses;
}

function wp_lzer_auth_login(WP_REST_Request $request) {
    $login = sanitize_text_field($request->get_param('email') ?: $request->get_param('username'));
    $password = (string) $request->get_param('password');
    $remember = rest_sanitize_boolean($request->get_param('remember') ?? true);

    if (!$login || !$password) {
        return new WP_Error('missing_credentials', 'E-posta ve şifre zorunludur.', ['status' => 400]);
    }

    if (is_email($login)) {
        $user = get_user_by('email', $login);
        if ($user) {
            $login = $user->user_login;
        }
    }

    $user = wp_signon([
        'user_login' => $login,
        'user_password' => $password,
        'remember' => $remember,
    ], is_ssl());

    if (is_wp_error($user)) {
        return new WP_Error('invalid_login', 'E-posta veya şifre hatalı.', ['status' => 401]);
    }

    wp_set_current_user($user->ID);
    wp_set_auth_cookie($user->ID, $remember, is_ssl());
    wp_lzer_set_customer_cookie($user->ID, $remember);

    return rest_ensure_response(wp_lzer_customer_payload($user->ID));
}

function wp_lzer_auth_register(WP_REST_Request $request) {
    if (!function_exists('wc_create_new_customer')) {
        return new WP_Error('woocommerce_missing', 'WooCommerce aktif değil.', ['status' => 503]);
    }

    $email = sanitize_email($request->get_param('email'));
    $password = (string) $request->get_param('password');
    $first_name = sanitize_text_field($request->get_param('first_name'));
    $last_name = sanitize_text_field($request->get_param('last_name'));
    $phone = sanitize_text_field($request->get_param('phone'));
    $terms_accepted = rest_sanitize_boolean($request->get_param('terms_accepted'));

    if (!$email || !$password || strlen($password) < 8) {
        return new WP_Error('invalid_registration', 'Geçerli bir e-posta ve en az 8 karakterlik şifre zorunludur.', ['status' => 400]);
    }

    if (!$terms_accepted) {
        return new WP_Error('terms_required', 'Satış koşulları ve KVKK onayı zorunludur.', ['status' => 400]);
    }

    $user_id = wc_create_new_customer($email, '', $password, [
        'first_name' => $first_name,
        'last_name' => $last_name,
    ]);

    if (is_wp_error($user_id)) {
        return $user_id;
    }

    if ($phone) {
        update_user_meta($user_id, 'billing_phone', $phone);
    }

    update_user_meta($user_id, 'billing_email', $email);
    wp_set_current_user($user_id);
    wp_set_auth_cookie($user_id, true, is_ssl());
    wp_lzer_set_customer_cookie($user_id, true);

    return rest_ensure_response(wp_lzer_customer_payload($user_id));
}

function wp_lzer_auth_logout() {
    wp_logout();
    wp_lzer_clear_customer_cookie();

    return rest_ensure_response(['ok' => true]);
}

function wp_lzer_customer_me() {
    $user_id = wp_lzer_get_customer_user_id();
    return rest_ensure_response(wp_lzer_customer_payload($user_id));
}

function wp_lzer_customer_orders() {
    if (!function_exists('wc_get_orders')) {
        return new WP_Error('woocommerce_missing', 'WooCommerce aktif değil.', ['status' => 503]);
    }

    $user_id = wp_lzer_get_customer_user_id();
    $orders = wc_get_orders([
        'customer_id' => $user_id,
        'limit' => 20,
        'orderby' => 'date',
        'order' => 'DESC',
    ]);

    $payload = array_map(function ($order) {
        return [
            'id' => $order->get_id(),
            'number' => $order->get_order_number(),
            'status' => wc_get_order_status_name($order->get_status()),
            'date' => $order->get_date_created() ? $order->get_date_created()->date_i18n('Y-m-d H:i') : '',
            'total' => $order->get_formatted_order_total(),
            'currency' => $order->get_currency(),
            'items' => array_map(function ($item) {
                return [
                    'name' => $item->get_name(),
                    'quantity' => $item->get_quantity(),
                    'total' => wc_price($item->get_total()),
                ];
            }, array_values($order->get_items())),
        ];
    }, $orders);

    return rest_ensure_response(['orders' => $payload]);
}

function wp_lzer_customer_addresses(WP_REST_Request $request) {
    $user_id = wp_lzer_get_customer_user_id();

    if ($request->get_method() === 'PUT') {
        $payload = $request->get_json_params();
        $allowed_fields = ['first_name', 'last_name', 'company', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country', 'email', 'phone'];

        foreach (['billing', 'shipping'] as $type) {
            if (!isset($payload[$type]) || !is_array($payload[$type])) {
                continue;
            }

            foreach ($allowed_fields as $field) {
                if (array_key_exists($field, $payload[$type])) {
                    update_user_meta($user_id, $type . '_' . $field, sanitize_text_field($payload[$type][$field]));
                }
            }
        }
    }

    return rest_ensure_response(['addresses' => wp_lzer_get_customer_address_payload($user_id)]);
}

function wp_lzer_order_tracking(WP_REST_Request $request) {
    if (!function_exists('wc_get_orders')) {
        return new WP_Error('woocommerce_missing', 'WooCommerce aktif değil.', ['status' => 503]);
    }

    $email = sanitize_email($request->get_param('email'));
    $order_number = sanitize_text_field($request->get_param('order_number') ?: $request->get_param('order_id'));
    $order_number = ltrim($order_number, "# \t\n\r\0\x0B");

    if (!$email || !is_email($email) || !$order_number) {
        return new WP_Error('invalid_tracking_request', 'Geçerli e-posta ve sipariş numarası girin.', ['status' => 400]);
    }

    $orders = wc_get_orders([
        'billing_email' => $email,
        'limit' => 50,
        'orderby' => 'date',
        'order' => 'DESC',
    ]);

    $matched_order = null;
    foreach ($orders as $order) {
        if ((string) $order->get_order_number() === (string) $order_number || (string) $order->get_id() === (string) $order_number) {
            $matched_order = $order;
            break;
        }
    }

    if (!$matched_order) {
        return new WP_Error('order_not_found', 'Sipariş kayıtlarına ulaşılamıyor. Lütfen e-posta ve sipariş numarasını kontrol edin.', ['status' => 404]);
    }

    $items = array_map(function ($item) {
        return [
            'name' => $item->get_name(),
            'quantity' => $item->get_quantity(),
        ];
    }, array_values($matched_order->get_items()));

    return rest_ensure_response([
        'order' => [
            'number' => $matched_order->get_order_number(),
            'status' => wc_get_order_status_name($matched_order->get_status()),
            'date' => $matched_order->get_date_created() ? $matched_order->get_date_created()->date_i18n('Y-m-d H:i') : '',
            'total' => wp_strip_all_tags($matched_order->get_formatted_order_total()),
            'item_count' => count($items),
            'items' => $items,
        ],
    ]);
}

function wp_lzer_newsletter_subscribe(WP_REST_Request $request) {
    $email = sanitize_email($request->get_param('email'));
    $source = sanitize_text_field($request->get_param('source') ?: 'footer');

    if (!$email || !is_email($email)) {
        return new WP_Error('invalid_email', 'Geçerli bir e-posta adresi girin.', ['status' => 400]);
    }

    $subscribers = get_option('wp_lzer_newsletter_subscribers', []);
    if (!is_array($subscribers)) {
        $subscribers = [];
    }

    $now = current_time('mysql');
    $existing = $subscribers[$email] ?? [];

    $subscribers[$email] = [
        'email' => $email,
        'source' => $source,
        'first_subscribed_at' => $existing['first_subscribed_at'] ?? $now,
        'last_subscribed_at' => $now,
        'status' => 'active',
        'ip_hash' => hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . wp_salt('nonce')),
        'user_agent' => sanitize_text_field(substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255)),
    ];

    update_option('wp_lzer_newsletter_subscribers', $subscribers, false);

    return rest_ensure_response([
        'ok' => true,
        'message' => 'Bülten kaydınız alındı.',
    ]);
}

/**
 * Return approved product reviews + aggregate (rating average & count).
 */
function wp_lzer_get_reviews(WP_REST_Request $request) {
    $product_id = absint($request->get_param('product_id'));
    if (!$product_id) {
        return new WP_Error('invalid_product', 'Ürün bilgisi eksik.', ['status' => 400]);
    }

    $comments = get_comments([
        'post_id' => $product_id,
        'status'  => 'approve',
        'type'    => 'review',
        'number'  => 50,
        'orderby' => 'comment_date_gmt',
        'order'   => 'DESC',
    ]);

    $items = [];
    $sum = 0;
    $count = 0;
    foreach ($comments as $comment) {
        $rating = (int) get_comment_meta($comment->comment_ID, 'rating', true);
        if ($rating > 0) {
            $sum += $rating;
            $count++;
        }
        $items[] = [
            'id'      => (int) $comment->comment_ID,
            'author'  => sanitize_text_field($comment->comment_author),
            'rating'  => $rating,
            'content' => wp_strip_all_tags($comment->comment_content),
            'date'    => mysql2date('Y-m-d', $comment->comment_date),
        ];
    }

    return rest_ensure_response([
        'ok'      => true,
        'count'   => $count,
        'average' => $count ? round($sum / $count, 1) : 0,
        'reviews' => $items,
    ]);
}

/**
 * Submit a product review. Created as PENDING (moderation) — appears only after admin approval.
 */
function wp_lzer_submit_review(WP_REST_Request $request) {
    if (!class_exists('WooCommerce')) {
        return new WP_Error('woocommerce_missing', 'Sistem şu an müsait değil.', ['status' => 503]);
    }

    $product_id = absint($request->get_param('product_id'));
    $author     = sanitize_text_field($request->get_param('author'));
    $email      = sanitize_email($request->get_param('email'));
    $rating     = absint($request->get_param('rating'));
    $content    = sanitize_textarea_field($request->get_param('content'));

    if (!$product_id || get_post_type($product_id) !== 'product') {
        return new WP_Error('invalid_product', 'Ürün bulunamadı.', ['status' => 400]);
    }
    if (!$author || !$email || !is_email($email)) {
        return new WP_Error('invalid_author', 'Ad ve geçerli bir e-posta zorunludur.', ['status' => 400]);
    }
    if ($rating < 1 || $rating > 5) {
        return new WP_Error('invalid_rating', 'Puan 1 ile 5 arasında olmalıdır.', ['status' => 400]);
    }
    if (mb_strlen(trim($content)) < 3) {
        return new WP_Error('invalid_content', 'Lütfen yorumunuzu yazın.', ['status' => 400]);
    }

    $comment_id = wp_insert_comment([
        'comment_post_ID'      => $product_id,
        'comment_author'       => $author,
        'comment_author_email' => $email,
        'comment_content'      => $content,
        'comment_type'         => 'review',
        'comment_approved'     => 0,
        'comment_author_IP'    => sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? ''),
        'comment_agent'        => sanitize_text_field(substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255)),
    ]);

    if (!$comment_id) {
        return new WP_Error('review_failed', 'Yorum kaydedilemedi. Lütfen tekrar deneyin.', ['status' => 500]);
    }

    add_comment_meta($comment_id, 'rating', $rating);

    return rest_ensure_response([
        'ok'      => true,
        'message' => 'Yorumunuz alındı, onaylandıktan sonra yayınlanacaktır. Teşekkürler!',
    ]);
}

function wp_lzer_prepare_checkout(WP_REST_Request $request) {
    if (!class_exists('WooCommerce') || !function_exists('WC')) {
        return new WP_Error('woocommerce_missing', 'WooCommerce aktif değil.', ['status' => 503]);
    }

    $customer_user_id = wp_lzer_get_customer_user_id();

    if (null === WC()->session) {
        WC()->initialize_session();
    }

    if (null === WC()->cart) {
        wc_load_cart();
    }

    $items = $request->get_param('items');
    if (!is_array($items) || empty($items)) {
        return new WP_Error('empty_cart', 'Sepete aktarılacak ürün bulunamadı.', ['status' => 400]);
    }

    WC()->cart->empty_cart();

    if ($customer_user_id && WC()->customer) {
        WC()->customer->set_id($customer_user_id);
        WC()->customer->set_props([
            'billing_email' => get_user_meta($customer_user_id, 'billing_email', true),
            'billing_first_name' => get_user_meta($customer_user_id, 'billing_first_name', true),
            'billing_last_name' => get_user_meta($customer_user_id, 'billing_last_name', true),
        ]);
    }

    foreach ($items as $item) {
        $product_id = absint($item['product_id'] ?? 0);
        $quantity = max(1, absint($item['quantity'] ?? 1));

        if (!$product_id) {
            return new WP_Error('invalid_product', 'Her ürün geçerli bir product_id içermelidir.', ['status' => 400]);
        }

        $product = wc_get_product($product_id);
        if (!$product || !$product->is_purchasable()) {
            return new WP_Error('invalid_product', 'Ürün satın alınabilir değil: ' . $product_id, ['status' => 400]);
        }

        if (!$product->is_in_stock()) {
            return new WP_Error('out_of_stock', 'Ürün stokta yok: ' . $product_id, ['status' => 409]);
        }

        WC()->cart->add_to_cart($product_id, $quantity);
    }

    $note = sanitize_textarea_field($request->get_param('note') ?? '');
    WC()->session->set('wp_lzer_order_note', $note);

    WC()->cart->calculate_totals();
    WC()->session->set_customer_session_cookie(true);

    $checkout_url = get_option('wp_lzer_public_checkout_url') ?: wc_get_checkout_url();

    return rest_ensure_response([
        'checkout_url' => $checkout_url,
        'cart_url' => wc_get_cart_url(),
        'item_count' => WC()->cart->get_cart_contents_count(),
    ]);
}

/**
 * Creates a real WooCommerce order directly from the branded Next.js checkout (no WC
 * session/cart, no redirect to any WordPress-themed page) and returns the QNB 3D Secure
 * form data for the frontend to auto-submit — the ONLY off-brand hop in the whole flow
 * is the bank's own OTP page, which 3D Secure itself requires.
 */
function wp_lzer_qnb_checkout(WP_REST_Request $request) {
    if (!class_exists('WooCommerce') || !function_exists('WC')) {
        return new WP_Error('woocommerce_missing', 'WooCommerce aktif değil.', ['status' => 503]);
    }
    if (!class_exists('WC_Gateway_QNB_PayFor')) {
        return new WP_Error('gateway_missing', 'Ödeme sağlayıcısı yüklenemedi.', ['status' => 503]);
    }

    // Staged live rollout: while the gateway is admin-only-gated, this REST endpoint must
    // enforce the SAME restriction — it bypasses WC_Gateway_QNB_PayFor::is_available()
    // entirely (that gate only affects the classic WC checkout page, which this endpoint
    // does not go through). Identity comes from the site's own headless auth cookie
    // (wp_lzer_get_customer_user_id) rather than WP core's nonce-gated cookie auth, since
    // a fully static frontend has no page to hand out a fresh REST nonce from.
    $live_and_gated = !(defined('QNB_PAYFOR_TEST_MODE') && QNB_PAYFOR_TEST_MODE)
        && defined('QNB_PAYFOR_ADMIN_ONLY') && QNB_PAYFOR_ADMIN_ONLY;
    if ($live_and_gated) {
        $current_user_id = wp_lzer_get_customer_user_id();
        if (!$current_user_id || !user_can($current_user_id, 'manage_options')) {
            return new WP_Error(
                'qnb_admin_only',
                'Bu ödeme yöntemi şu anda yalnızca doğrulama amacıyla yöneticiye açıktır. Lütfen /login sayfasından yönetici hesabınızla giriş yapın.',
                ['status' => 403]
            );
        }
    }

    $items = $request->get_param('items');
    if (!is_array($items) || empty($items)) {
        return new WP_Error('empty_cart', 'Sepette ürün bulunamadı.', ['status' => 400]);
    }

    $billing = $request->get_param('billing');
    if (!is_array($billing)) {
        return new WP_Error('invalid_billing', 'Fatura bilgileri eksik.', ['status' => 400]);
    }
    $required = ['first_name', 'last_name', 'email', 'phone', 'address_1', 'city', 'postcode'];
    foreach ($required as $field) {
        if (empty($billing[$field])) {
            return new WP_Error('invalid_billing', "Eksik alan: {$field}", ['status' => 400]);
        }
    }
    if (!is_email($billing['email'])) {
        return new WP_Error('invalid_billing', 'Geçerli bir e-posta adresi girin.', ['status' => 400]);
    }

    $card = $request->get_param('card');
    if (!is_array($card)) {
        return new WP_Error('invalid_card', 'Kart bilgileri eksik.', ['status' => 400]);
    }
    foreach (['number', 'month', 'year', 'cvv', 'name'] as $field) {
        if (empty($card[$field])) {
            return new WP_Error('invalid_card', 'Kart bilgileri eksiksiz olmalıdır.', ['status' => 400]);
        }
    }

    // Validate + collect purchasable line items before creating any order.
    $line_items = [];
    foreach ($items as $item) {
        $product_id = absint($item['product_id'] ?? 0);
        $quantity = max(1, absint($item['quantity'] ?? 1));
        if (!$product_id) {
            return new WP_Error('invalid_product', 'Her ürün geçerli bir product_id içermelidir.', ['status' => 400]);
        }
        $product = wc_get_product($product_id);
        if (!$product || !$product->is_purchasable()) {
            return new WP_Error('invalid_product', 'Ürün satın alınabilir değil: ' . $product_id, ['status' => 400]);
        }
        if (!$product->is_in_stock()) {
            return new WP_Error('out_of_stock', 'Ürün stokta yok: ' . $product_id, ['status' => 409]);
        }
        $line_items[] = ['product' => $product, 'quantity' => $quantity];
    }

    try {
        $order = wc_create_order();

        $customer_user_id = wp_lzer_get_customer_user_id();
        if ($customer_user_id) {
            $order->set_customer_id($customer_user_id);
        }

        foreach ($line_items as $line) {
            $order->add_product($line['product'], $line['quantity']);
        }

        $billing_address = [
            'first_name' => sanitize_text_field($billing['first_name']),
            'last_name'  => sanitize_text_field($billing['last_name']),
            'email'      => sanitize_email($billing['email']),
            'phone'      => sanitize_text_field($billing['phone']),
            'address_1'  => sanitize_text_field($billing['address_1']),
            'address_2'  => sanitize_text_field($billing['address_2'] ?? ''),
            'city'       => sanitize_text_field($billing['city']),
            'postcode'   => sanitize_text_field($billing['postcode']),
            'country'    => 'TR',
        ];
        $order->set_address($billing_address, 'billing');
        $order->set_address($billing_address, 'shipping');

        $note = sanitize_textarea_field($request->get_param('note') ?? '');
        if ($note) {
            $order->set_customer_note($note);
        }

        $order->set_payment_method('qnb_payfor');
        $order->set_payment_method_title('Kredi / Banka Kartı');
        $order->set_created_via('lazer-online-headless');
        $order->calculate_totals();
        $order->save();

        $gateways = WC()->payment_gateways()->payment_gateways();
        if (empty($gateways['qnb_payfor']) || !$gateways['qnb_payfor']->credentials_configured()) {
            $order->delete(true);
            return new WP_Error('gateway_unavailable', 'Ödeme sağlayıcısı şu anda kullanılamıyor.', ['status' => 503]);
        }

        /** @var WC_Gateway_QNB_PayFor $gateway */
        $gateway = $gateways['qnb_payfor'];
        $form_data = $gateway->generate_3d_form_for_order($order->get_id(), [
            'number' => sanitize_text_field($card['number']),
            'month'  => sanitize_text_field($card['month']),
            'year'   => sanitize_text_field($card['year']),
            'cvv'    => sanitize_text_field($card['cvv']),
            'name'   => sanitize_text_field($card['name']),
        ]);

        return rest_ensure_response([
            'ok'       => true,
            'order_id' => $order->get_id(),
            'gateway'  => $form_data['gateway'],
            'method'   => $form_data['method'],
            'inputs'   => $form_data['inputs'],
        ]);
    } catch (\Throwable $e) {
        if (isset($order) && $order->get_id()) {
            $order->update_status('failed', 'Ödeme başlatılamadı: ' . $e->getMessage());
        }
        wc_get_logger()->error('QNB headless checkout error: ' . $e->getMessage(), ['source' => 'qnb-payfor']);
        return new WP_Error('checkout_failed', 'Ödeme başlatılamadı. Lütfen kart bilgilerinizi kontrol edip tekrar deneyin.', ['status' => 400]);
    }
}

/**
 * Bank redirects the customer's browser here after 3D Secure. Always ends in an HTTP
 * redirect back to a branded Next.js page — success or failure, the customer never sees
 * a WordPress-themed page.
 */
function wp_lzer_qnb_return(WP_REST_Request $request) {
    $site_url = rtrim(home_url(), '/');
    $order_id = absint($request->get_param('order_id'));
    $key = sanitize_text_field((string) $request->get_param('key'));

    $gateways = WC()->payment_gateways()->payment_gateways();
    if (empty($gateways['qnb_payfor'])) {
        wp_redirect($site_url . '/checkout/?qnb_error=' . rawurlencode('Ödeme sağlayıcısı yüklenemedi.'));
        exit;
    }

    /** @var WC_Gateway_QNB_PayFor $gateway */
    $gateway = $gateways['qnb_payfor'];
    $result = $gateway->finalize_from_return($order_id, $key);

    if ($result['success']) {
        wp_redirect($site_url . '/siparis-alindi/?order=' . $result['order_id'] . '&key=' . rawurlencode($key));
        exit;
    }

    wp_redirect($site_url . '/checkout/?qnb_error=' . rawurlencode($result['message']));
    exit;
}

/**
 * Public order lookup for the branded order-confirmation page. Guarded by the order's own
 * key (same pattern WooCommerce itself uses for order-received URLs) — knowing the numeric
 * order id alone isn't enough, so random ids can't be used to browse other customers' orders.
 */
function wp_lzer_order_summary(WP_REST_Request $request) {
    $order_id = absint($request->get_param('order_id'));
    $key = sanitize_text_field((string) $request->get_param('key'));
    $order = $order_id ? wc_get_order($order_id) : null;

    if (!$order || !hash_equals($order->get_order_key(), $key)) {
        return new WP_Error('invalid_order', 'Sipariş bulunamadı.', ['status' => 404]);
    }

    $items = [];
    foreach ($order->get_items() as $item) {
        $product = $item->get_product();
        $image_id = $product ? $product->get_image_id() : 0;
        $items[] = [
            'name' => $item->get_name(),
            'sku' => $product ? $product->get_sku() : '',
            'quantity' => $item->get_quantity(),
            'total' => (float) $item->get_total(),
            'image' => $image_id ? wp_get_attachment_image_url($image_id, 'medium') : null,
        ];
    }

    $created = $order->get_date_created();

    return rest_ensure_response([
        'ok' => true,
        'order_id' => $order->get_id(),
        'status' => $order->get_status(),
        'date' => $created ? $created->date_i18n('d.m.Y H:i') : '',
        'items' => $items,
        'subtotal' => (float) $order->get_subtotal(),
        'shipping_total' => (float) $order->get_shipping_total(),
        'total' => (float) $order->get_total(),
        'currency' => $order->get_currency(),
        'customer_name' => trim($order->get_billing_first_name() . ' ' . $order->get_billing_last_name()),
        'customer_email' => $order->get_billing_email(),
        'shipping_address' => trim(implode(', ', array_filter([
            $order->get_shipping_address_1() ?: $order->get_billing_address_1(),
            $order->get_shipping_city() ?: $order->get_billing_city(),
        ]))),
    ]);
}

/**
 * Content import command
 *
 * <file>
 * : Path to markdown file or directory
 *
 * [--type=<type>]
 * : Type of content (page, policy, settings)
 *
 * [--dry-run]
 * : Preview without making changes
 */
class Content_Import_Command {
    private $parser;

    public function __construct() {
        require_once plugin_dir_path(__FILE__) . 'includes/class-markdown-parser.php';
        $this->parser = new Markdown_Parser();
    }

    public function import($args, $assoc_args) {
        $path = $args[0] ?? '';

        if (empty($path)) {
            WP_CLI::error('Please provide a file or directory path.');
            return;
        }

        $type = $assoc_args['type'] ?? 'page';
        $dry_run = isset($assoc_args['dry-run']);

        if (is_dir($path)) {
            $this->import_directory($path, $type, $dry_run);
        } else {
            $this->import_file($path, $type, $dry_run);
        }
    }

    private function import_file($file, $type, $dry_run) {
        if (!file_exists($file)) {
            WP_CLI::error("File not found: {$file}");
            return;
        }

        $content = file_get_contents($file);
        $parsed = $this->parser->parse($content);
        $slug = $parsed['frontmatter']['slug'] ?? basename($file, '.md');

        if ($dry_run) {
            WP_CLI::line("[DRY RUN] Would create/update: {$slug} (type: {$type})");
            WP_CLI::line("Title: " . ($parsed['frontmatter']['title'] ?? 'N/A'));
            return;
        }

        $this->create_or_update_content($slug, $parsed, $type);
        WP_CLI::success("Imported: {$slug}");
    }

    private function import_directory($dir, $type, $dry_run) {
        $files = glob($dir . '/*.md');

        if (empty($files)) {
            WP_CLI::warning("No markdown files found in: {$dir}");
            return;
        }

        $count = 0;
        foreach ($files as $file) {
            $this->import_file($file, $type, $dry_run);
            $count++;
        }

        WP_CLI::success("Imported {$count} files from {$dir}");
    }

    private function create_or_update_content($slug, $parsed, $type) {
        $post_type = $type === 'policy' ? 'page' : 'page';

        $existing = get_page_by_path($slug, OBJECT, $post_type);

        $post_data = [
            'post_title' => $parsed['frontmatter']['title'] ?? $slug,
            'post_content' => $parsed['content'],
            'post_status' => $parsed['frontmatter']['status'] ?? 'publish',
            'post_type' => $post_type,
            'post_name' => $slug,
        ];

        if ($existing) {
            $post_data['ID'] = $existing->ID;
            wp_update_post($post_data);
        } else {
            wp_insert_post($post_data);
        }

        // Handle SEO frontmatter
        if (isset($parsed['frontmatter']['seo'])) {
            update_post_meta($existing ? $existing->ID : 0, '_seo_title', $parsed['frontmatter']['seo']['title'] ?? '');
            update_post_meta($existing ? $existing->ID : 0, '_seo_description', $parsed['frontmatter']['seo']['description'] ?? '');
        }
    }
}

class Policy_Command {
    public function set($args, $assoc_args) {
        $slug = $args[0] ?? '';
        $file = $assoc_args['file'] ?? '';

        if (empty($slug) || empty($file)) {
            WP_CLI::error('Usage: wp policy set <slug> --file=<path>');
            return;
        }

        if (!file_exists($file)) {
            WP_CLI::error("File not found: {$file}");
            return;
        }

        $content = file_get_contents($file);
        $existing = get_page_by_path('policy/' . $slug, OBJECT, 'page');

        $post_data = [
            'post_title' => ucfirst($slug) . ' Policy',
            'post_content' => $content,
            'post_status' => 'publish',
            'post_type' => 'page',
            'post_name' => 'policy/' . $slug,
        ];

        if ($existing) {
            $post_data['ID'] = $existing->ID;
            wp_update_post($post_data);
        } else {
            wp_insert_post($post_data);
        }

        WP_CLI::success("Policy updated: {$slug}");
    }
}

class Settings_Sync_Command {
    public function sync($args, $assoc_args) {
        $file = $args[0] ?? '';

        if (empty($file)) {
            WP_CLI::error('Usage: wp settings sync <file.json>');
            return;
        }

        if (!file_exists($file)) {
            WP_CLI::error("File not found: {$file}");
            return;
        }

        $settings = json_decode(file_get_contents($file), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            WP_CLI::error('Invalid JSON: ' . json_last_error_msg());
            return;
        }

        foreach ($settings as $key => $value) {
            update_option('headless_' . $key, $value);
        }

        WP_CLI::success('Settings synced from: ' . $file);
    }

    public function export($args, $assoc_args) {
        $keys = $assoc_args['keys'] ?? '';

        if (empty($keys)) {
            WP_CLI::error('Usage: wp settings export --keys=key1,key2');
            return;
        }

        $key_list = explode(',', $keys);
        $settings = [];

        foreach ($key_list as $key) {
            $value = get_option('headless_' . trim($key));
            if ($value !== false) {
                $settings[trim($key)] = $value;
            }
        }

        echo json_encode($settings, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    }
}

class Lzer_Product_Import_Command {
    public function import($args, $assoc_args) {
        if (!function_exists('wc_get_product')) {
            WP_CLI::error('WooCommerce aktif değil.');
            return;
        }

        $file = $args[0] ?? '';
        if (!$file || !file_exists($file)) {
            WP_CLI::error('Ürün JSON dosyası bulunamadı.');
            return;
        }

        $payload = json_decode(file_get_contents($file), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            WP_CLI::error('Geçersiz JSON: ' . json_last_error_msg());
            return;
        }

        $products = $payload['products'] ?? [];
        if (!is_array($products) || empty($products)) {
            WP_CLI::error('Import edilecek ürün bulunamadı.');
            return;
        }

        $dry_run = isset($assoc_args['dry-run']);
        $with_images = !isset($assoc_args['skip-images']);
        $report_path = $assoc_args['report'] ?? '';
        $report = [
            'created' => 0,
            'updated' => 0,
            'failed' => [],
            'products' => [],
        ];

        foreach ($products as $index => $product_data) {
            try {
                $result = $this->import_product($product_data, $dry_run, $with_images);
                if ($result['action'] === 'created') {
                    $report['created']++;
                } elseif ($result['action'] === 'updated') {
                    $report['updated']++;
                }
                $report['products'][] = $result;
                WP_CLI::line(sprintf('[%s] %s #%s %s', strtoupper($result['action']), $result['sku'], $result['id'] ?: '-', $result['name']));
            } catch (Exception $error) {
                $sku = $product_data['sku'] ?? 'row-' . ($index + 1);
                $report['failed'][] = [
                    'sku' => $sku,
                    'error' => $error->getMessage(),
                ];
                WP_CLI::warning($sku . ': ' . $error->getMessage());
            }
        }

        if ($report_path) {
            file_put_contents($report_path, wp_json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
            WP_CLI::line('Report: ' . $report_path);
        }

        WP_CLI::success(sprintf('Ürün import tamamlandı. Created: %d, Updated: %d, Failed: %d', $report['created'], $report['updated'], count($report['failed'])));

        if (!empty($report['failed'])) {
            WP_CLI::halt(1);
        }
    }

    private function import_product($data, $dry_run, $with_images) {
        $sku = sanitize_text_field($data['sku'] ?? '');
        $name = sanitize_text_field($data['name'] ?? '');

        if (!$sku || !$name) {
            throw new Exception('SKU ve ürün adı zorunludur.');
        }

        $existing_id = wc_get_product_id_by_sku($sku);
        $action = $existing_id ? 'updated' : 'created';

        if ($dry_run) {
            return [
                'sourceProductId' => $data['sourceProductId'] ?? '',
                'sku' => $sku,
                'id' => $existing_id,
                'name' => $name,
                'slug' => sanitize_title($data['slug'] ?? $name),
                'action' => $existing_id ? 'would-update' : 'would-create',
            ];
        }

        $product = $existing_id ? wc_get_product($existing_id) : new WC_Product_Simple();
        if (!$product) {
            throw new Exception('Ürün nesnesi oluşturulamadı.');
        }

        $product->set_name($name);
        $product->set_slug(sanitize_title($data['slug'] ?? $name));
        $product->set_status($this->normalize_status($data['status'] ?? 'publish'));
        $product->set_catalog_visibility('visible');
        $product->set_sku($sku);
        $product->set_regular_price($this->normalize_price($data['regularPrice'] ?? $data['price'] ?? '0'));

        if (!empty($data['salePrice'])) {
            $product->set_sale_price($this->normalize_price($data['salePrice']));
        } else {
            $product->set_sale_price('');
        }

        $product->set_description(wp_kses_post($data['description'] ?? ''));
        $product->set_short_description(wp_kses_post($data['shortDescription'] ?? ''));

        if (array_key_exists('stockQuantity', $data) && $data['stockQuantity'] !== '' && $data['stockQuantity'] !== null) {
            $product->set_manage_stock(true);
            $product->set_stock_quantity((int) $data['stockQuantity']);
        } else {
            $product->set_manage_stock(false);
        }

        $product->set_stock_status($this->normalize_stock_status($data['stockStatus'] ?? 'instock'));
        $product->set_category_ids($this->ensure_terms($data['categories']['nodes'] ?? [], 'product_cat'));
        $product->set_tag_ids($this->ensure_tag_terms($data['keywords'] ?? []));
        $product->set_attributes($this->build_attributes($data['attributes']['nodes'] ?? []));

        if ($with_images) {
            $image_id = $this->sideload_image($data['image']['sourceUrl'] ?? '', $data['image']['altText'] ?? $name);
            if ($image_id) {
                $product->set_image_id($image_id);
            }

            $gallery_ids = [];
            foreach (($data['galleryImages']['nodes'] ?? []) as $image) {
                $gallery_id = $this->sideload_image($image['sourceUrl'] ?? '', $image['altText'] ?? $name);
                if ($gallery_id) {
                    $gallery_ids[] = $gallery_id;
                }
            }
            $product->set_gallery_image_ids($gallery_ids);
        }

        $product_id = $product->save();
        update_post_meta($product_id, '_legacy_source_product_id', sanitize_text_field($data['sourceProductId'] ?? ''));
        update_post_meta($product_id, '_legacy_currency', sanitize_text_field($data['currencyCode'] ?? 'TRY'));
        update_post_meta($product_id, '_htc_manufacturer', sanitize_text_field($data['manufacturer'] ?? ''));

        return [
            'sourceProductId' => $data['sourceProductId'] ?? '',
            'sku' => $sku,
            'id' => $product_id,
            'name' => $name,
            'slug' => get_post_field('post_name', $product_id),
            'imageUrl' => $product->get_image_id() ? wp_get_attachment_url($product->get_image_id()) : '',
            'galleryImageUrls' => array_values(array_filter(array_map('wp_get_attachment_url', $product->get_gallery_image_ids()))),
            'action' => $action,
        ];
    }

    private function normalize_price($value) {
        $normalized = preg_replace('/[^0-9,.-]/', '', (string) $value);
        $normalized = str_replace(',', '.', $normalized);
        $price = (float) $normalized;
        return number_format(max(0, $price), 2, '.', '');
    }

    private function normalize_status($value) {
        return in_array($value, ['publish', 'draft', 'private'], true) ? $value : 'publish';
    }

    private function normalize_stock_status($value) {
        $normalized = strtolower((string) $value);
        if (in_array($normalized, ['outofstock', 'out_of_stock', 'out-of-stock'], true)) {
            return 'outofstock';
        }
        if ($normalized === 'onbackorder') {
            return 'onbackorder';
        }
        return 'instock';
    }

    private function ensure_terms($terms, $taxonomy) {
        $ids = [];
        foreach ($terms as $term) {
            $name = sanitize_text_field($term['name'] ?? '');
            $slug = sanitize_title($term['slug'] ?? $name);
            if (!$name) {
                continue;
            }

            $existing = term_exists($slug, $taxonomy);
            if (!$existing) {
                $existing = wp_insert_term($name, $taxonomy, [
                    'slug' => $slug,
                    'description' => sanitize_text_field($term['description'] ?? ''),
                ]);
            }

            if (!is_wp_error($existing)) {
                $ids[] = (int) ($existing['term_id'] ?? $existing);
            }
        }
        return array_values(array_unique($ids));
    }

    private function ensure_tag_terms($keywords) {
        $terms = array_map(function ($keyword) {
            return ['name' => $keyword, 'slug' => sanitize_title($keyword)];
        }, is_array($keywords) ? $keywords : []);

        return $this->ensure_terms($terms, 'product_tag');
    }

    private function build_attributes($attributes) {
        $result = [];
        $position = 0;

        foreach ($attributes as $attribute_data) {
            $label = sanitize_text_field($attribute_data['label'] ?? $attribute_data['name'] ?? '');
            $value = sanitize_text_field($attribute_data['value'] ?? '');
            if (!$label || !$value) {
                continue;
            }

            $attribute = new WC_Product_Attribute();
            $attribute->set_id(0);
            $attribute->set_name($label);
            $attribute->set_options([$value]);
            $attribute->set_position($position++);
            $attribute->set_visible(true);
            $attribute->set_variation(false);
            $result[] = $attribute;
        }

        return $result;
    }

    private function sideload_image($url, $alt) {
        $url = esc_url_raw($url);
        if (!$url) {
            return 0;
        }

        $existing = get_posts([
            'post_type' => 'attachment',
            'post_status' => 'inherit',
            'fields' => 'ids',
            'posts_per_page' => 1,
            'meta_key' => '_wp_lzer_source_url',
            'meta_value' => $url,
        ]);

        if (!empty($existing)) {
            return (int) $existing[0];
        }

        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';

        $attachment_id = media_sideload_image($url, 0, sanitize_text_field($alt), 'id');
        if (is_wp_error($attachment_id)) {
            WP_CLI::warning('Görsel alınamadı: ' . $url . ' - ' . $attachment_id->get_error_message());
            return 0;
        }

        update_post_meta($attachment_id, '_wp_lzer_source_url', $url);
        update_post_meta($attachment_id, '_wp_attachment_image_alt', sanitize_text_field($alt));

        return (int) $attachment_id;
    }
}

class Validate_Content_Command {
    public function __invoke($args, $assoc_args) {
        $dir = $args[0] ?? 'content/';
        $schema_dir = $dir . 'schemas/';

        if (!is_dir($schema_dir)) {
            WP_CLI::warning("No schemas directory found: {$schema_dir}");
            return;
        }

        $files = glob($dir . '/*.md');
        $errors = [];
        $valid = 0;

        foreach ($files as $file) {
            $content = file_get_contents($file);
            $frontmatter = $this->extract_frontmatter($content);

            $schema_file = $schema_dir . basename($file, '.md') . '.json';
            if (file_exists($schema_file)) {
                $schema = json_decode(file_get_contents($schema_file), true);
                if ($this->validate_frontmatter($frontmatter, $schema)) {
                    $valid++;
                } else {
                    $errors[] = basename($file);
                }
            }
        }

        if (empty($errors)) {
            WP_CLI::success("All {$valid} files validated successfully.");
        } else {
            WP_CLI::error('Validation failed for: ' . implode(', ', $errors));
        }
    }

    private function extract_frontmatter($content) {
        if (preg_match('/^---\s*\n(.*?)\n---\s*\n/s', $content, $matches)) {
            $fields = [];
            foreach (explode("\n", $matches[1]) as $line) {
                if (strpos($line, ':') !== false) {
                    list($key, $value) = explode(':', $line, 2);
                    $fields[trim($key)] = trim($value);
                }
            }
            return $fields;
        }
        return [];
    }

    private function validate_frontmatter($data, $schema) {
        foreach ($schema['required'] ?? [] as $field) {
            if (!isset($data[$field])) {
                return false;
            }
        }
        return true;
    }
}

// Register commands
if (defined('WP_CLI') && WP_CLI) {
    WP_CLI::add_command('content', 'Content_Import_Command');
    WP_CLI::add_command('policy', 'Policy_Command');
    WP_CLI::add_command('settings', 'Settings_Sync_Command');
    WP_CLI::add_command('lzer-products', 'Lzer_Product_Import_Command');
    WP_CLI::add_command('validate', 'Validate_Content_Command');
}
