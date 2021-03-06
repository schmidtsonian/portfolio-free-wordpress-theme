<!DOCTYPE html>
<html lang="en" style="margin-top: 0px !important;">
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <?php  show_admin_bar( false ); wp_head(); ?>
        
    </head>
    <body>
        <!-- Main Header -->
        <header class="main-header">
            <a href="/" title="<?php echo get_bloginfo( 'name' ); ?>" class="page-load">
            
                <img src="<?php 
                    if (get_theme_mod( 'logo_settings' )) : 
                        echo get_theme_mod( 'logo_settings'); 
                    else: 
                        echo 'https://placeholdit.imgix.net/~text?txtsize=23&txt=260%C3%9790&w=260&h=90'; 
                    endif; ?>" 
                    alt="<?php echo get_bloginfo( 'name' ); ?>" />
            </a>
            <nav id="js-main-header__nav" class="main-header__nav">
            <?php echo strip_tags(wp_nav_menu( 
                array( 
                     'theme_location' => 'header-menu',
                        'items_wrap'  => '%3$s',
                        'fallback_cb' => true,
                          'container' => '',
                              'depth' => 0,
                               'echo' => false,
 
                ) 
            ), '<a>'); ?>
            </nav>
            <div id="js-main-header__button" class="main-header__button">
                <span class="center"></span>
                <span class="center"></span>
                <span class="center"></span>
            </div>
        </header>
        <!-- /Main Header -->
        
        <!-- Main Container -->
        <div id="js-res">
            <div id="js-main-container" class="main-container">