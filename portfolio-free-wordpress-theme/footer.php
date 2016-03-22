        
        </div>
        <!-- / Main Container -->

        <!-- Main Foote -->
        <footer class="main-footer">
        
            <!-- Sidebar footer contact -->
            <div class="sidebar sidebar__footer-contact">
                <p>
                    <strong>
                        <a href="mailto:<?php echo get_theme_mod('email_settings'); ?>", target="_blank"><?php echo get_theme_mod('email_settings'); ?></a>
                    </strong>
                </p>
            </div>
            <!-- /Sidebar footer contact -->
            
            <!-- Sidebar footer copyright -->
            <div class="sidebar sidebar__footer-copyright">
                <p>© 2016, copyright</p>
            </div>
            <!-- /Sidebar footer copyright -->
        </footer>
        <?php wp_footer(); ?>
        <script>
            (function($) {
                // dentro de esta función $() funcionará como un álias de jQuery() 
            })(jQuery);
        </script>
    </body>
    <!-- /Main Foote -->
</html>