/// <reference path="definitions/greensock/greensock.d.ts" />
/// <reference path="definitions/jquery/jquery.d.ts" />
/// <reference path="index/IndexApp.ts" />

// import IndexApp = index.IndexApp;
// var app: IndexApp;
// $(function() {
	
// 	app = new IndexApp();
// 	app.init();
// });
$(function() {
	
    $("#main-header__button").click(function(){

        $("#main-header__nav").toggleClass("active");
        $("#main-header__button").toggleClass("active");
        return false;
    });
});