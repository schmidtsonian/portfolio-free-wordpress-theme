/// <reference path="../definitions/greensock/greensock.d.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />

/// <reference path="../common/Router.ts" />
/// <reference path="../common/ViewManager.ts" />
/// <reference path="../common/View.ts" />
/// <reference path="../common/Loader.ts" />

/// <reference path="components/MainMenu.ts" />

/// <reference path="views/Home.ts" />

module index {
    
    import Router = common.Router;
    import ViewManager = common.ViewManager;
    import Loader = common.Loader;
    // import View = common.View;
    
    import MainMenu = components.MainMenu;
    
    // import HomeView = views.Home;

    export enum MainViews {
        // HomeView,
        // AboutMeView,
        // SomeCode
    }
	export class IndexApp {
		
        private router:Router;
        // private viewManager:ViewManager;
        private loader:Loader;
        
        private mainMenu:MainMenu;
        
        // private HomeView:HomeView;
        // private AboutMeView:View;
        // private SomeCode:View;
        
		constructor () {
            
            this.router = new Router();
            // this.viewManager = new ViewManager();
            this.loader = new Loader();
		}

		init ():void {
            
            this.mainMenu = new MainMenu($("#js-main-header__button"), $("#js-main-header__nav"));
			
            $(document).on("click", "a.page-load", (e: JQueryEventObject) => {
                e.preventDefault();
                var path = $(e.currentTarget).attr("href");
                this.router.navigate(path);
                
            });
            
            this.router
                .add(()=> {
                    this.loader.load(this.router.getpathname(), () => {  } );
                })
                .listen();
            // this.router.check();
        }
	}
}