/// <reference path="definitions/greensock/greensock.d.ts" />
/// <reference path="definitions/jquery/jquery.d.ts" />
/// <reference path="index/IndexApp.ts" />

import IndexApp = index.IndexApp;
var app: IndexApp;
// $(function() {
	
// 	app = new IndexApp();
// 	app.init();
// });


(function($: any) {
    app = new IndexApp();
	app.init(); 
})(jQuery);
