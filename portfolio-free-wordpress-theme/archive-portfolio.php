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
    <!-- Portfolio archive page -->
    <div id="page__blog-portfolio" class="page page__blog__portfolio">
        
        <section class="page__section">
            <h1 class="clearfix">Portfolio</h1>
            <!-- Nav filters -->
            <nav class="page__nav-filters">
                <ul>
                    <li><a href="#" title="all" class="page-load active">all</a></li>
                    
                    <?php
                    $categories = get_terms( 'cats');
                    foreach ( $categories as $value ) { ?>
                        <li>
                            <a href="#" title="<?php echo $value->name; ?>" class="page-load">
                                <?php echo $value->name; ?>
                            </a>
                        </li>
                    <?php } ?>
                </ul>
            </nav>
            <!-- /Nav filters -->
            
            <div class="row clearfix">
                <?php
                $count = 0;
                $class = '';
                while ( have_posts() ) : the_post();
                    
                    switch ($count) {
                        case 0: $class = '2x2'; break;
                        case 1: $class = '2x1'; break;
                        case 2: $class = '1x1'; break;
                        case 3: $class = '1x1'; break;
                        case 4: $class = '1x1'; break;
                        case 5: $class = '1x1'; break;
                        case 6: $class = '2x1'; break;
                        case 7: $class = '2x2'; break;
                        case 8: $class = '1x1'; break;
                        case 9: $class = '1x1'; break;
                        case 10: $class = '2x1'; break;
                        case 11: $class = '2x1'; break;
                        case 12: $class = '1x1'; break;
                        case 13: $class = '1x1'; break;
                    }
                    $count++;
                    
                    $thumb = 'https://placeholdit.imgix.net/~text?txtsize=23&txt=564%C3%97400&w=564&h=400';
                    if( has_post_thumbnail() ){
                        
                        $thumb = wp_get_attachment_url( get_post_thumbnail_id($post->ID) );
                    }
                    ?>
                    <a title="<?php the_title(); ?>" href="<?php echo str_replace(get_site_url(), '', get_permalink()); ?>" class="page-load block block__<?php echo $class; ?>--post-thumb block__color--withe" style="background-image:url(<?php echo $thumb; ?>);">
                        <strong class="block__caption">
                            <span><?php the_title(); ?></span>
                        </strong>
                    </a>
                    <?php 
                    if( $count >= 14 ){
                        $count = 0;
                    }
                endwhile;
                wp_reset_query();
                ?>
                
            </div>
        </section>
    </div>
    <!-- /Portfolio archive page -->
<?php 
// get_sidebar();
get_footer();?>