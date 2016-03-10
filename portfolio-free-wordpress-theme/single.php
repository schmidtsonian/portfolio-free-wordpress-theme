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
    <!-- single page -->
    <div id="page__single" class="page page__single">
        
        <article class="page__section cols clearfix">
            
            <div class="cols__2 page__single__col">
                <header>
                    <img src=src="https://placeholdit.imgix.net/~text?txtsize=23&txt=900%C3%97400&w=900&h=400" alt="" class="page__single__image">
                    <h1 class="font-title__page">title</h1>
                </header>
                
                <p><strong>Strong</strong> text</p>
                <p><i>italic</i>  text</p> 
                <p> <small>Small</small> text</p> 
                <p> <mark>Marked</mark> text</p>
                <p> <del>Deleted</del> text</p>
                <p> Simple <a href="#">link</a></p>
                
                <h1> h1 tag</h1>
                <h2> h2 tag</h2>
                <h3> h3 tag</h3>
                
                <ul>
                    <li>bullet</li>
                    <li>simple</li>
                </ul>
                <ol>
                    <li>numeric</li>
                    <li>list</li>
                </ol>
                <pre>
Text in a pre element
is displayed in a fixed-width
font, and it preserves
both      spaces and
line breaks
                </pre>
                <pre>
                    <code>
var config = {"theme":"dark",api-key:"fjhb3u2h4busifhu13u232iuiwrew"}
function () { }
                    </code>
                </pre>
            </div>
            <div class="cols__2 page__single__col">
                <?php get_sidebar("standar")?>
            </div>
        </article>
    </div>
    <!-- /single page -->
<?php 
get_footer();?>