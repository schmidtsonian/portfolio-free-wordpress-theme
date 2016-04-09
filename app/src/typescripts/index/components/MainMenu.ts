module components {
    
    export class MainMenu {
        
        private btMenu: JQuery;
        private btLinks: JQuery;
        private container: JQuery;
        
        private isOpened:boolean;
        
        constructor(bt: JQuery, container: JQuery){
            
            this.btMenu = bt;
            this.container = container;
            this.btLinks = $("a.pushstate", this.container);
            
            this.isOpened = false;
            
            this.bind();
        }
        
        private bind():void{
            
            this.btMenu.on("click", this.toogleState.bind(this));
            this.btLinks.on("click", this.close.bind(this));
        }
        
        private toogleState(): void{
            if(this.isOpened){ this.close();
            }else{ this.open(); }
        }
        
        private open():void{
            
            this.isOpened = true;
            this.btMenu.addClass("active");
            this.container.addClass("active");
        }
        
        private close():void{
            
            this.isOpened = false;
            this.btMenu.removeClass("active");
            this.container.removeClass("active");
        }
        
        eneable():void{
            // this.btMenu.css({left: "0"});
            
        }
        
        diseable():void{
            // this.btMenu.css({left: "-60px"});
        }
    }
}