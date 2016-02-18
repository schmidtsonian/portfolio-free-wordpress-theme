/**
 * From here:
 * http://krasimirtsonev.com/blog/article/A-modern-JavaScript-router-in-100-lines-history-api-pushState-hash-url
 */
var common;
(function (common) {
    var Router = (function () {
        function Router() {
            this.routes = [];
            this.config({ mode: 'history' }); // Default Config
        }
        Router.prototype.clearSlashes = function (path) {
            return path.toString().replace(/\/$/, '').replace(/^\//, '');
        };
        /**
         * PUBLIC API
         * ==========
         */
        /**
         * @param  {IRouterOptions} options?
         * @returns Router
         */
        Router.prototype.config = function (options) {
            this.mode = options && options.mode && options.mode === 'history' && !!(history.pushState) ? 'history' : 'hash';
            this.root = options && options.root && options.root ? '/' + this.clearSlashes(options.root) + '/' : '/';
            return this;
        };
        /**
         * @param  {string} route?
         * @returns Router
         */
        Router.prototype.check = function (route) {
            var fragment = route || this.getpathname();
            var self = this;
            this.routes.every(function (r, i) {
                var match = fragment.match(r.route);
                if (match) {
                    match.shift();
                    r.handler.apply({}, match);
                    return false;
                }
                return true;
            });
            return this;
        };
        /**
         * @returns string
         */
        Router.prototype.getpathname = function () {
            var fragment = '';
            if (this.mode === 'history') {
                fragment = this.clearSlashes(decodeURI(location.pathname + location.search));
                fragment = fragment.replace(/\?(.*)$/, '');
                fragment = this.root != '/' ? fragment.replace(this.root, '') : fragment;
            }
            else {
                var match = window.location.href.match(/#(.*)$/);
                fragment = match ? match[1] : '';
            }
            return this.clearSlashes(fragment);
        };
        /**
         * @param  {any} param
         * @param  {()=>void} handler?
         * @returns Router
         */
        Router.prototype.add = function (param, handler) {
            if (typeof param === 'function') {
                this.routes.push({ route: '', handler: param });
            }
            else {
                this.routes.push({ route: param, handler: handler });
            }
            return this;
        };
        /**
         * @param  {any} param
         * @returns Router
         */
        Router.prototype.remove = function (param) {
            var _this = this;
            this.routes.every(function (route, i) {
                if (route.handler === param || route.route.toString() === param.toString()) {
                    _this.routes.splice(i, 1);
                    return false;
                }
                return true;
            });
            return this;
        };
        Router.prototype.flush = function () {
            this.routes = [];
            this.config();
            return this;
        };
        Router.prototype.listen = function () {
            var _this = this;
            var current = this.getpathname();
            clearInterval(this.interval);
            this.interval = setInterval(function () {
                if (current !== _this.getpathname()) {
                    current = _this.getpathname();
                    _this.check(current);
                }
            }, 50);
            return this;
        };
        /**
         * @param  {string} route?
         * @returns Router
         */
        Router.prototype.navigate = function (route) {
            route = route || '';
            if (this.mode === 'history') {
                history.pushState(null, null, this.root + this.clearSlashes(route));
            }
            else {
                location.href.match(/#(.*)$/);
                location.href.replace(/#(.*)$/, '') + '#' + route;
            }
            return this;
        };
        return Router;
    })();
    common.Router = Router;
})(common || (common = {}));
/// <reference path="../definitions/greensock/greensock.d.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="IView.ts" />
var common;
(function (common) {
    var ViewManager = (function () {
        function ViewManager() {
            var _this = this;
            this.views = [];
            this.currentView = null;
            this.addView = function (id, view) {
                _this.views[id] = view;
            };
            /**
             * @param  {number} id
             * @returns JQueryPromise
             */
            this.openView = function (id) {
                var defer = $.Deferred();
                if (_this.currentView != null && (_this.getViewById(id) === _this.currentView)) {
                    var defer = $.Deferred();
                    defer.resolve();
                    return defer.promise();
                }
                if (_this.currentView != null) {
                    return _this.currentView.close()
                        .then(function () {
                        _this.currentView = _this.getViewById(id);
                        return _this.currentView.open();
                    });
                }
                _this.currentView = _this.getViewById(id);
                return _this.currentView.open();
            };
            this.closeCurrentView = function () {
                if (_this.currentView != null) {
                    var activeView = _this.currentView;
                    _this.currentView = null;
                    return activeView.close();
                }
            };
        }
        /**
         * @param  {number} id
         * @returns IView
         */
        ViewManager.prototype.getViewById = function (id) {
            return this.views[id];
        };
        /**
         * @param  {number} id
         * @returns boolean
         */
        ViewManager.prototype.isViewOpen = function (id) {
            return this.getViewById(id).isOpen;
        };
        /**
         * @param  {number} id
         * @returns JQueryPromise
         */
        ViewManager.prototype.closeView = function (id) {
            var view = this.getViewById(id);
            view.isOpen = false;
            return view.close();
        };
        ViewManager.prototype.reset = function () {
            this.currentView = null;
        };
        return ViewManager;
    })();
    common.ViewManager = ViewManager;
})(common || (common = {}));
/// <reference path="IView.ts" />
var common;
(function (common) {
    var View = (function () {
        // public target: HTMLElement;
        function View(target, $result) {
            this._isOpen = false;
            this.target = target;
            this.$result = $result;
        }
        Object.defineProperty(View.prototype, "isOpen", {
            get: function () { return this._isOpen; },
            enumerable: true,
            configurable: true
        });
        View.prototype.open = function () {
            var _this = this;
            console.log("open!!!", this.target, this.$result);
            var defer = $.Deferred();
            this.$result
                .load(this.target, function () {
                _this._isOpen = true;
                TweenMax.to(_this.$result, .45, { left: 0, ease: Cubic.easeIn, onComplete: function () {
                        _this.intro(defer);
                    } });
            });
            return defer.promise();
        };
        View.prototype.close = function () {
            var _this = this;
            var defer = $.Deferred();
            this.unbind();
            this._isOpen = false;
            TweenMax.to(this.$result, .45, { left: "-100%", ease: Cubic.easeOut, onComplete: function () {
                    _this.$result.scrollTop(0);
                    _this.departure(defer);
                } });
            return defer.promise();
        };
        /**
         * @param  {JQueryDeferred<{}>} d
         * @returns void
         */
        View.prototype.intro = function (d) {
            this.bind();
            d.resolve();
        };
        /**
         * @param  {JQueryDeferred<{}>} d
         * @returns void
         */
        View.prototype.departure = function (d) {
            d.resolve();
        };
        View.prototype.bind = function () { };
        View.prototype.unbind = function () { };
        return View;
    })();
    common.View = View;
})(common || (common = {}));
/// <reference path="../../common/View.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var views;
(function (views) {
    var Home = (function (_super) {
        __extends(Home, _super);
        function Home() {
            _super.apply(this, arguments);
        }
        Home.prototype.bind = function () {
        };
        return Home;
    })(common.View);
    views.Home = Home;
})(views || (views = {}));
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
/// <reference path="definitions/greensock/greensock.d.ts" />
/// <reference path="definitions/jquery/jquery.d.ts" />
/// <reference path="index/IndexApp.ts" />
// import IndexApp = index.IndexApp;
// var app: IndexApp;
// $(function() {
// 	app = new IndexApp();
// 	app.init();
// }); 

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9Sb3V0ZXIudHMiLCJjb21tb24vSVZpZXcudHMiLCJjb21tb24vVmlld01hbmFnZXIudHMiLCJjb21tb24vVmlldy50cyIsImluZGV4L3ZpZXdzL0hvbWUudHMiLCJpbmRleC9JbmRleEFwcC50cyIsIm1haW4udHMiXSwibmFtZXMiOlsiY29tbW9uIiwiY29tbW9uLlJvdXRlciIsImNvbW1vbi5Sb3V0ZXIuY29uc3RydWN0b3IiLCJjb21tb24uUm91dGVyLmNsZWFyU2xhc2hlcyIsImNvbW1vbi5Sb3V0ZXIuY29uZmlnIiwiY29tbW9uLlJvdXRlci5jaGVjayIsImNvbW1vbi5Sb3V0ZXIuZ2V0cGF0aG5hbWUiLCJjb21tb24uUm91dGVyLmFkZCIsImNvbW1vbi5Sb3V0ZXIucmVtb3ZlIiwiY29tbW9uLlJvdXRlci5mbHVzaCIsImNvbW1vbi5Sb3V0ZXIubGlzdGVuIiwiY29tbW9uLlJvdXRlci5uYXZpZ2F0ZSIsImNvbW1vbi5WaWV3TWFuYWdlciIsImNvbW1vbi5WaWV3TWFuYWdlci5jb25zdHJ1Y3RvciIsImNvbW1vbi5WaWV3TWFuYWdlci5nZXRWaWV3QnlJZCIsImNvbW1vbi5WaWV3TWFuYWdlci5pc1ZpZXdPcGVuIiwiY29tbW9uLlZpZXdNYW5hZ2VyLmNsb3NlVmlldyIsImNvbW1vbi5WaWV3TWFuYWdlci5yZXNldCIsImNvbW1vbi5WaWV3IiwiY29tbW9uLlZpZXcuY29uc3RydWN0b3IiLCJjb21tb24uVmlldy5pc09wZW4iLCJjb21tb24uVmlldy5vcGVuIiwiY29tbW9uLlZpZXcuY2xvc2UiLCJjb21tb24uVmlldy5pbnRybyIsImNvbW1vbi5WaWV3LmRlcGFydHVyZSIsImNvbW1vbi5WaWV3LmJpbmQiLCJjb21tb24uVmlldy51bmJpbmQiLCJ2aWV3cyIsInZpZXdzLkhvbWUiLCJ2aWV3cy5Ib21lLmNvbnN0cnVjdG9yIiwidmlld3MuSG9tZS5iaW5kIl0sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxJQUFPLE1BQU0sQ0Fx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O0FBQzVGLHVHQUF1RztBQUN2RyxzR0FBc0c7QUFFdEcsNEVBQTRFO0FBQzVFLGtGQUFrRjtBQUNsRiw0RUFBNEU7QUFHNUUsc0NBQXNDO0FBRXRDLDBCQUEwQjtBQUMxQiwwQ0FBMEM7QUFDMUMsK0NBQStDO0FBQy9DLHVDQUF1QztBQUN2QywrQ0FBK0M7QUFDL0MsMkVBQTJFO0FBQzNFLDZCQUE2QjtBQUM3Qiw0RUFBNEU7QUFDNUUsd0JBQXdCO0FBQ3hCLHFCQUFxQjtBQUNyQiwyQ0FBMkM7QUFDM0MsK0NBQStDO0FBQy9DLHVDQUF1QztBQUN2QywrQ0FBK0M7QUFDL0Msd0VBQXdFO0FBQ3hFLDZCQUE2QjtBQUM3Qix5RUFBeUU7QUFDekUsd0JBQXdCO0FBQ3hCLHFCQUFxQjtBQUNyQiw4QkFBOEI7QUFDOUIsZ0RBQWdEO0FBQ2hELHVDQUF1QztBQUN2QywrQ0FBK0M7QUFDL0Msd0VBQXdFO0FBQ3hFLGdEQUFnRDtBQUNoRCw2QkFBNkI7QUFDN0IseUVBQXlFO0FBQ3pFLHdCQUF3QjtBQUN4QixxQkFBcUI7QUFDckIsNkJBQTZCO0FBQzdCLGlGQUFpRjtBQUNqRixzQ0FBc0M7QUFDdEMseUVBQXlFO0FBQ3pFLGlCQUFpQjtBQUNqQixtQ0FBbUM7QUFDbkMsWUFBWTtBQUNaLEtBQUs7QUFDTCxJQUFJO0FDL0ZKLDZEQUE2RDtBQUM3RCx1REFBdUQ7QUFDdkQsMENBQTBDO0FBRTFDLG9DQUFvQztBQUNwQyxxQkFBcUI7QUFDckIsaUJBQWlCO0FBRWpCLHlCQUF5QjtBQUN6QixlQUFlO0FBQ2YsTUFBTSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBGcm9tIGhlcmU6XG4gKiBodHRwOi8va3Jhc2ltaXJ0c29uZXYuY29tL2Jsb2cvYXJ0aWNsZS9BLW1vZGVybi1KYXZhU2NyaXB0LXJvdXRlci1pbi0xMDAtbGluZXMtaGlzdG9yeS1hcGktcHVzaFN0YXRlLWhhc2gtdXJsXG4gKi9cblxubW9kdWxlIGNvbW1vbiB7XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIElSb3V0ZXJPcHRpb25zIHtcbiAgICAgICAgbW9kZT86IHN0cmluZztcbiAgICAgICAgcm9vdD86IHN0cmluZztcbiAgICB9XG5cbiAgICBpbnRlcmZhY2UgSVJvdXRlckFkZEFyZ3Mge1xuICAgICAgICByb3V0ZTogUmVnRXhwO1xuICAgICAgICBoYW5kbGVyOiAoKSA9PiB2b2lkO1xuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBSb3V0ZXIge1xuXG4gICAgICAgIHByaXZhdGUgbW9kZTogc3RyaW5nO1xuICAgICAgICBwcml2YXRlIHJvb3Q6IHN0cmluZztcbiAgICAgICAgcHJpdmF0ZSByb3V0ZXM6IElSb3V0ZXJBZGRBcmdzW107XG5cbiAgICAgICAgcHJpdmF0ZSBpbnRlcnZhbDogbnVtYmVyO1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIHRoaXMucm91dGVzID0gW107XG4gICAgICAgICAgICB0aGlzLmNvbmZpZyh7IG1vZGU6ICdoaXN0b3J5JyB9KTsgLy8gRGVmYXVsdCBDb25maWdcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgY2xlYXJTbGFzaGVzKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgICAgICByZXR1cm4gcGF0aC50b1N0cmluZygpLnJlcGxhY2UoL1xcLyQvLCAnJykucmVwbGFjZSgvXlxcLy8sICcnKTtcbiAgICAgICAgfVxuXG5cblx0XHQvKipcblx0XHQgKiBQVUJMSUMgQVBJXG5cdFx0ICogPT09PT09PT09PVxuXHRcdCAqL1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge0lSb3V0ZXJPcHRpb25zfSBvcHRpb25zP1xuICAgICAgICAgKiBAcmV0dXJucyBSb3V0ZXJcbiAgICAgICAgICovXG4gICAgICAgIGNvbmZpZyhvcHRpb25zPzogSVJvdXRlck9wdGlvbnMpOiBSb3V0ZXIge1xuICAgICAgICAgICAgdGhpcy5tb2RlID0gb3B0aW9ucyAmJiBvcHRpb25zLm1vZGUgJiYgb3B0aW9ucy5tb2RlID09PSAnaGlzdG9yeScgJiYgISEoaGlzdG9yeS5wdXNoU3RhdGUpID8gJ2hpc3RvcnknIDogJ2hhc2gnO1xuICAgICAgICAgICAgdGhpcy5yb290ID0gb3B0aW9ucyAmJiBvcHRpb25zLnJvb3QgJiYgb3B0aW9ucy5yb290ID8gJy8nICsgdGhpcy5jbGVhclNsYXNoZXMob3B0aW9ucy5yb290KSArICcvJyA6ICcvJztcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IHJvdXRlP1xuICAgICAgICAgKiBAcmV0dXJucyBSb3V0ZXJcbiAgICAgICAgICovXG4gICAgICAgIGNoZWNrKHJvdXRlPzogc3RyaW5nKTogUm91dGVyIHtcbiAgICAgICAgICAgIHZhciBmcmFnbWVudCA9IHJvdXRlIHx8IHRoaXMuZ2V0cGF0aG5hbWUoKTtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5yb3V0ZXMuZXZlcnkoKHIsIGkpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2ggPSBmcmFnbWVudC5tYXRjaChyLnJvdXRlKTtcblxuICAgICAgICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICBtYXRjaC5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICByLmhhbmRsZXIuYXBwbHkoe30sIG1hdGNoKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQHJldHVybnMgc3RyaW5nXG4gICAgICAgICAqL1xuICAgICAgICBnZXRwYXRobmFtZSgpOiBzdHJpbmcge1xuICAgICAgICAgICAgdmFyIGZyYWdtZW50ID0gJyc7XG4gICAgICAgICAgICBpZiAodGhpcy5tb2RlID09PSAnaGlzdG9yeScpIHtcbiAgICAgICAgICAgICAgICBmcmFnbWVudCA9IHRoaXMuY2xlYXJTbGFzaGVzKGRlY29kZVVSSShsb2NhdGlvbi5wYXRobmFtZSArIGxvY2F0aW9uLnNlYXJjaCkpO1xuICAgICAgICAgICAgICAgIGZyYWdtZW50ID0gZnJhZ21lbnQucmVwbGFjZSgvXFw/KC4qKSQvLCAnJyk7XG4gICAgICAgICAgICAgICAgZnJhZ21lbnQgPSB0aGlzLnJvb3QgIT0gJy8nID8gZnJhZ21lbnQucmVwbGFjZSh0aGlzLnJvb3QsICcnKSA6IGZyYWdtZW50O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2ggPSB3aW5kb3cubG9jYXRpb24uaHJlZi5tYXRjaCgvIyguKikkLyk7XG4gICAgICAgICAgICAgICAgZnJhZ21lbnQgPSBtYXRjaCA/IG1hdGNoWzFdIDogJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbGVhclNsYXNoZXMoZnJhZ21lbnQpO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHsoKT0+dm9pZH0gaGFuZGxlclxuICAgICAgICAgKiBAcmV0dXJucyBSb3V0ZXJcbiAgICAgICAgICovXG4gICAgICAgIGFkZChoYW5kbGVyOiAoKSA9PiB2b2lkKTogUm91dGVyO1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7UmVnRXhwfSByb3V0ZVxuICAgICAgICAgKiBAcGFyYW0gIHsoKT0+dm9pZH0gaGFuZGxlclxuICAgICAgICAgKiBAcmV0dXJucyBSb3V0ZXJcbiAgICAgICAgICovXG4gICAgICAgIGFkZChyb3V0ZTogUmVnRXhwLCBoYW5kbGVyOiAoKSA9PiB2b2lkKTogUm91dGVyO1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7YW55fSBwYXJhbVxuICAgICAgICAgKiBAcGFyYW0gIHsoKT0+dm9pZH0gaGFuZGxlcj9cbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICBhZGQocGFyYW06IGFueSwgaGFuZGxlcj86ICgpID0+IHZvaWQpOiBSb3V0ZXIge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJhbSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRoaXMucm91dGVzLnB1c2goeyByb3V0ZTogPGFueT4nJywgaGFuZGxlcjogcGFyYW0gfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucm91dGVzLnB1c2goeyByb3V0ZTogcGFyYW0sIGhhbmRsZXI6IGhhbmRsZXIgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHsoKT0+dm9pZH0gaGFuZGxlclxuICAgICAgICAgKiBAcmV0dXJucyBSb3V0ZXJcbiAgICAgICAgICovXG4gICAgICAgIHJlbW92ZShoYW5kbGVyOiAoKSA9PiB2b2lkKTogUm91dGVyO1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7c3RyaW5nfFJlZ0V4cH0gcm91dGVcbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICByZW1vdmUocm91dGU6IHN0cmluZyB8IFJlZ0V4cCk6IFJvdXRlcjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge2FueX0gcGFyYW1cbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICByZW1vdmUocGFyYW06IGFueSk6IFJvdXRlciB7XG4gICAgICAgICAgICB0aGlzLnJvdXRlcy5ldmVyeSgocm91dGUsIGkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocm91dGUuaGFuZGxlciA9PT0gcGFyYW0gfHwgcm91dGUucm91dGUudG9TdHJpbmcoKSA9PT0gcGFyYW0udG9TdHJpbmcoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJvdXRlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIGZsdXNoKCk6IFJvdXRlciB7XG4gICAgICAgICAgICB0aGlzLnJvdXRlcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5jb25maWcoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBsaXN0ZW4oKTogUm91dGVyIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5nZXRwYXRobmFtZSgpO1xuXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xuXG4gICAgICAgICAgICB0aGlzLmludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50ICE9PSB0aGlzLmdldHBhdGhuYW1lKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudCA9IHRoaXMuZ2V0cGF0aG5hbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVjayhjdXJyZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCA1MCk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgbmF2aWdhdGUoKTogUm91dGVyO1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7c3RyaW5nfSByb3V0ZVxuICAgICAgICAgKiBAcmV0dXJucyBSb3V0ZXJcbiAgICAgICAgICovXG4gICAgICAgIG5hdmlnYXRlKHJvdXRlOiBzdHJpbmcpOiBSb3V0ZXI7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IHJvdXRlP1xuICAgICAgICAgKiBAcmV0dXJucyBSb3V0ZXJcbiAgICAgICAgICovXG4gICAgICAgIG5hdmlnYXRlKHJvdXRlPzogc3RyaW5nKTogUm91dGVyIHtcbiAgICAgICAgICAgIHJvdXRlID0gcm91dGUgfHwgJyc7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGUgPT09ICdoaXN0b3J5Jykge1xuICAgICAgICAgICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKG51bGwsIG51bGwsIHRoaXMucm9vdCArIHRoaXMuY2xlYXJTbGFzaGVzKHJvdXRlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmLm1hdGNoKC8jKC4qKSQvKTtcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmLnJlcGxhY2UoLyMoLiopJC8sICcnKSArICcjJyArIHJvdXRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy9ncmVlbnNvY2svZ3JlZW5zb2NrLmQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zL2pxdWVyeS9qcXVlcnkuZC50c1wiIC8+XG5cblxubW9kdWxlIGNvbW1vbntcblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSVZpZXcge1xuICAgICAgICBvcGVuKCk6SlF1ZXJ5UHJvbWlzZTx7fT47XG4gICAgICAgIGNsb3NlKCk6SlF1ZXJ5UHJvbWlzZTx7fT47XG4gICAgICAgIGlzT3Blbjpib29sZWFuO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJJVmlldy50c1wiIC8+XG5cbm1vZHVsZSBjb21tb24ge1xuXG4gICAgaW1wb3J0IElWaWV3ID0gY29tbW9uLklWaWV3O1xuXG4gICAgZXhwb3J0IGNsYXNzIFZpZXdNYW5hZ2VyIHtcblxuICAgICAgICBwcml2YXRlIHZpZXdzOiBBcnJheTxJVmlldz4gPSBbXTtcbiAgICAgICAgY3VycmVudFZpZXc6IElWaWV3ID0gbnVsbDtcblxuICAgICAgICBhZGRWaWV3ID0gKGlkOiBudW1iZXIsIHZpZXc6IElWaWV3KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnZpZXdzW2lkXSA9IHZpZXc7XG4gICAgICAgIH07XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHtudW1iZXJ9IGlkXG4gICAgICAgICAqIEByZXR1cm5zIElWaWV3XG4gICAgICAgICAqL1xuICAgICAgICBnZXRWaWV3QnlJZChpZDogbnVtYmVyKTogSVZpZXcge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmlld3NbaWRdO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHtudW1iZXJ9IGlkXG4gICAgICAgICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICAgICAgICovXG4gICAgICAgIGlzVmlld09wZW4oaWQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Vmlld0J5SWQoaWQpLmlzT3BlbjtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7bnVtYmVyfSBpZFxuICAgICAgICAgKiBAcmV0dXJucyBKUXVlcnlQcm9taXNlXG4gICAgICAgICAqL1xuICAgICAgICBjbG9zZVZpZXcoaWQ6IG51bWJlcik6IEpRdWVyeVByb21pc2U8e30+IHtcbiAgICAgICAgICAgIHZhciB2aWV3ID0gdGhpcy5nZXRWaWV3QnlJZChpZCk7XG4gICAgICAgICAgICB2aWV3LmlzT3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHZpZXcuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7bnVtYmVyfSBpZFxuICAgICAgICAgKiBAcmV0dXJucyBKUXVlcnlQcm9taXNlXG4gICAgICAgICAqL1xuICAgICAgICBvcGVuVmlldyA9IChpZDogbnVtYmVyKTogSlF1ZXJ5UHJvbWlzZTx7fT4gPT4ge1xuXG4gICAgICAgICAgICB2YXIgZGVmZXIgPSAkLkRlZmVycmVkKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRWaWV3ICE9IG51bGwgJiYgKHRoaXMuZ2V0Vmlld0J5SWQoaWQpID09PSB0aGlzLmN1cnJlbnRWaWV3KSkge1xuICAgICAgICAgICAgICAgIHZhciBkZWZlciA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlKCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50VmlldyAhPSBudWxsKSB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50Vmlldy5jbG9zZSgpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFZpZXcgPSB0aGlzLmdldFZpZXdCeUlkKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRWaWV3Lm9wZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3VycmVudFZpZXcgPSB0aGlzLmdldFZpZXdCeUlkKGlkKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRWaWV3Lm9wZW4oKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjbG9zZUN1cnJlbnRWaWV3ID0gKCk6IEpRdWVyeVByb21pc2U8e30+ID0+IHtcblxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFZpZXcgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHZhciBhY3RpdmVWaWV3ID0gdGhpcy5jdXJyZW50VmlldztcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gbnVsbDtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWN0aXZlVmlldy5jbG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHJlc2V0KCk6IHZvaWQge1xuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIklWaWV3LnRzXCIgLz5cblxubW9kdWxlIGNvbW1vbiB7XG5cbiAgICBpbXBvcnQgSVZpZXcgPSBjb21tb24uSVZpZXc7XG4gICAgXG4gICAgZXhwb3J0IGNsYXNzIFZpZXcgaW1wbGVtZW50cyBJVmlldyB7XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNPcGVuOiBib29sZWFuID0gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIHRhcmdldDpzdHJpbmc7XG4gICAgICAgIHByaXZhdGUgJHJlc3VsdDpKUXVlcnk7XG4gICAgICAgIC8vIHB1YmxpYyB0YXJnZXQ6IEhUTUxFbGVtZW50O1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHRhcmdldDpzdHJpbmcsICRyZXN1bHQ6SlF1ZXJ5KSB7XG4gICAgICAgICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICAgICAgICAgIHRoaXMuJHJlc3VsdCA9ICRyZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICBnZXQgaXNPcGVuKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5faXNPcGVuOyB9XG5cbiAgICAgICAgb3BlbigpOiBKUXVlcnlQcm9taXNlPHt9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm9wZW4hISFcIiwgdGhpcy50YXJnZXQsIHRoaXMuJHJlc3VsdClcbiAgICAgICAgICAgIHZhciBkZWZlciA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy4kcmVzdWx0XG4gICAgICAgICAgICAgICAgLmxvYWQodGhpcy50YXJnZXQsICgpPT57XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2lzT3BlbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnRvKHRoaXMuJHJlc3VsdCwgLjQ1LCB7bGVmdDogMCwgZWFzZTogQ3ViaWMuZWFzZUluLCBvbkNvbXBsZXRlOiAoKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmludHJvKGRlZmVyKTtcbiAgICAgICAgICAgICAgICAgICAgfX0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGRlZmVyLnByb21pc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNsb3NlKCk6IEpRdWVyeVByb21pc2U8e30+IHtcbiAgICAgICAgICAgIHZhciBkZWZlciA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy51bmJpbmQoKTtcbiAgICAgICAgICAgIHRoaXMuX2lzT3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBUd2Vlbk1heC50byggdGhpcy4kcmVzdWx0LCAuNDUsIHtsZWZ0OiBcIi0xMDAlXCIsIGVhc2U6IEN1YmljLmVhc2VPdXQsIG9uQ29tcGxldGU6KCk9PntcbiAgICAgICAgICAgICAgICB0aGlzLiRyZXN1bHQuc2Nyb2xsVG9wKDApO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVwYXJ0dXJlKGRlZmVyKTsgXG4gICAgICAgICAgICB9fSApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBkZWZlci5wcm9taXNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHtKUXVlcnlEZWZlcnJlZDx7fT59IGRcbiAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgKi9cbiAgICAgICAgcHJvdGVjdGVkIGludHJvKGQ6IEpRdWVyeURlZmVycmVkPHt9Pik6IHZvaWQgeyBcbiAgICAgICAgICAgIHRoaXMuYmluZCgpOyBcbiAgICAgICAgICAgIGQucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHtKUXVlcnlEZWZlcnJlZDx7fT59IGRcbiAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgKi9cbiAgICAgICAgcHJvdGVjdGVkIGRlcGFydHVyZShkOiBKUXVlcnlEZWZlcnJlZDx7fT4pOiB2b2lkIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZC5yZXNvbHZlKCk7IFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBiaW5kKCk6dm9pZCB7IH1cbiAgICAgICAgcHJvdGVjdGVkIHVuYmluZCgpOnZvaWQgeyB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2NvbW1vbi9WaWV3LnRzXCIgLz5cblxubW9kdWxlIHZpZXdze1xuICAgIFxuICAgIGV4cG9ydCBjbGFzcyBIb21lIGV4dGVuZHMgY29tbW9uLlZpZXd7XG4gICAgICAgIFxuICAgICAgICBiaW5kKCk6dm9pZCB7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMvZ3JlZW5zb2NrL2dyZWVuc29jay5kLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy9qcXVlcnkvanF1ZXJ5LmQudHNcIiAvPlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY29tbW9uL1JvdXRlci50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY29tbW9uL1ZpZXdNYW5hZ2VyLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9jb21tb24vVmlldy50c1wiIC8+XG5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInZpZXdzL0hvbWUudHNcIiAvPlxuXG4vLyBtb2R1bGUgaW5kZXgge1xuICAgIFxuLy8gICAgIGltcG9ydCBSb3V0ZXIgPSBjb21tb24uUm91dGVyO1xuLy8gICAgIGltcG9ydCBWaWV3TWFuYWdlciA9IGNvbW1vbi5WaWV3TWFuYWdlcjtcbi8vICAgICBpbXBvcnQgVmlldyA9IGNvbW1vbi5WaWV3O1xuICAgIFxuLy8gICAgIGltcG9ydCBNYWluTWVudSA9IGNvbXBvbmVudHMuTWFpbk1lbnU7XG4gICAgXG4vLyAgICAgaW1wb3J0IEhvbWVWaWV3ID0gdmlld3MuSG9tZTtcblxuLy8gICAgIGV4cG9ydCBlbnVtIE1haW5WaWV3cyB7XG4vLyAgICAgICAgIEhvbWVWaWV3LFxuLy8gICAgICAgICBBYm91dE1lVmlldyxcbi8vICAgICAgICAgU29tZUNvZGVcbi8vICAgICB9XG4vLyBcdGV4cG9ydCBjbGFzcyBJbmRleEFwcCB7XG5cdFx0XG4vLyAgICAgICAgIHByaXZhdGUgcm91dGVyOlJvdXRlcjtcbi8vICAgICAgICAgcHJpdmF0ZSB2aWV3TWFuYWdlcjpWaWV3TWFuYWdlcjtcbiAgICAgICAgXG4vLyAgICAgICAgIHByaXZhdGUgbWFpbk1lbnU6TWFpbk1lbnU7XG4gICAgICAgIFxuLy8gICAgICAgICBwcml2YXRlIEhvbWVWaWV3OkhvbWVWaWV3O1xuLy8gICAgICAgICBwcml2YXRlIEFib3V0TWVWaWV3OlZpZXc7XG4vLyAgICAgICAgIHByaXZhdGUgU29tZUNvZGU6VmlldztcbiAgICAgICAgXG4vLyBcdFx0Y29uc3RydWN0b3IgKCkge1xuICAgICAgICAgICAgXG4vLyAgICAgICAgICAgICB0aGlzLnJvdXRlciA9IG5ldyBSb3V0ZXIoKTtcbi8vICAgICAgICAgICAgIHRoaXMudmlld01hbmFnZXIgPSBuZXcgVmlld01hbmFnZXIoKTtcbi8vIFx0XHR9XG5cbi8vIFx0XHRpbml0ICgpOnZvaWQge1xuICAgICAgICAgICAgXG4vLyAgICAgICAgICAgICB0aGlzLm1haW5NZW51ID0gbmV3IE1haW5NZW51KCQoXCIjYnV0dG9uLW1lbnVcIiksICQoXCIjbWFpbi1uYXZpZ2F0aW9uXCIpKTtcblx0XHRcdFxuLy8gICAgICAgICAgICAgdmFyIG1haW5Db250YWluZXIgPSAkKFwiI21haW4tY29udGFpbmVyXCIpO1xuLy8gICAgICAgICAgICAgdGhpcy5Ib21lVmlldyA9IG5ldyBIb21lVmlldyhcIi9pbmRleC5odG1sICNjb250YWluZXJfX2hvbWVcIiwgbWFpbkNvbnRhaW5lciApO1xuLy8gICAgICAgICAgICAgdGhpcy5BYm91dE1lVmlldyA9IG5ldyBWaWV3KFwiL2Fib3V0LW1lL2luZGV4Lmh0bWwgI2NvbnRhaW5lcl9fYWJvdXRtZVwiLCBtYWluQ29udGFpbmVyICk7XG4vLyAgICAgICAgICAgICB0aGlzLlNvbWVDb2RlID0gbmV3IFZpZXcoXCIvc29tZS1jb2RlL2luZGV4Lmh0bWwgI2NvbnRhaW5lcl9fc29tZWNvZGVcIiwgbWFpbkNvbnRhaW5lciApO1xuICAgICAgICAgICAgXG4vLyAgICAgICAgICAgICB0aGlzLnZpZXdNYW5hZ2VyLmFkZFZpZXcoTWFpblZpZXdzLkhvbWVWaWV3LCB0aGlzLkhvbWVWaWV3ICk7XG4vLyAgICAgICAgICAgICB0aGlzLnZpZXdNYW5hZ2VyLmFkZFZpZXcoTWFpblZpZXdzLkFib3V0TWVWaWV3LCB0aGlzLkFib3V0TWVWaWV3ICk7XG4vLyAgICAgICAgICAgICB0aGlzLnZpZXdNYW5hZ2VyLmFkZFZpZXcoTWFpblZpZXdzLlNvbWVDb2RlLCB0aGlzLlNvbWVDb2RlICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuLy8gICAgICAgICAgICAgdmFyIGlzRmlyc3RMb2FkID0gdHJ1ZTtcbiAgICAgICAgICAgIFxuLy8gICAgICAgICAgICAgdGhpcy5yb3V0ZXJcbi8vICAgICAgICAgICAgICAgICAuYWRkKC9hYm91dC1tZS8sICgpID0+e1xuLy8gICAgICAgICAgICAgICAgICAgICB0aGlzLm1haW5NZW51LmVuZWFibGUoKTtcbi8vICAgICAgICAgICAgICAgICAgICAgaWYoaXNGaXJzdExvYWQpe1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgaXNGaXJzdExvYWQgPSBmYWxzZTtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmlld01hbmFnZXIuY3VycmVudFZpZXcgPSB0aGlzLkFib3V0TWVWaWV3O1xuLy8gICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmlld01hbmFnZXIub3BlblZpZXcoTWFpblZpZXdzLkFib3V0TWVWaWV3KTtcbi8vICAgICAgICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgICAgIH0pXG4vLyAgICAgICAgICAgICAgICAgLmFkZCgvc29tZS1jb2RlLywgKCkgPT57XG4vLyAgICAgICAgICAgICAgICAgICAgIHRoaXMubWFpbk1lbnUuZW5lYWJsZSgpO1xuLy8gICAgICAgICAgICAgICAgICAgICBpZihpc0ZpcnN0TG9hZCl7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICBpc0ZpcnN0TG9hZCA9IGZhbHNlO1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3TWFuYWdlci5jdXJyZW50VmlldyA9IHRoaXMuU29tZUNvZGU7XG4vLyAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3TWFuYWdlci5vcGVuVmlldyhNYWluVmlld3MuU29tZUNvZGUpO1xuLy8gICAgICAgICAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICAgICAgfSlcbi8vICAgICAgICAgICAgICAgICAuYWRkKCgpID0+e1xuLy8gICAgICAgICAgICAgICAgICAgICB0aGlzLm1haW5NZW51LmRpc2VhYmxlKCk7XG4vLyAgICAgICAgICAgICAgICAgICAgIGlmKGlzRmlyc3RMb2FkKXtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgIGlzRmlyc3RMb2FkID0gZmFsc2U7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXdNYW5hZ2VyLmN1cnJlbnRWaWV3ID0gdGhpcy5Ib21lVmlldztcbi8vICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuSG9tZVZpZXcuYmluZCgpO1xuLy8gICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmlld01hbmFnZXIub3BlblZpZXcoTWFpblZpZXdzLkhvbWVWaWV3KTtcbi8vICAgICAgICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgICAgIH0pXG4vLyAgICAgICAgICAgICAgICAgLmxpc3RlbigpO1xuLy8gICAgICAgICAgICAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcImEucHVzaHN0YXRlXCIsIChlOiBKUXVlcnlFdmVudE9iamVjdCkgPT4ge1xuLy8gICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbi8vICAgICAgICAgICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZSgkKGUuY3VycmVudFRhcmdldCkuYXR0cihcImhyZWZcIikpO1xuLy8gICAgICAgICAgICAgfSlcbi8vICAgICAgICAgICAgIHRoaXMucm91dGVyLmNoZWNrKCk7XG4vLyAgICAgICAgIH1cbi8vIFx0fVxuLy8gfSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJkZWZpbml0aW9ucy9ncmVlbnNvY2svZ3JlZW5zb2NrLmQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImRlZmluaXRpb25zL2pxdWVyeS9qcXVlcnkuZC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiaW5kZXgvSW5kZXhBcHAudHNcIiAvPlxuXG4vLyBpbXBvcnQgSW5kZXhBcHAgPSBpbmRleC5JbmRleEFwcDtcbi8vIHZhciBhcHA6IEluZGV4QXBwO1xuLy8gJChmdW5jdGlvbigpIHtcblx0XG4vLyBcdGFwcCA9IG5ldyBJbmRleEFwcCgpO1xuLy8gXHRhcHAuaW5pdCgpO1xuLy8gfSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
