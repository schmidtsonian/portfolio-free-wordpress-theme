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

get_header(); the_post(); ?>
    <!-- single page -->
    <div id="page__single" class="page page__single">
        
        <article class="page__section cols clearfix">
            
            <div class="cols__2 page__single__col">
                <header>
                    <?php if( has_post_thumbnail()){ ?>

                        <img src="<?php echo wp_get_attachment_url( get_post_thumbnail_id($post->ID)); ?>" alt="<?php the_title(); ?>" class="page__single__image">
                    <?php } ?>
                    <h1 class="font-title__page"><?php the_title(); ?></h1>
                </header>
                <?php the_content(); ?>
                
            </div>
            <div class="cols__2 page__single__col">
                <?php get_sidebar("standar")?>
            </div>
        </article>
    </div>
    <!-- /single page -->
<?php 
get_footer();?>