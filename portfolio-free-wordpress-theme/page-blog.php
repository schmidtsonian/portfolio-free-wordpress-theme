<?php /**
* The main template file.
*
* This is the most generic template file in a WordPress theme
* and one of the two required files for a theme (the other being style.css).
* It is used to display a page when nothing more specific matches a query.
* E.g., it puts together the home page when no home.php file exists.
*
* @link https://codex.wordpress.org/Template_Hierarchy
*
* @package estebanco
*/

get_header(); ?>
    <!-- Blog page -->
    <div id="page__about" class="page page__blog">
        <section class="page__section cols clearfix">
            <div class="cols__2 page__blog__col">
                <!--<h1 class="clearfix"><?php the_title(); ?></h1>-->
                
                <?php

                    $paged = ( get_query_var( 'paged' ) ) ? get_query_var( 'paged' ) : 1; 
                    query_posts( 'posts_per_page=6&paged=' . $paged );
                    
                    
                    while ( have_posts() ) : the_post();
                ?>
                <a href="<?php echo str_replace(get_site_url(), '', get_permalink()); ?>" class="page-load block block__2--post", title="<?php the_title(); ?>">
                
                    <?php
                    if( has_post_thumbnail() ){
                        
                        ?><img src="<?php echo wp_get_attachment_url( get_post_thumbnail_id($post->ID) ); ?>", width="", height="", alt="<?php the_title(); ?>"><?php
                    }
                    
                    ?>
                    <h2 class="font-title__thumb"><?php the_title(); ?></h2>
                    <p class="font-description__thumb">
                        <?php echo get_the_excerpt(); ?>
                    </p>
                </a>
                
                <?php
                    endwhile;
                    
                    $next = get_next_posts_link( '<span class="meta-nav">&larr;</span> Older posts' );
                    $previus = get_previous_posts_link( 'Newer posts <span class="meta-nav">&rarr;</span>' );
                    wp_reset_query();
                ?>
                <?php echo str_replace(get_site_url(), '', $next); ?>
                <?php echo str_replace(get_site_url(), '', $previus); ?>
            </div>
            <div class="cols__2 page__blog__col">
                <?php get_sidebar("standar"); ?>
            </div>
        </section>
        </section>
    </div>
    <!-- /Blog page -->
<?php 
// get_sidebar();
get_footer();?>