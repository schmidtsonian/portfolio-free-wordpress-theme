/// <reference path="../definitions/greensock/greensock.d.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />

module common{
    
    export class Loader {
        
        private element: string;
        private result: JQuery;
        
        constructor() {
            
            this.element = "#js-main-container";
            this.result = $( this.element );
        }
        
        load ( path: string ) : void{
            
            this.result.load( path + " " + this.element, () => {
                // console.log("done!");
            } );
        }
    }
}