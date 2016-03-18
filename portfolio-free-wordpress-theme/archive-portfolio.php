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
                    while ( have_posts() ) : the_post();
                        // the_title();
                    endwhile;
                    wp_reset_query();
                    ?>
                <a title="" href="#" class="block block__2x2--post-thumb block__color--withe" style="background-image:url(https://placeholdit.imgix.net/~text?txtsize=23&txt=564%C3%97400&w=564&h=400);">
                    <strong class="block__caption">
                        <span>tit 2x2 asd asd asd asd asd asd asd a ds</span>
                    </strong>
                </a>
                
                <a title="" href="#" class="block block__2x1--post-thumb block__color--white", style="background-image:url(https://placeholdit.imgix.net/~text?txtsize=23&txt=564%C3%97400&w=564&h=400);" >
                    
                    <strong class="block__caption">
                        <span>tit 2x1</span>
                    </strong>
                </a>
                
                <a title="" href="#" class="block block__1x1--post-thumb block__color--white", style="background-image:url(https://placeholdit.imgix.net/~text?txtsize=23&txt=564%C3%97400&w=564&h=400);" >
                    
                    <strong class="block__caption">
                        <span>tit 1x1</span>
                    </strong>
                </a>
                <a title="" href="#" class="block block__1x1--post-thumb block__color--white", style="background-image:url(https://placeholdit.imgix.net/~text?txtsize=23&txt=564%C3%97400&w=564&h=400);" >
                    
                    <strong class="block__caption">
                        <span>tit 1x1</span>
                    </strong>
                </a>
                <a title="" href="#" class="block block__1x1--post-thumb block__color--white", style="background-image:url(https://placeholdit.imgix.net/~text?txtsize=23&txt=564%C3%97400&w=564&h=400);" >
                    
                    <strong class="block__caption">
                        <span>tit 1x1</span>
                    </strong>
                </a>
                <a title="" href="#" class="block block__1x1--post-thumb block__color--white", style="background-image:url(https://placeholdit.imgix.net/~text?txtsize=23&txt=564%C3%97400&w=564&h=400);" >
                    
                    <strong class="block__caption">
                        <span>tit 1x1</span>
                    </strong>
                </a>
                <a title="" href="#" class="block block__2x1--post-thumb block__color--white", style="background-image:url(https://placeholdit.imgix.net/~text?txtsize=23&txt=564%C3%97400&w=564&h=400);" >
                    
                    <strong class="block__caption">
                        <span>tit 2x1</span>
                    </strong>
                </a>
                
                <a title="" href="#" class="block block__2x2--post-thumb block__color--withe" style="background-image:url(https://placeholdit.imgix.net/~text?txtsize=23&txt=564%C3%97400&w=564&h=400);">
                    <strong class="block__caption">
                        <span>tit 2x2 asd asd asd asd asd asd asd a ds</span>
                    </strong>
                </a>
                <a title="" href="#" class="block block__1x1--post-thumb block__color--white", style="background-image:url(https://placeholdit.imgix.net/~text?txtsize=23&txt=564%C3%97400&w=564&h=400);" >
                    
                    <strong class="block__caption">
                        <span>tit 1x1</span>
                    </strong>
                </a>
                <a title="" href="#" class="block block__1x1--post-thumb block__color--white", style="background-image:url(https://placeholdit.imgix.net/~text?txtsize=23&txt=564%C3%97400&w=564&h=400);" >
                    
                    <strong class="block__caption">
                        <span>tit 1x1</span>
                    </strong>
                </a>
                <a title="" href="#" class="block block__2x1--post-thumb block__color--white", style="background-image:url(https://placeholdit.imgix.net/~text?txtsize=23&txt=564%C3%97400&w=564&h=400);" >
                    
                    <strong class="block__caption">
                        <span>tit 2x1</span>
                    </strong>
                </a>
                <a title="" href="#" class="block block__2x1--post-thumb block__color--white", style="background-image:url(https://placeholdit.imgix.net/~text?txtsize=23&txt=564%C3%97400&w=564&h=400);" >
                    
                    <strong class="block__caption">
                        <span>tit 2x1</span>
                    </strong>
                </a>
                <a title="" href="#" class="block block__1x1--post-thumb block__color--white", style="background-image:url(https://placeholdit.imgix.net/~text?txtsize=23&txt=564%C3%97400&w=564&h=400);" >
                    
                    <strong class="block__caption">
                        <span>tit 1x1</span>
                    </strong>
                </a>
                <a title="" href="#" class="block block__1x1--post-thumb block__color--white", style="background-image:url(https://placeholdit.imgix.net/~text?txtsize=23&txt=564%C3%97400&w=564&h=400);" >
                    
                    <strong class="block__caption">
                        <span>tit 1x1</span>
                    </strong>
                </a>
            </div>
        </section>
    </div>
    <!-- /Portfolio archive page -->
<?php 
// get_sidebar();
get_footer();?>