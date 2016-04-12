/// <reference path="../definitions/greensock/greensock.d.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />

/// <reference path="../common/Router.ts" />
/// <reference path="../common/Loader.ts" />
/// <reference path="../common/FilterGrid.ts" />

/// <reference path="components/MainMenu.ts" />

/// <reference path="views/Home.ts" />

module index {
    
    import Router = common.Router;
    import Loader = common.Loader;
    import FilterGrid = common.FilterGrid;
    
    import MainMenu = components.MainMenu;
    
    
	export class IndexApp {
		
        private router:Router;
        private loader:Loader;
        private filterGrid:FilterGrid;
        
        private mainMenu:MainMenu;
        
		constructor () {
            
            this.router = new Router();
            this.loader = new Loader();
            this.filterGrid = new FilterGrid();
		}

		init ():void {
            
            this.mainMenu = new MainMenu($("#js-main-header__button"), $("#js-main-header__nav"));
			this.filterGrid.init();
            
            $(document).on("click", "a.page-load", (e: JQueryEventObject) => {
                e.preventDefault();
                var path = $(e.currentTarget).attr("href");
                this.router.navigate(path);
            });
            
            this.router
                .add(()=> {
                    this.loader.open(this.router.getpathname());
                })
                .listen();
            // this.router.check();
        }
	}
}