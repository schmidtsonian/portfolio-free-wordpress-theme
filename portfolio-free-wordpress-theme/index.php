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
        <div class="banner banner__page-home" style="background-image:url(/images/bg-banner-home.png)">
            <div class="banner__page-home__bio center-left" style="background-image:url(/images/bg-bio-banner-home.jpg);">
                <p class="b b1">
                    <b>Hellow!</b> 
                </p>
                <p class="b b2">
                    <i>Who am I</i>
                </p>
                <span class="hr-dotted b b3"></span>
                <p class="b b4">
                    Duis ea proident fugiat ad irure labore pariatur ut eiusmod Lorem cupidatat sit amet.
                </p>
                <ul class="b b5">
                    <li><a href="#", target="_blank">email@domain.com</a></li>
                    <li><a href="#", target="_blank">@twitter</a></li>
                </ul>
            </div>
            <h1 class="font-title">Title page</h1>
            <h2 class="font-subtitle">Subtitle page</h2>
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