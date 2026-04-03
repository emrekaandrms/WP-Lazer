<?php
/**
 * Headless Woo Theme - Functions
 *
 * @package Headless_Woo
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Theme setup
 */
function headless_woo_setup() {
    add_theme_support('title-tag');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption'));
    add_theme_support('custom-logo');
    add_theme_support('align-wide');
    add_theme_support('editor-styles');
    remove_theme_support('core-block-patterns');
}
add_action('after_setup_theme', 'headless_woo_setup');

/**
 * Enqueue scripts and styles
 */
function headless_woo_scripts() {
    wp_enqueue_style('headless-woo-style', get_stylesheet_uri(), array(), '1.0.0');
}
add_action('wp_enqueue_scripts', 'headless_woo_scripts');

/**
 * Disable WordPress theme features that are unnecessary for headless
 */
function headless_woo_disable_frontend_features() {
    // Disable emoji icons
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('wp_print_styles', 'print_emoji_styles');

    // Disable Gutenberg block styles on frontend
    wp_dequeue_style('wp-block-library');
    wp_dequeue_style('wp-block-library-theme');
}
add_action('wp_enqueue_scripts', 'headless_woo_disable_frontend_features', 100);

/**
 * REST API customizations for headless
 */
function headless_woo_rest_prepare_post($response, $post, $request) {
    $response->data['slug'] = $post->post_name;
    return $response;
}
add_filter('rest_prepare_page', 'headless_woo_rest_prepare_post', 10, 3);

/**
 * Add CORS headers for headless frontend
 */
function headless_woo_add_cors_headers() {
    $allowed_origin = getenv('HEADLESS_FRONTEND_URL') ?: 'http://localhost:3000';

    header("Access-Control-Allow-Origin: {$allowed_origin}");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-WPGraphQL-Token");
    header("Access-Control-Allow-Credentials: true");
}
add_action('rest_api_init', 'headless_woo_add_cors_headers');
add_action('init', 'headless_woo_add_cors_headers');

/**
 * Customize WPGraphQL schema
 */
function headless_woo_graphql_register_types() {
    // Register custom GraphQL fields if needed
}
add_action('graphql_register_types', 'headless_woo_graphql_register_types');

/**
 * Flush rewrite rules on theme activation
 */
function headless_woo_rewrite_flush() {
    flush_rewrite_rules();
}
add_action('after_switch_theme', 'headless_woo_rewrite_flush');
