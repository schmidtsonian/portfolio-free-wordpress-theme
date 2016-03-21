<?php 

// 564x400
// 468x400
// 
// 
// 

function create_thumb_sizes () {
    
    add_theme_support( 'post-thumbnails' );
    
    update_option('thumbnail_size_w', 564);
    update_option('thumbnail_size_h', 400);

    update_option('medium_size_w', 468);
    update_option('medium_size_h', 400);

    update_option('large_size_w', 1280);
    update_option('large_size_h', 400);
}

function add_custom_page ( $pageName, $pageTitle ) {

    $page = get_page_by_path( $pageName );
    if ( !$page ) {
                          $p = array();
        $p['comment_status'] = 'closed';
          $p['post_content'] = "<p>Id pariatur magna eu culpa consequat sint incididunt in deserunt aliquip occaecat ullamco.</p>";
            $p['post_title'] = $pageTitle;
             $p['post_name'] = $pageName;
           $p['post_status'] = 'publish';
             $p['post_type'] = 'page';
           $p['ping_status'] = 'closed';
        wp_insert_post($p);
    }
}



function add_custom_menu_page() {
    
    $page = get_page_by_path('about');
    
    add_menu_page( 
        __('About'), 
        __('About'), 
        'manage_options', 
        'post.php?post=' . $page->ID . '&action=edit' 
    );
}

function create_portfolio_posttype() {
    register_post_type('portfolio',
        array(
            'labels' => array(
                              'name' => __('Portfolio'), 
                     'singular_name' => __('Piece'),
                         'menu_name' => __( 'Portfolio' ),
                           'add_new' => __('Add Piece'), 
                      'add_new_item' => __('Add new Piece'),
                          'new_item' => __( 'New Piece' ),
                         'edit_item' => __('Edit piece'), 
                         'view_item' => __('View piece'), 
                         'all_items' => __('All Pieces'), 
                      'search_items' => __('Search Pieces'),
                         'not_found' => __( 'No pieces found.'),
                'not_found_in_trash' => __( 'No pieces found in Trash.')
        ),
                'description' => __( 'Upload your diferents pieces.' ),
                    'public ' => true, 
        'exclude_from_search' => false,
         'publicly_queryable' => true, 
                    'show_ui' => true, 
               'show_in_menu' => true, 
                  'query_var' => true, 
                'has_archive' => true, 
               'hierarchical' => false,
            'capability_type' => 'post', 
                   'supports' => array ( 'title', 'editor', 'thumbnail' ),
                    'rewrite' => array( 'slug' => 'portfolio' ), 
    ));
}

function create_portfolio_taxonomies () {

	$args = array(
                   'public' => false,
		     'hierarchical' => true,
		          'show_ui' => true,
		'show_admin_column' => true,
		        'query_var' => true,
		          'rewrite' => array( 'slug' => 'categories' ),
	);

	register_taxonomy( 'cats', array( 'portfolio' ), $args );
}

