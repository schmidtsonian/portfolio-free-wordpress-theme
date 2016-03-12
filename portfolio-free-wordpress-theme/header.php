<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Estebanco</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" type="ico" href="" sizes="32x32">
        <link rel="stylesheet" type="text/css" href="<?php echo get_stylesheet_uri(); ?>">
    </head>
    <body>
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
            <nav id="main-header__nav" class="main-header__nav">
                <a href="#" class="page-load">Home</a>
                <a href="#" class="page-load">About</a>
                <a href="#" class="page-load">Portfolio</a>
                <a href="#" class="page-load">Blog</a>
            </nav>
            <div id="main-header__button" class="main-header__button">
                <span class="center"></span>
                <span class="center"></span>
                <span class="center"></span>
            </div>
        </header>
        
        <!-- Main Container -->
        <div id="main-container" class="main-container">