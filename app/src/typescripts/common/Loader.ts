/// <reference path="../definitions/greensock/greensock.d.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />

module common{
    
    export class Loader {
        
        private container: string;
        
        private result: JQuery;
        private overlay: JQuery;
        private body: JQuery;
        
        constructor() {
            
            this.container = '#js-main-container';
            this.result = $( '#js-res' );
            this.overlay = $( '#js-overlay-loader' );
            this.body = $( 'body' );
        }
        
        load ( path: string, onLoad: Function ) : void {
            
            this.body.css( { 'overflow': 'none' } );
            this.body.scrollTop( 0 );
            TweenMax.set( this.overlay, { left: 0 } );
            
            this.result.load( path + ' ' + this.container, () => {
                onLoad();
                TweenMax.to( this.overlay, 0.25, {
                    left: '-100%', 
                    onComplete: () =>  { 
                        this.body.css( { 'overflow': 'auto' } );
                    } 
                });
            } );
        }
    }
}