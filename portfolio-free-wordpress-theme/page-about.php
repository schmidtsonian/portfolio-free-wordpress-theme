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
    <!-- About page -->
    <article id="page__about" class="page page__about cols clearfix">
        
        <div class="cols__2">
            <header class="page__header">
                <h1 class="font-title__page">Hello</h1>
            </header>
            <section class="page__section">
                <p>Id pariatur magna eu culpa consequat sint incididunt in deserunt aliquip occaecat ullamco. Sit culpa proident est mollit officia minim proident sint veniam labore. Laborum velit sint minim ipsum velit.</p>
                <p>Nulla officia ea non non cillum id tempor mollit consequat magna consectetur et.</p>
            </section>
        </div>
        <div class="cols__2">
            <div class="block block__1x1 block__color--">
                <h4><i>Skill</i></h4>
                <h2>Web developer</h2>
                <p>Id pariatur magna eu culpa consequat sint incididunt</p>
            </div>
            <div class="block block__1x1" style="background-image:url(/images/profile.png);"></div>
            <div class="block block__1x1 block__color--brown">
                <h4><i>Skill</i></h4>
                <h2>Web developer</h2>
                <p>Id pariatur magna eu culpa consequat sint incididunt</p>
            </div>
            <div class="block block__1x1 block__color--">
                <h4><i>Skill</i></h4>
                <h2>Web developer</h2>
                <p>Id pariatur magna eu culpa consequat sint incididunt</p>
            </div>
        </div>
    </article>
    <!-- /About page -->
<?php 
// get_sidebar();
get_footer();?>