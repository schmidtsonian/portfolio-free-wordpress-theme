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
                
                <a href="#" class="block block__2--post", title="Title post">
                    <img src="http://placehold.it/450x250", width="", height="", alt="Title post">
                    <h2 class="font-title__thumb">
                        Title post
                    </h2>
                    <p class="font-description__thumb">
                        1 Laboris non cillum officia tempor eu do sint.
                    </p>
                </a>
            </div>
            <div class="cols__2 page__blog__col">
                <?php get_sidebar("standar"); ?>
            </div>
        </section>
    </div>
    <!-- /Blog page -->
<?php 
// get_sidebar();
get_footer();?>