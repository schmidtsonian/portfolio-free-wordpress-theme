<?php
/**
 * Template part for displaying page content in page.php.
 *
 * @link https://codex.wordpress.org/Template_Hierarchy
 *
 * @package estebanco
 */

?>

<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<header >
		<?php the_title( '<h1 >', '</h1>' ); ?>
	</header><!-- .entry-header -->

	<div >
		<?php
			the_content();

			wp_link_pages( array(
				'before' => '<div class="page-links">' . esc_html__( 'Pages:', 'estebanco' ),
				'after'  => '</div>',
			) );
		?>
	</div><!-- .entry-content -->

</article><!-- #post-## -->
