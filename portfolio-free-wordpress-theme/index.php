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
    <!-- Home page -->
    <article id="page__home" class="page page__home">
        <!-- Banner page Home -->
        <div class="banner banner__page-home" style="background-image:url(<?php echo get_theme_mod('banner_settings'); ?>)">
            <div class="banner__page-home__bio center-left" style="background-image:url(<?php 
                    if (get_theme_mod( 'bgabout_settings' )) : 
                        echo get_theme_mod( 'bgabout_settings'); 
                    else: 
                        echo 'https://placeholdit.imgix.net/~text?txtsize=23&txt=220%C3%97300&w=220&h=300'; 
                    endif; ?>);">
                <p class="b b1">
                    <b>Hellow!</b> 
                </p>
                <p class="b b2">
                    <i><?php echo get_theme_mod('name_settings'); ?></i>
                </p>
                <span class="hr-dotted b b3"></span>
                <p class="b b4"><?php echo get_theme_mod('description_settings'); ?></p>
                <ul class="b b5">
                    <li><a href="mailto:<?php echo get_theme_mod('email_settings'); ?>", target="_blank"><?php echo get_theme_mod('email_settings'); ?></a></li>
                    <li><a href="<?php echo get_theme_mod('github_settings'); ?>", target="_blank">/github</a></li>
                </ul>
            </div>
            <h1 class="font-title"><?php echo get_bloginfo( 'name' ); ?></h1>
            <h2 class="font-subtitle"><?php echo get_bloginfo( 'description' ); ?></h2>
        </div>
        <!-- /Banner page Home -->
        
        <main role="main" class="page__home__cols clearfix">
            <div class="cols__4"></div>
            <div class="cols__4"></div>
            <div class="cols__4"></div>
            <div class="cols__4"></div>
        </main>
    </article>
    <!-- /Home page -->
<?php 
// get_sidebar();
get_footer();?>