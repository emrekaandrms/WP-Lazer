<?php
/**
 * Blank page template for headless mode
 * WordPress pages are fetched via GraphQL, this is a fallback
 *
 * @package Headless_Woo
 */

get_header();
?>

<main id="headless-main">
    <?php
    while (have_posts()) :
        the_post();
        the_content();
    endwhile;
    ?>
</main>

<?php get_footer(); ?>
