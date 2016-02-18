/// <reference path="../definitions/greensock/greensock.d.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />

/// <reference path="../common/Router.ts" />
/// <reference path="../common/ViewManager.ts" />
/// <reference path="../common/View.ts" />


/// <reference path="views/Home.ts" />

// module index {
    
//     import Router = common.Router;
//     import ViewManager = common.ViewManager;
//     import View = common.View;
    
//     import MainMenu = components.MainMenu;
    
//     import HomeView = views.Home;

//     export enum MainViews {
//         HomeView,
//         AboutMeView,
//         SomeCode
//     }
// 	export class IndexApp {
		
//         private router:Router;
//         private viewManager:ViewManager;
        
//         private mainMenu:MainMenu;
        
//         private HomeView:HomeView;
//         private AboutMeView:View;
//         private SomeCode:View;
        
// 		constructor () {
            
//             this.router = new Router();
//             this.viewManager = new ViewManager();
// 		}

// 		init ():void {
            
//             this.mainMenu = new MainMenu($("#button-menu"), $("#main-navigation"));
			
//             var mainContainer = $("#main-container");
//             this.HomeView = new HomeView("/index.html #container__home", mainContainer );
//             this.AboutMeView = new View("/about-me/index.html #container__aboutme", mainContainer );
//             this.SomeCode = new View("/some-code/index.html #container__somecode", mainContainer );
            
//             this.viewManager.addView(MainViews.HomeView, this.HomeView );
//             this.viewManager.addView(MainViews.AboutMeView, this.AboutMeView );
//             this.viewManager.addView(MainViews.SomeCode, this.SomeCode );
            
            
//             var isFirstLoad = true;
            
//             this.router
//                 .add(/about-me/, () =>{
//                     this.mainMenu.eneable();
//                     if(isFirstLoad){
//                         isFirstLoad = false;
//                         this.viewManager.currentView = this.AboutMeView;
//                     }else{
//                         this.viewManager.openView(MainViews.AboutMeView);
//                     }
//                 })
//                 .add(/some-code/, () =>{
//                     this.mainMenu.eneable();
//                     if(isFirstLoad){
//                         isFirstLoad = false;
//                         this.viewManager.currentView = this.SomeCode;
//                     }else{
//                         this.viewManager.openView(MainViews.SomeCode);
//                     }
//                 })
//                 .add(() =>{
//                     this.mainMenu.diseable();
//                     if(isFirstLoad){
//                         isFirstLoad = false;
//                         this.viewManager.currentView = this.HomeView;
//                         this.HomeView.bind();
//                     }else{
//                         this.viewManager.openView(MainViews.HomeView);
//                     }
//                 })
//                 .listen();
//             $(document).on("click", "a.pushstate", (e: JQueryEventObject) => {
//                 e.preventDefault();
//                 this.router.navigate($(e.currentTarget).attr("href"));
//             })
//             this.router.check();
//         }
// 	}
// }