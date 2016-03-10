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

add_custom_page( 'home', 'Home' );
add_custom_page( 'about', 'About' );
add_custom_page( 'blog', 'Blog' );

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

?>