function theme_customizer_about( $wp_customize ) {
    $wp_customize->add_section( 
        'about_section', 
        array(
                  'title' => __( 'About' ),
               'priority' => 30,
            'description' => '',
        ) 
    );
    
    $wp_customize->add_setting( 'avatar_settings' );
    $wp_customize->add_control( 
        new WP_Customize_Image_Control( 
            $wp_customize, 
            'avatar_control', 
            array(
                   'label' => __( 'Avatar' ),
                 'section' => 'about_section',
                'settings' => 'avatar_settings',
            ) 
        ) 
    );
    
    $wp_customize->add_setting( 'about_skill_1_settings', array( 'default' => 'Web developer') );
    $wp_customize->add_control( 
        'about_skill_1_control', 
        array(
               'label' => __( '1. Skill one title' ),
             'section' => 'about_section',
            'settings' => 'about_skill_1_settings',
        ) 
    );
    $wp_customize->add_setting( 'about_skill_desc_1_settings', array( 'default' => 'Skill description') );
    $wp_customize->add_control( 
        'about_skill_desc_1_control', 
        array(
               'label' => __( 'Description' ),
             'section' => 'about_section',
            'settings' => 'about_skill_desc_1_settings',
        ) 
    );
    
    $wp_customize->add_setting( 'about_skill_2_settings', array( 'default' => 'Web developer') );
    $wp_customize->add_control( 
        'about_skill_2_control', 
        array(
               'label' => __( '2. Skill one title' ),
             'section' => 'about_section',
            'settings' => 'about_skill_2_settings',
        ) 
    );
    
    $wp_customize->add_setting( 'about_skill_desc_2_settings', array( 'default' => 'Skill description') );
    $wp_customize->add_control( 
        'about_skill_desc_2_control', 
        array(
               'label' => __( 'Description' ),
             'section' => 'about_section',
            'settings' => 'about_skill_desc_2_settings',
        ) 
    );
    
    $wp_customize->add_setting( 'about_skill_3_settings', array( 'default' => 'Web developer') );
    $wp_customize->add_control( 
        'about_skill_3_control', 
        array(
               'label' => __( '3. Skill one title' ),
             'section' => 'about_section',
            'settings' => 'about_skill_3_settings',
        ) 
    );
    
    $wp_customize->add_setting( 'about_skill_desc_3_settings', array( 'default' => 'Skill description') );
    $wp_customize->add_control( 
        'about_skill_desc_3_control', 
        array(
               'label' => __( 'Description' ),
             'section' => 'about_section',
            'settings' => 'about_skill_desc_3_settings',
        ) 
    );
}
function theme_customizer_home( $wp_customize ) {
    $wp_customize->add_section( 
        'home_section', 
        array(
                  'title' => __( 'Home' ),
               'priority' => 30,
            'description' => '',
        ) 
    );
    
    $wp_customize->add_setting( 'logo_settings' );
    $wp_customize->add_control( 
        new WP_Customize_Image_Control( 
            $wp_customize, 
            'logo_control', 
            array(
                   'label' => __( 'Logo' ),
                 'section' => 'home_section',
                'settings' => 'logo_settings',
            ) 
        ) 
    );
    
    $wp_customize->add_setting( 'banner_settings' );
    $wp_customize->add_control( 
        new WP_Customize_Image_Control( 
            $wp_customize, 
            'banner_control', 
            array(
                   'label' => __( 'Banner image' ),
                 'section' => 'home_section',
                'settings' => 'banner_settings',
            ) 
        ) 
    );
    
    $wp_customize->add_setting( 'bgabout_settings' );
    $wp_customize->add_control( 
        new WP_Customize_Image_Control( 
            $wp_customize, 
            'bgabout_control', 
            array(
                   'label' => __( 'Background about' ),
                 'section' => 'home_section',
                'settings' => 'bgabout_settings',
            ) 
        ) 
    );
    
    $wp_customize->add_setting( 'name_settings' );
    $wp_customize->add_control( 
        'author_control', 
        array(
               'label' => __( 'Your name' ),
             'section' => 'home_section',
            'settings' => 'name_settings',
        ) 
    );
    $wp_customize->add_setting( 'description_settings', array( 'default' => 'Duis ea proident fugiat ad irure labore pariatur ut eiusmod Lorem cupidatat sit amet.') );
    $wp_customize->add_control( 
        'description_control', 
        array(
               'label' => __( 'About You' ),
             'section' => 'home_section',
            'settings' => 'description_settings',
        ) 
    );
    
    $wp_customize->add_setting( 'email_settings', array( 'default' => 'john@doe.com') );
    $wp_customize->add_control( 
        'email_control', 
        array(
               'label' => __( 'Email' ),
             'section' => 'home_section',
            'settings' => 'email_settings',
        ) 
    );
    
    $wp_customize->add_setting( 'github_settings', array( 'default' => 'http://github.com') );
    $wp_customize->add_control( 
        'github_control', 
        array(
               'label' => __( 'Github' ),
             'section' => 'home_section',
            'settings' => 'github_settings',
        ) 
    );
}

function register_menus() {
    
  register_nav_menu('header-menu',__( 'Header Menu' ));
}

function add_nav_class($output) {
    $output= preg_replace('/<a/', '<a class="page-load"', $output, -1);
    return $output;
}

function custom_theme_setup() {
	add_theme_support( 'post-thumbnails' );
}
function new_excerpt_length($length) {
	return 15;
}
add_filter('excerpt_length', 'new_excerpt_length');

add_custom_page('about', 'About');
add_custom_page('blog', 'Blog');
add_action(  'after_setup_theme', 'custom_theme_setup' );
add_action(         'admin_menu', 'add_custom_menu_page');
add_action(               'init', 'create_thumb_sizes');
add_action(               'init', 'create_portfolio_posttype');
add_action(               'init', 'create_portfolio_taxonomies', 0 );
add_action(               'init', 'register_menus' );
add_filter(        'wp_nav_menu', 'add_nav_class');
add_action( 'customize_register', 'theme_customizer_home');
add_action( 'customize_register', 'theme_customizer_about');


