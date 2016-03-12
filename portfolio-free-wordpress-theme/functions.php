<?php 
function add_custom_page($pageName, $pageTitle) {

    $page = get_page_by_path($pageName);
    if (!$page) {
        $p = array();
        $p['post_title'] = $pageTitle;
        $p['post_name'] = $pageName;
        $p['post_content'] = "Page content not editable.";
        $p['post_status'] = 'publish';
        $p['post_type'] = 'page';
        $p['comment_status'] = 'closed';
        $p['ping_status'] = 'closed';
        $p['post_category'] = array(1); // the default 'Uncategorized'
        wp_insert_post($p);
    }
}

add_custom_page('about', 'About');

function add_custom_menu_page() {
    $page = get_page_by_path('about');
    add_menu_page(
    __('About'),
    __('About'), 'manage_options', 'post.php?post='.$page->ID.'&action=edit');
}
add_action('admin_menu', 'add_custom_menu_page');

function create_posttype() {
    register_post_type('portfolio',
    array('labels' => array('name' => __('Portfolio'), 'singular_name' => __('Piece'),
    // 'menu_name'          => _x( 'Books', 'admin menu', 'your-plugin-textdomain' ),
    // 'name_admin_bar'     => _x( 'Book', 'add new on admin bar', 'your-plugin-textdomain' ),
    'add_new' => __('Add Piece'), 'add_new_item' => __('Add new Piece'),
    // 'new_item'           => __( 'New Book', 'your-plugin-textdomain' ),
    'edit_item' => __('Edit piece'), 'view_item' => __('View piece'), 'all_items' => __('All Pieces'), 'search_items' => __('Search Pieces'),
    // 'parent_item_colon'  => __( 'Parent Books:', 'your-plugin-textdomain' ),
    // 'not_found'          => __( 'No books found.', 'your-plugin-textdomain' ),
    // 'not_found_in_trash' => __( 'No books found in Trash.', 'your-plugin-textdomain' )
    ),
    // 'description'        => __( 'Description.', 'your-plugin-textdomain' ),
    'public ' => true, 'public ly_queryable' => true, 'show_ui' => true, 'show_in_menu' => true, 'query_var' => true, 'rewrite' => array('slug' => 'portfolio'), 'capability_type' => 'post', 'has_archive' => true, 'hierarchical' => false,
    // 'menu_position'      => null,
    //   'rewrite' => array('slug' => 'products'),
    ));
}
add_action('init', 'create_posttype');




function theme_customizer( $wp_customize ) {
    $wp_customize->add_section( 
        'home_section', 
        array(
            'title' => __( 'Home' ),
            'priority' => 30,
            'description' => 'Upload a logo to replace the default site name and description in the header',
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
            'label'    => __( 'Your name' ),
            'section'  => 'home_section',
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
add_action('customize_register', 'theme_customizer');