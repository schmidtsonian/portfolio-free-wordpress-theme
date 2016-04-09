
/// <reference path="IView.ts" />

module common {

    import IView = common.IView;
    
    export class View implements IView {

        private _isOpen: boolean = false;
        
        private target:string;
        private $result:JQuery;
        // public target: HTMLElement;

        constructor(target:string, $result:JQuery) {
            this.target = target;
            this.$result = $result;
        }

        get isOpen(): boolean { return this._isOpen; }

        open(): JQueryPromise<{}> {
            console.log("open!!!", this.target, this.$result)
            var defer = $.Deferred();
            
            this.$result
                .load(this.target, ()=>{
                    this._isOpen = true;
                    TweenMax.to(this.$result, .45, {left: 0, ease: Cubic.easeIn, onComplete: ()=>{
                        
                        this.intro(defer);
                    }});
                });
                
            return defer.promise();
        }

        close(): JQueryPromise<{}> {
            var defer = $.Deferred();
            
            this.unbind();
            this._isOpen = false;
            
            TweenMax.to( this.$result, .45, {left: "-100%", ease: Cubic.easeOut, onComplete:()=>{
                this.$result.scrollTop(0);
                this.departure(defer); 
            }} );
            
            
            return defer.promise();
        }
        
        /**
         * @param  {JQueryDeferred<{}>} d
         * @returns void
         */
        protected intro(d: JQueryDeferred<{}>): void { 
            this.bind(); 
            d.resolve();
        }
        /**
         * @param  {JQueryDeferred<{}>} d
         * @returns void
         */
        protected departure(d: JQueryDeferred<{}>): void {
            
            d.resolve(); 
        }
        
        bind():void { }
        protected unbind():void { }
    }
}
