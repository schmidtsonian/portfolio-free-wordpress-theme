<?php
function add_custom_page( $pageName, $pageTitle ) {
        
        $page = get_page_by_path( $pageName );
        if ( ! $page ) {
            $p = array();
            $p['post_title'] = $pageTitle;
            $p['post_name'] = $pageName;
            $p['post_content'] = "Page content not editable.";
            $p['post_status'] = 'publish';
            $p['post_type'] = 'page';
            $p['comment_status'] = 'closed';
            $p['ping_status'] = 'closed';
            $p['post_category'] = array(1); // the default 'Uncategorized'
            wp_insert_post( $p );
        }
    }

// add_custom_page( 'home', 'Home' );
add_custom_page( 'about', 'About' );
// add_custom_page( 'blog', 'Blog' );

function add_custom_menu_page() {
    $page = get_page_by_path( 'about' );
    add_menu_page(
        __( 'About' ),
        __( 'About' ),
        'manage_options',
        'post.php?post=' . $page->ID . '&action=edit'
    );
    
    $page = get_page_by_path( 'blog' );
    add_menu_page(
        __( 'Blog' ),
        __( 'Blog' ),
        'manage_options',
        'post.php?post=' . $page->ID . '&action=edit'
    );
    
    $page = get_page_by_path( 'home' );
    add_menu_page(
        __( 'Home' ),
        __( 'Home' ),
        'manage_options',
        'post.php?post=' . $page->ID . '&action=edit'
    );
}
add_action( 'admin_menu', 'add_custom_menu_page' );

function create_posttype() {
  register_post_type( 'portfolio',
        array(
            'labels' => array(
            'name' => __( 'Portfolio' ),
            'singular_name' => __( 'Piece' ),
            // 'menu_name'          => _x( 'Books', 'admin menu', 'your-plugin-textdomain' ),
            // 'name_admin_bar'     => _x( 'Book', 'add new on admin bar', 'your-plugin-textdomain' ),
            'add_new'            => __( 'Add Piece' ),
            'add_new_item'       => __( 'Add new Piece' ),
            // 'new_item'           => __( 'New Book', 'your-plugin-textdomain' ),
            'edit_item'          => __( 'Edit piece' ),
            'view_item'          => __( 'View piece' ),
            'all_items'          => __( 'All Pieces' ),
            'search_items'       => __( 'Search Pieces' ),
            // 'parent_item_colon'  => __( 'Parent Books:', 'your-plugin-textdomain' ),
            // 'not_found'          => __( 'No books found.', 'your-plugin-textdomain' ),
            // 'not_found_in_trash' => __( 'No books found in Trash.', 'your-plugin-textdomain' )
        ),
        // 'description'        => __( 'Description.', 'your-plugin-textdomain' ),
        'public'             => true,
        'publicly_queryable' => true,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'query_var'          => true,
        'rewrite'            => array( 'slug' => 'portfolio' ),
        'capability_type'    => 'post',
        'has_archive'        => true,
        'hierarchical'       => false,
        // 'menu_position'      => null,
        //   'rewrite' => array('slug' => 'products'),
    )
  );
}
add_action( 'init', 'create_posttype' );

?>