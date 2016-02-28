<?php
/**
 * The template for displaying archive pages.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package estebanco
 */

get_header(); ?>

    <main id="main" role="main">

    <?php
    if ( have_posts() ) : ?>

            <?php
                the_archive_title( '<h1 class="page-title">', '</h1>' );
                the_archive_description( '<div class="taxonomy-description">', '</div>' );
            ?>

        <?php
        /* Start the Loop */
        while ( have_posts() ) : the_post();

            get_template_part( 'template-parts/content', get_post_format() );

        endwhile;

        the_posts_navigation();

    else :

        get_template_part( 'template-parts/content', 'none' );

    endif; ?>

    </main><!-- #main -->
<?php
get_footer();
