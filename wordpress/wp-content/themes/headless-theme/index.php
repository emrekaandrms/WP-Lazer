<?php
/**
 * Front page template - redirects to frontend or serves minimal HTML
 *
 * @package Headless_Woo
 */

get_header();
?>

<main id="headless-main">
    <div class="headless-redirect-message">
        <h1>Headless Mode Active</h1>
        <p>This WordPress installation is running in headless mode.</p>
        <p>The frontend is available at: <a href="<?php echo esc_url(getenv('HEADLESS_FRONTEND_URL') ?: 'http://localhost:3000'); ?>">Frontend</a></p>
    </div>
</main>

<?php get_footer(); ?>
