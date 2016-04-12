/// <reference path="../definitions/greensock/greensock.d.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />

module common {
    
    export class FilterGrid {
       
       constructor () {
           
       }
       
       init () : void {
           
           $(document).on("click", "a.filter-grid", (e: JQueryEventObject) => {

                e.preventDefault();
                
                var target = $( e.currentTarget );
                var filter = target.data('filter');
                var terms = $("[data-terms]");
                
                $("a.filter-grid").removeClass("active");
                target.addClass("active");
                
                if( filter == 'all'){
                    terms.css({"display": "block"});
                }else{
                    for (var index = 0; index < terms.length; index++) {
                        var selector = $(terms[index]);
                        var term = selector.data("terms");
                        if(term.indexOf( filter ) <= -1){
                            selector.css({"display": "none"});
                        }else{
                            selector.css({"display": "block"});
                        }
                    }
                }
            });
       }
    }
}