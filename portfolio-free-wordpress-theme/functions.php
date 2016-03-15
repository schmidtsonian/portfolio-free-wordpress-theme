<?php 
function add_custom_page($pageName, $pageTitle) {

    $page = get_page_by_path($pageName);
    if (!$page) {
        $p = array();
        $p['post_title'] = $pageTitle;
        $p['post_name'] = $pageName;
        $p['post_content'] = "<p>Id pariatur magna eu culpa consequat sint incididunt in deserunt aliquip occaecat ullamco. Sit culpa proident est mollit officia minim proident sint veniam labore. Laborum velit sint minim ipsum velit.</p><p>Nulla officia ea non non cillum id tempor mollit consequat magna consectetur et.</p>";
        $p['post_status'] = 'publish';
        $p['post_type'] = 'page';
        $p['comment_status'] = 'closed';
        $p['ping_status'] = 'closed';
        // $p['post_category'] = array(1); // the default 'Uncategorized'
        wp_insert_post($p);
    }
}



function add_custom_menu_page() {
    $page = get_page_by_path('about');
    add_menu_page(
    __('About'),
    __('About'), 'manage_options', 'post.php?post='.$page->ID.'&action=edit');
}


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
            'label'    => __( '1. Skill one title' ),
            'section'  => 'about_section',
            'settings' => 'about_skill_1_settings',
        ) 
    );
    $wp_customize->add_setting( 'about_skill_desc_1_settings', array( 'default' => 'Skill description') );
    $wp_customize->add_control( 
        'about_skill_desc_1_control', 
        array(
            'label'    => __( 'Description' ),
            'section'  => 'about_section',
            'settings' => 'about_skill_desc_1_settings',
        ) 
    );
    
    $wp_customize->add_setting( 'about_skill_2_settings', array( 'default' => 'Web developer') );
    $wp_customize->add_control( 
        'about_skill_2_control', 
        array(
            'label'    => __( '2. Skill one title' ),
            'section'  => 'about_section',
            'settings' => 'about_skill_2_settings',
        ) 
    );
    
    $wp_customize->add_setting( 'about_skill_desc_2_settings', array( 'default' => 'Skill description') );
    $wp_customize->add_control( 
        'about_skill_desc_2_control', 
        array(
            'label'    => __( 'Description' ),
            'section'  => 'about_section',
            'settings' => 'about_skill_desc_2_settings',
        ) 
    );
    
    $wp_customize->add_setting( 'about_skill_3_settings', array( 'default' => 'Web developer') );
    $wp_customize->add_control( 
        'about_skill_3_control', 
        array(
            'label'    => __( '3. Skill one title' ),
            'section'  => 'about_section',
            'settings' => 'about_skill_3_settings',
        ) 
    );
    
    $wp_customize->add_setting( 'about_skill_desc_3_settings', array( 'default' => 'Skill description') );
    $wp_customize->add_control( 
        'about_skill_desc_3_control', 
        array(
            'label'    => __( 'Description' ),
            'section'  => 'about_section',
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

function register_menus() {
    
  register_nav_menu('header-menu',__( 'Header Menu' ));
}

function add_nav_class($output) {
    $output= preg_replace('/<a/', '<a class="page-load"', $output, -1);
    return $output;
}


add_custom_page('about', 'About');
add_action('admin_menu', 'add_custom_menu_page');
add_action('init', 'create_posttype');
add_action( 'init', 'register_menus' );
add_filter('wp_nav_menu', 'add_nav_class');
add_action('customize_register', 'theme_customizer_home');
add_action('customize_register', 'theme_customizer_about');


