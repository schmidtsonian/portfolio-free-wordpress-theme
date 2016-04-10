/// <reference path="../definitions/greensock/greensock.d.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />


// TO-DO:
// Clean animations
// Animations with GSAP
// Separate loader images to another class
module common{
    
    export class Loader {
        
        private container: string;
        
        private result: JQuery;
        private overlay: JQuery;
        private overlayBar: JQuery;
        private overlayBg: JQuery;
        private body: JQuery;
        
        constructor() {
            
            this.container = '#js-main-container';
            this.result = $( '#js-res' );
            this.overlay = $( '#js-overlay-loader' );
            this.overlayBar = $( '#js-overlay-loader--bar' );
            this.overlayBg = $( '#js-overlay-loader--bg' );
            this.body = $( 'body' );
        }
        
        private animateOpen() : JQueryPromise<{}> {
            
            var defer = $.Deferred();
            
            
            TweenMax.killTweensOf( this.overlayBar );
            this.body.css( { 'overflow': 'hidden' } );
            TweenMax.set( this.overlayBar, { width: 0, y: 0 } );
            TweenMax.set( this.overlay, { left: 0 } );

            TweenLite.to(this.overlayBg, 0.05, {opacity: .2, onComplete: () => {
                    
                // FIX THIS!
                this.animateFillBar( 1 ); 
                this.body.stop().animate({scrollTop:0}, '250', 'swing', () => { 
                
                    TweenMax.to( this.result, 0.05, { y: "100px", opacity: 0, onComplete: () => {
                        defer.resolve(); 
                    } });
            
                });
            }});
            
            return defer.promise();    
        }
        
        private animateClose() : JQueryPromise<{}> {
            
            var defer = $.Deferred();
            
            
            this.animateFillBar( 100 )
                .then( () => {

                    TweenLite.to( this.overlayBg, 0.25, {opacity: 0 });
                    TweenLite.to( this.overlayBar, 0.25, {y: "-60px" } );
                    TweenLite.to( this.result, 0.25, { delay: 0.35, y: 0, opacity: 1, onComplete: () => {
                
                        TweenMax.set( this.overlay, { left: '-100%' } );
                        this.body.css( { 'overflow': 'auto' } );
                        defer.resolve(); 
                    } });
            });
    
            return defer.promise();    
        }
        
        private animateFillBar (toPercent: number) : JQueryPromise<{}> {
            
            var defer = $.Deferred();
            
            TweenMax.killTweensOf( this.overlayBar );
            TweenLite.to( this.overlayBar, 0.25, {width: toPercent + "%", onComplete: defer.resolve } );
            
            return defer.promise();
        }
        
        private processImages () : JQueryPromise<{}> {
            var defer = $.Deferred();
            
            var images = this.result.find( '[data-load]');
            var count = 0;
            
            if(images.length == 0){
                defer.resolve();
            }
            for (var index = 0; index < images.length; index++) {
                var src = $( images[index] ).data("load");
                
                var img = new Image();
                img.src = src;
                img.onload = () => { 
                    count++;
                    this.animateFillBar( (count/images.length ) * 100 );
                    
                    if( count >= images.length ){
                        defer.resolve();
                    }
                };
                img.onerror = () => {
                    count++;
                    if( count >= images.length ){
                        defer.resolve();
                    }
                }
            }
            
            
            return defer.promise();
        }
        
        private load( path: string ) : JQueryPromise<{}> {
            
            var defer = $.Deferred();
            this.result.load( "/" + path + ' ' + this.container, () => {
                
                this.processImages().then( defer.resolve ); 
            });
            return defer.promise();
        }
        
        open ( path: string ) : void {
            
            this.animateOpen()
                .then( this.load.bind( this, path ))
                .then( this.animateClose.bind( this ) );
            
            
        }
    }
}