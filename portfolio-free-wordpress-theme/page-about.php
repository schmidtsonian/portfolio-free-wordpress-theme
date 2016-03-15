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
    <!-- About page -->
    <article id="page__about" class="page page__about cols clearfix">
        
        <div class="cols__2">
            <header class="page__header">
                <h1 class="font-title__page"><?php the_title(); ?></h1>
            </header>
            <section class="page__section">
                <?php the_content(); ?>
            </section>
        </div>
        <div class="cols__2">
            <div class="block block__1x1 block__color--">
                <h4><i>Skill</i></h4>
                <h2><?php echo get_theme_mod( 'about_skill_1_settings' ); ?></h2>
                <p><?php echo get_theme_mod( 'about_skill_desc_1_settings' ); ?></p>
            </div>
            <div class="block block__1x1" alt="<?php echo get_bloginfo( 'name' ); ?>" style="
                <?php if (get_theme_mod( 'logo_settings' )){
                    echo "background-image:url(" . get_theme_mod( 'avatar_settings') . ");"; 
                }?>" ></div>
            <div class="block block__1x1 block__color--brown">
                <h4><i>Skill</i></h4>
                <h2><?php echo get_theme_mod( 'about_skill_2_settings' ); ?></h2>
                <p><?php echo get_theme_mod( 'about_skill_desc_1_settings' ); ?></p>
            </div>
            <div class="block block__1x1 block__color--">
                <h4><i>Skill</i></h4>
                <h2><?php echo get_theme_mod( 'about_skill_3_settings' ); ?></h2>
                <p><?php echo get_theme_mod( 'about_skill_desc_1_settings' ); ?></p>
            </div>
        </div>
    </article>
    <!-- /About page -->
<?php 
// get_sidebar();
get_footer();?>