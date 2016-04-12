/// <reference path="../definitions/greensock/greensock.d.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />

module common {
    
    export class FilterGrid {
       
       constructor () {
           
       }
       
       init () : void {
           
           $(document).on("click", "a.filter-grid", (e: JQueryEventObject) => {

                e.preventDefault();
                // var path = $(e.currentTarget).attr("href");
                
                var filter = $( e.currentTarget ).data('filter');
                var terms = $("[data-terms]");
                
                for (var index = 0; index < terms.length; index++) {
                    var element = $(terms[index]).data("terms");
                    console.log(element);
                }
                
            });
       }
       
    //    bind (): void {
           
    //    }
       
    //    unbind (): void {
           
    //    }
    }
}