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
    }());
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
    }());
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
    }());
    common.View = View;
})(common || (common = {}));
var components;
(function (components) {
    var MainMenu = (function () {
        function MainMenu(bt, container) {
            this.btMenu = bt;
            this.container = container;
            this.btLinks = $("a.pushstate", this.container);
            this.isOpened = false;
            this.bind();
        }
        MainMenu.prototype.bind = function () {
            this.btMenu.on("click", this.toogleState.bind(this));
            this.btLinks.on("click", this.close.bind(this));
        };
        MainMenu.prototype.toogleState = function () {
            if (this.isOpened) {
                this.close();
            }
            else {
                this.open();
            }
        };
        MainMenu.prototype.open = function () {
            this.isOpened = true;
            this.btMenu.addClass("active");
            this.container.addClass("active");
        };
        MainMenu.prototype.close = function () {
            this.isOpened = false;
            this.btMenu.removeClass("active");
            this.container.removeClass("active");
        };
        MainMenu.prototype.eneable = function () {
            this.btMenu.css({ left: "0" });
        };
        MainMenu.prototype.diseable = function () {
            this.btMenu.css({ left: "-60px" });
        };
        return MainMenu;
    }());
    components.MainMenu = MainMenu;
})(components || (components = {}));
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
            var tl = new TimelineMax({ paused: true });
            tl.staggerTo(["#c-0", "#c-1"], 0.55, { borderRadius: "0", width: "600px", height: "600px", opacity: 1 }, 0.2);
            tl.to(["#c-0", "#c-1"], 0.15, { width: "100%", height: "100%", backgroundColor: "#DED4B9" });
            tl.to("#c-2", 0.5, { x: "0", transformOrigin: "-300% -100%" }, "-=0.25");
            tl.to("#c-2", 0.25, { y: "-100%", transformOrigin: "-300% -100%" }, "-=0.5");
            tl.to("#c-2", 0.25, { y: "50px", transformOrigin: "-300% -100%" }, "-=0.25");
            tl.to("#c-2", 0.25, { width: "10px", height: "10px", transformOrigin: "0 0" });
            tl.to("#c-2", 0.15, { width: "50px", height: "50px", ease: Elastic.easeOut });
            tl.to("#c-2", 0.25, { x: "150px" });
            tl.to("#c-2", 0.25, { x: "0", ease: Elastic.easeOut });
            tl.set("#c-3", { opacity: 1 }, "-=0.25");
            tl.to("#c-3", 0.55, { scale: 1, x: "-150px", ease: Elastic.easeOut }, "-=0.25");
            tl.to("#c-2", 0.15, { x: "25px", backgroundColor: "#64B6B1" });
            tl.to("#c-3", 0.15, { x: "-25px", backgroundColor: "#64B6B1" }, "-=0.15");
            tl.to("#c-2", 0.15, { x: "125px" });
            tl.to("#c-3", 0.15, { x: "-125px" }, "-=0.15");
            tl.to("#c-2", 0.85, { x: "45px", ease: Cubic.easeOut });
            tl.to("#c-3", 0.85, { x: "-45px", ease: Cubic.easeOut }, "-=0.85");
            tl.to("#c-2", 0.15, { x: "125px" });
            tl.to("#c-3", 0.15, { x: "-125px" }, "-=0.15");
            tl.to("#c-2", 0.45, { x: "25px", ease: Cubic.easeOut });
            tl.to("#c-3", 0.45, { x: "-25px", ease: Cubic.easeOut }, "-=0.45");
            tl.to("#c-2", 0.15, { x: "145px" });
            tl.to("#c-3", 0.15, { x: "-145px" }, "-=0.15");
            tl.to(["#c-2", "#c-3"], 0.15, { x: "0", ease: Cubic.easeIn });
            tl.to(["#c-2", "#c-3"], 0.35, { width: "80px", height: "80px", ease: Elastic.easeOut });
            tl.to(["#c-2", "#c-3"], 1.25, { width: "100px", height: "100px", delay: 0.05, ease: Quart.easeIn });
            tl.to(["#c-2", "#c-3"], 0.25, { width: "20px", height: "20px", delay: 0.05, ease: Cubic.easeOut });
            tl.to(["#c-2", "#c-3"], 0.15, { opacity: 0, width: "150px", height: "150px", delay: 0.05, ease: Elastic.easeOut });
            $("#block-about")
                .on("mouseenter", function () { tl.play(); })
                .on("mouseleave", function () { tl.seek(0); tl.stop(); });
            $("#block-home").on("click", function () { $(this).toggleClass("active"); });
        };
        return Home;
    }(common.View));
    views.Home = Home;
})(views || (views = {}));
/// <reference path="../definitions/greensock/greensock.d.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />
/// <reference path="../common/Router.ts" />
/// <reference path="../common/ViewManager.ts" />
/// <reference path="../common/View.ts" />
/// <reference path="components/MainMenu.ts" />
/// <reference path="views/Home.ts" />
var index;
(function (index) {
    var Router = common.Router;
    var ViewManager = common.ViewManager;
    var View = common.View;
    var MainMenu = components.MainMenu;
    var HomeView = views.Home;
    (function (MainViews) {
        MainViews[MainViews["HomeView"] = 0] = "HomeView";
        MainViews[MainViews["AboutMeView"] = 1] = "AboutMeView";
        MainViews[MainViews["SomeCode"] = 2] = "SomeCode";
    })(index.MainViews || (index.MainViews = {}));
    var MainViews = index.MainViews;
    var IndexApp = (function () {
        function IndexApp() {
            this.router = new Router();
            this.viewManager = new ViewManager();
        }
        IndexApp.prototype.init = function () {
            var _this = this;
            this.mainMenu = new MainMenu($("#button-menu"), $("#main-navigation"));
            var mainContainer = $("#main-container");
            this.HomeView = new HomeView("/index.html #container__home", mainContainer);
            this.AboutMeView = new View("/about-me/index.html #container__aboutme", mainContainer);
            this.SomeCode = new View("/some-code/index.html #container__somecode", mainContainer);
            this.viewManager.addView(MainViews.HomeView, this.HomeView);
            this.viewManager.addView(MainViews.AboutMeView, this.AboutMeView);
            this.viewManager.addView(MainViews.SomeCode, this.SomeCode);
            var isFirstLoad = true;
            this.router
                .add(/about-me/, function () {
                _this.mainMenu.eneable();
                if (isFirstLoad) {
                    isFirstLoad = false;
                    _this.viewManager.currentView = _this.AboutMeView;
                }
                else {
                    _this.viewManager.openView(MainViews.AboutMeView);
                }
            })
                .add(/some-code/, function () {
                _this.mainMenu.eneable();
                if (isFirstLoad) {
                    isFirstLoad = false;
                    _this.viewManager.currentView = _this.SomeCode;
                }
                else {
                    _this.viewManager.openView(MainViews.SomeCode);
                }
            })
                .add(function () {
                _this.mainMenu.diseable();
                if (isFirstLoad) {
                    isFirstLoad = false;
                    _this.viewManager.currentView = _this.HomeView;
                    _this.HomeView.bind();
                }
                else {
                    _this.viewManager.openView(MainViews.HomeView);
                }
            })
                .listen();
            $(document).on("click", "a.pushstate", function (e) {
                e.preventDefault();
                _this.router.navigate($(e.currentTarget).attr("href"));
            });
            this.router.check();
        };
        return IndexApp;
    }());
    index.IndexApp = IndexApp;
})(index || (index = {}));
/// <reference path="definitions/greensock/greensock.d.ts" />
/// <reference path="definitions/jquery/jquery.d.ts" />
/// <reference path="index/IndexApp.ts" />
var IndexApp = index.IndexApp;
var app;
$(function () {
    app = new IndexApp();
    app.init();
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9Sb3V0ZXIudHMiLCJjb21tb24vSVZpZXcudHMiLCJjb21tb24vVmlld01hbmFnZXIudHMiLCJjb21tb24vVmlldy50cyIsImluZGV4L2NvbXBvbmVudHMvTWFpbk1lbnUudHMiLCJpbmRleC92aWV3cy9Ib21lLnRzIiwiaW5kZXgvSW5kZXhBcHAudHMiLCJtYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILElBQU8sTUFBTSxDQXFMWjtBQXJMRCxXQUFPLE1BQU0sRUFBQyxDQUFDO0lBWVg7UUFPSTtZQUNJLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLGlCQUFpQjtRQUN2RCxDQUFDO1FBRU8sNkJBQVksR0FBcEIsVUFBcUIsSUFBWTtZQUM3QixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBR1A7OztXQUdHO1FBRUc7OztXQUdHO1FBQ0gsdUJBQU0sR0FBTixVQUFPLE9BQXdCO1lBQzNCLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLFNBQVMsR0FBRyxNQUFNLENBQUM7WUFDaEgsSUFBSSxDQUFDLElBQUksR0FBRyxPQUFPLElBQUksT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBRXhH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SSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBRTdGLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3pFLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzdFLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzdFLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUMvRSxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQzlFLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ3BDLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBRXZELEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3pDLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ2hGLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUM7WUFDL0QsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxlQUFlLEVBQUUsU0FBUyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFFMUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDcEMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBRS9DLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ3hELEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUVuRSxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNwQyxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFFL0MsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDeEQsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBRW5FLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ3BDLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUUvQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1lBQzlELEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUN4RixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFL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RyxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7SUFDckIsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ1osQ0FBQyxDQUFDLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRnJvbSBoZXJlOlxuICogaHR0cDovL2tyYXNpbWlydHNvbmV2LmNvbS9ibG9nL2FydGljbGUvQS1tb2Rlcm4tSmF2YVNjcmlwdC1yb3V0ZXItaW4tMTAwLWxpbmVzLWhpc3RvcnktYXBpLXB1c2hTdGF0ZS1oYXNoLXVybFxuICovXG5cbm1vZHVsZSBjb21tb24ge1xuXG4gICAgZXhwb3J0IGludGVyZmFjZSBJUm91dGVyT3B0aW9ucyB7XG4gICAgICAgIG1vZGU/OiBzdHJpbmc7XG4gICAgICAgIHJvb3Q/OiBzdHJpbmc7XG4gICAgfVxuXG4gICAgaW50ZXJmYWNlIElSb3V0ZXJBZGRBcmdzIHtcbiAgICAgICAgcm91dGU6IFJlZ0V4cDtcbiAgICAgICAgaGFuZGxlcjogKCkgPT4gdm9pZDtcbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3MgUm91dGVyIHtcblxuICAgICAgICBwcml2YXRlIG1vZGU6IHN0cmluZztcbiAgICAgICAgcHJpdmF0ZSByb290OiBzdHJpbmc7XG4gICAgICAgIHByaXZhdGUgcm91dGVzOiBJUm91dGVyQWRkQXJnc1tdO1xuXG4gICAgICAgIHByaXZhdGUgaW50ZXJ2YWw6IG51bWJlcjtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICB0aGlzLnJvdXRlcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5jb25maWcoeyBtb2RlOiAnaGlzdG9yeScgfSk7IC8vIERlZmF1bHQgQ29uZmlnXG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIGNsZWFyU2xhc2hlcyhwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICAgICAgcmV0dXJuIHBhdGgudG9TdHJpbmcoKS5yZXBsYWNlKC9cXC8kLywgJycpLnJlcGxhY2UoL15cXC8vLCAnJyk7XG4gICAgICAgIH1cblxuXG5cdFx0LyoqXG5cdFx0ICogUFVCTElDIEFQSVxuXHRcdCAqID09PT09PT09PT1cblx0XHQgKi9cbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHtJUm91dGVyT3B0aW9uc30gb3B0aW9ucz9cbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICBjb25maWcob3B0aW9ucz86IElSb3V0ZXJPcHRpb25zKTogUm91dGVyIHtcbiAgICAgICAgICAgIHRoaXMubW9kZSA9IG9wdGlvbnMgJiYgb3B0aW9ucy5tb2RlICYmIG9wdGlvbnMubW9kZSA9PT0gJ2hpc3RvcnknICYmICEhKGhpc3RvcnkucHVzaFN0YXRlKSA/ICdoaXN0b3J5JyA6ICdoYXNoJztcbiAgICAgICAgICAgIHRoaXMucm9vdCA9IG9wdGlvbnMgJiYgb3B0aW9ucy5yb290ICYmIG9wdGlvbnMucm9vdCA/ICcvJyArIHRoaXMuY2xlYXJTbGFzaGVzKG9wdGlvbnMucm9vdCkgKyAnLycgOiAnLyc7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7c3RyaW5nfSByb3V0ZT9cbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICBjaGVjayhyb3V0ZT86IHN0cmluZyk6IFJvdXRlciB7XG4gICAgICAgICAgICB2YXIgZnJhZ21lbnQgPSByb3V0ZSB8fCB0aGlzLmdldHBhdGhuYW1lKCk7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMucm91dGVzLmV2ZXJ5KChyLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIG1hdGNoID0gZnJhZ21lbnQubWF0Y2goci5yb3V0ZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2guc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgci5oYW5kbGVyLmFwcGx5KHt9LCBtYXRjaCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZXR1cm5zIHN0cmluZ1xuICAgICAgICAgKi9cbiAgICAgICAgZ2V0cGF0aG5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgICAgIHZhciBmcmFnbWVudCA9ICcnO1xuICAgICAgICAgICAgaWYgKHRoaXMubW9kZSA9PT0gJ2hpc3RvcnknKSB7XG4gICAgICAgICAgICAgICAgZnJhZ21lbnQgPSB0aGlzLmNsZWFyU2xhc2hlcyhkZWNvZGVVUkkobG9jYXRpb24ucGF0aG5hbWUgKyBsb2NhdGlvbi5zZWFyY2gpKTtcbiAgICAgICAgICAgICAgICBmcmFnbWVudCA9IGZyYWdtZW50LnJlcGxhY2UoL1xcPyguKikkLywgJycpO1xuICAgICAgICAgICAgICAgIGZyYWdtZW50ID0gdGhpcy5yb290ICE9ICcvJyA/IGZyYWdtZW50LnJlcGxhY2UodGhpcy5yb290LCAnJykgOiBmcmFnbWVudDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIG1hdGNoID0gd2luZG93LmxvY2F0aW9uLmhyZWYubWF0Y2goLyMoLiopJC8pO1xuICAgICAgICAgICAgICAgIGZyYWdtZW50ID0gbWF0Y2ggPyBtYXRjaFsxXSA6ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xlYXJTbGFzaGVzKGZyYWdtZW50KTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7KCk9PnZvaWR9IGhhbmRsZXJcbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICBhZGQoaGFuZGxlcjogKCkgPT4gdm9pZCk6IFJvdXRlcjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge1JlZ0V4cH0gcm91dGVcbiAgICAgICAgICogQHBhcmFtICB7KCk9PnZvaWR9IGhhbmRsZXJcbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICBhZGQocm91dGU6IFJlZ0V4cCwgaGFuZGxlcjogKCkgPT4gdm9pZCk6IFJvdXRlcjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge2FueX0gcGFyYW1cbiAgICAgICAgICogQHBhcmFtICB7KCk9PnZvaWR9IGhhbmRsZXI/XG4gICAgICAgICAqIEByZXR1cm5zIFJvdXRlclxuICAgICAgICAgKi9cbiAgICAgICAgYWRkKHBhcmFtOiBhbnksIGhhbmRsZXI/OiAoKSA9PiB2b2lkKTogUm91dGVyIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyYW0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvdXRlcy5wdXNoKHsgcm91dGU6IDxhbnk+JycsIGhhbmRsZXI6IHBhcmFtIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvdXRlcy5wdXNoKHsgcm91dGU6IHBhcmFtLCBoYW5kbGVyOiBoYW5kbGVyIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7KCk9PnZvaWR9IGhhbmRsZXJcbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICByZW1vdmUoaGFuZGxlcjogKCkgPT4gdm9pZCk6IFJvdXRlcjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge3N0cmluZ3xSZWdFeHB9IHJvdXRlXG4gICAgICAgICAqIEByZXR1cm5zIFJvdXRlclxuICAgICAgICAgKi9cbiAgICAgICAgcmVtb3ZlKHJvdXRlOiBzdHJpbmcgfCBSZWdFeHApOiBSb3V0ZXI7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHthbnl9IHBhcmFtXG4gICAgICAgICAqIEByZXR1cm5zIFJvdXRlclxuICAgICAgICAgKi9cbiAgICAgICAgcmVtb3ZlKHBhcmFtOiBhbnkpOiBSb3V0ZXIge1xuICAgICAgICAgICAgdGhpcy5yb3V0ZXMuZXZlcnkoKHJvdXRlLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJvdXRlLmhhbmRsZXIgPT09IHBhcmFtIHx8IHJvdXRlLnJvdXRlLnRvU3RyaW5nKCkgPT09IHBhcmFtLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yb3V0ZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBmbHVzaCgpOiBSb3V0ZXIge1xuICAgICAgICAgICAgdGhpcy5yb3V0ZXMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuY29uZmlnKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgbGlzdGVuKCk6IFJvdXRlciB7XG4gICAgICAgICAgICB2YXIgY3VycmVudCA9IHRoaXMuZ2V0cGF0aG5hbWUoKTtcblxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKTtcblxuICAgICAgICAgICAgdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudCAhPT0gdGhpcy5nZXRwYXRobmFtZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnQgPSB0aGlzLmdldHBhdGhuYW1lKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2soY3VycmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgNTApO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIG5hdmlnYXRlKCk6IFJvdXRlcjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge3N0cmluZ30gcm91dGVcbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICBuYXZpZ2F0ZShyb3V0ZTogc3RyaW5nKTogUm91dGVyO1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7c3RyaW5nfSByb3V0ZT9cbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICBuYXZpZ2F0ZShyb3V0ZT86IHN0cmluZyk6IFJvdXRlciB7XG4gICAgICAgICAgICByb3V0ZSA9IHJvdXRlIHx8ICcnO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5tb2RlID09PSAnaGlzdG9yeScpIHtcbiAgICAgICAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBudWxsLCB0aGlzLnJvb3QgKyB0aGlzLmNsZWFyU2xhc2hlcyhyb3V0ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZi5tYXRjaCgvIyguKikkLyk7XG4gICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZi5yZXBsYWNlKC8jKC4qKSQvLCAnJykgKyAnIycgKyByb3V0ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMvZ3JlZW5zb2NrL2dyZWVuc29jay5kLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy9qcXVlcnkvanF1ZXJ5LmQudHNcIiAvPlxuXG5cbm1vZHVsZSBjb21tb257XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIElWaWV3IHtcbiAgICAgICAgb3BlbigpOkpRdWVyeVByb21pc2U8e30+O1xuICAgICAgICBjbG9zZSgpOkpRdWVyeVByb21pc2U8e30+O1xuICAgICAgICBpc09wZW46Ym9vbGVhbjtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiSVZpZXcudHNcIiAvPlxuXG5tb2R1bGUgY29tbW9uIHtcblxuICAgIGltcG9ydCBJVmlldyA9IGNvbW1vbi5JVmlldztcblxuICAgIGV4cG9ydCBjbGFzcyBWaWV3TWFuYWdlciB7XG5cbiAgICAgICAgcHJpdmF0ZSB2aWV3czogQXJyYXk8SVZpZXc+ID0gW107XG4gICAgICAgIGN1cnJlbnRWaWV3OiBJVmlldyA9IG51bGw7XG5cbiAgICAgICAgYWRkVmlldyA9IChpZDogbnVtYmVyLCB2aWV3OiBJVmlldykgPT4ge1xuICAgICAgICAgICAgdGhpcy52aWV3c1tpZF0gPSB2aWV3O1xuICAgICAgICB9O1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7bnVtYmVyfSBpZFxuICAgICAgICAgKiBAcmV0dXJucyBJVmlld1xuICAgICAgICAgKi9cbiAgICAgICAgZ2V0Vmlld0J5SWQoaWQ6IG51bWJlcik6IElWaWV3IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZpZXdzW2lkXTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7bnVtYmVyfSBpZFxuICAgICAgICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAgICAgICAqL1xuICAgICAgICBpc1ZpZXdPcGVuKGlkOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFZpZXdCeUlkKGlkKS5pc09wZW47XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge251bWJlcn0gaWRcbiAgICAgICAgICogQHJldHVybnMgSlF1ZXJ5UHJvbWlzZVxuICAgICAgICAgKi9cbiAgICAgICAgY2xvc2VWaWV3KGlkOiBudW1iZXIpOiBKUXVlcnlQcm9taXNlPHt9PiB7XG4gICAgICAgICAgICB2YXIgdmlldyA9IHRoaXMuZ2V0Vmlld0J5SWQoaWQpO1xuICAgICAgICAgICAgdmlldy5pc09wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiB2aWV3LmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge251bWJlcn0gaWRcbiAgICAgICAgICogQHJldHVybnMgSlF1ZXJ5UHJvbWlzZVxuICAgICAgICAgKi9cbiAgICAgICAgb3BlblZpZXcgPSAoaWQ6IG51bWJlcik6IEpRdWVyeVByb21pc2U8e30+ID0+IHtcblxuICAgICAgICAgICAgdmFyIGRlZmVyID0gJC5EZWZlcnJlZCgpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50VmlldyAhPSBudWxsICYmICh0aGlzLmdldFZpZXdCeUlkKGlkKSA9PT0gdGhpcy5jdXJyZW50VmlldykpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGVmZXIgPSAkLkRlZmVycmVkKCk7XG4gICAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZSgpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVyLnByb21pc2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFZpZXcgIT0gbnVsbCkge1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFZpZXcuY2xvc2UoKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdGhpcy5nZXRWaWV3QnlJZChpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50Vmlldy5vcGVuKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdGhpcy5nZXRWaWV3QnlJZChpZCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50Vmlldy5vcGVuKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY2xvc2VDdXJyZW50VmlldyA9ICgpOiBKUXVlcnlQcm9taXNlPHt9PiA9PiB7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRWaWV3ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB2YXIgYWN0aXZlVmlldyA9IHRoaXMuY3VycmVudFZpZXc7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50VmlldyA9IG51bGw7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjdGl2ZVZpZXcuY2xvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICByZXNldCgpOiB2b2lkIHtcblxuICAgICAgICAgICAgdGhpcy5jdXJyZW50VmlldyA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJJVmlldy50c1wiIC8+XG5cbm1vZHVsZSBjb21tb24ge1xuXG4gICAgaW1wb3J0IElWaWV3ID0gY29tbW9uLklWaWV3O1xuICAgIFxuICAgIGV4cG9ydCBjbGFzcyBWaWV3IGltcGxlbWVudHMgSVZpZXcge1xuXG4gICAgICAgIHByaXZhdGUgX2lzT3BlbjogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBcbiAgICAgICAgcHJpdmF0ZSB0YXJnZXQ6c3RyaW5nO1xuICAgICAgICBwcml2YXRlICRyZXN1bHQ6SlF1ZXJ5O1xuICAgICAgICAvLyBwdWJsaWMgdGFyZ2V0OiBIVE1MRWxlbWVudDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcih0YXJnZXQ6c3RyaW5nLCAkcmVzdWx0OkpRdWVyeSkge1xuICAgICAgICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgICAgICAgICB0aGlzLiRyZXN1bHQgPSAkcmVzdWx0O1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0IGlzT3BlbigpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX2lzT3BlbjsgfVxuXG4gICAgICAgIG9wZW4oKTogSlF1ZXJ5UHJvbWlzZTx7fT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJvcGVuISEhXCIsIHRoaXMudGFyZ2V0LCB0aGlzLiRyZXN1bHQpXG4gICAgICAgICAgICB2YXIgZGVmZXIgPSAkLkRlZmVycmVkKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuJHJlc3VsdFxuICAgICAgICAgICAgICAgIC5sb2FkKHRoaXMudGFyZ2V0LCAoKT0+e1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pc09wZW4gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBUd2Vlbk1heC50byh0aGlzLiRyZXN1bHQsIC40NSwge2xlZnQ6IDAsIGVhc2U6IEN1YmljLmVhc2VJbiwgb25Db21wbGV0ZTogKCk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnRybyhkZWZlcik7XG4gICAgICAgICAgICAgICAgICAgIH19KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBkZWZlci5wcm9taXNlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjbG9zZSgpOiBKUXVlcnlQcm9taXNlPHt9PiB7XG4gICAgICAgICAgICB2YXIgZGVmZXIgPSAkLkRlZmVycmVkKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMudW5iaW5kKCk7XG4gICAgICAgICAgICB0aGlzLl9pc09wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgVHdlZW5NYXgudG8oIHRoaXMuJHJlc3VsdCwgLjQ1LCB7bGVmdDogXCItMTAwJVwiLCBlYXNlOiBDdWJpYy5lYXNlT3V0LCBvbkNvbXBsZXRlOigpPT57XG4gICAgICAgICAgICAgICAgdGhpcy4kcmVzdWx0LnNjcm9sbFRvcCgwKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlcGFydHVyZShkZWZlcik7IFxuICAgICAgICAgICAgfX0gKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZSgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7SlF1ZXJ5RGVmZXJyZWQ8e30+fSBkXG4gICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICovXG4gICAgICAgIHByb3RlY3RlZCBpbnRybyhkOiBKUXVlcnlEZWZlcnJlZDx7fT4pOiB2b2lkIHsgXG4gICAgICAgICAgICB0aGlzLmJpbmQoKTsgXG4gICAgICAgICAgICBkLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7SlF1ZXJ5RGVmZXJyZWQ8e30+fSBkXG4gICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICovXG4gICAgICAgIHByb3RlY3RlZCBkZXBhcnR1cmUoZDogSlF1ZXJ5RGVmZXJyZWQ8e30+KTogdm9pZCB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGQucmVzb2x2ZSgpOyBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYmluZCgpOnZvaWQgeyB9XG4gICAgICAgIHByb3RlY3RlZCB1bmJpbmQoKTp2b2lkIHsgfVxuICAgIH1cbn1cbiIsIm1vZHVsZSBjb21wb25lbnRzIHtcbiAgICBcbiAgICBleHBvcnQgY2xhc3MgTWFpbk1lbnUge1xuICAgICAgICBcbiAgICAgICAgcHJpdmF0ZSBidE1lbnU6IEpRdWVyeTtcbiAgICAgICAgcHJpdmF0ZSBidExpbmtzOiBKUXVlcnk7XG4gICAgICAgIHByaXZhdGUgY29udGFpbmVyOiBKUXVlcnk7XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIGlzT3BlbmVkOmJvb2xlYW47XG4gICAgICAgIFxuICAgICAgICBjb25zdHJ1Y3RvcihidDogSlF1ZXJ5LCBjb250YWluZXI6IEpRdWVyeSl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuYnRNZW51ID0gYnQ7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICAgICAgICAgIHRoaXMuYnRMaW5rcyA9ICQoXCJhLnB1c2hzdGF0ZVwiLCB0aGlzLmNvbnRhaW5lcik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuaXNPcGVuZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5iaW5kKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHByaXZhdGUgYmluZCgpOnZvaWR7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuYnRNZW51Lm9uKFwiY2xpY2tcIiwgdGhpcy50b29nbGVTdGF0ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMuYnRMaW5rcy5vbihcImNsaWNrXCIsIHRoaXMuY2xvc2UuYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHByaXZhdGUgdG9vZ2xlU3RhdGUoKTogdm9pZHtcbiAgICAgICAgICAgIGlmKHRoaXMuaXNPcGVuZWQpeyB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICB9ZWxzZXsgdGhpcy5vcGVuKCk7IH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHJpdmF0ZSBvcGVuKCk6dm9pZHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5pc09wZW5lZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmJ0TWVudS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIGNsb3NlKCk6dm9pZHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5pc09wZW5lZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5idE1lbnUucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZW5lYWJsZSgpOnZvaWR7XG4gICAgICAgICAgICB0aGlzLmJ0TWVudS5jc3Moe2xlZnQ6IFwiMFwifSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZGlzZWFibGUoKTp2b2lke1xuICAgICAgICAgICAgdGhpcy5idE1lbnUuY3NzKHtsZWZ0OiBcIi02MHB4XCJ9KTtcbiAgICAgICAgfVxuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vY29tbW9uL1ZpZXcudHNcIiAvPlxuXG5tb2R1bGUgdmlld3N7XG4gICAgXG4gICAgZXhwb3J0IGNsYXNzIEhvbWUgZXh0ZW5kcyBjb21tb24uVmlld3tcbiAgICAgICAgXG4gICAgICAgIGJpbmQoKTp2b2lkIHtcbiAgICAgICAgICAgIHZhciB0bCA9IG5ldyBUaW1lbGluZU1heCh7cGF1c2VkOiB0cnVlIH0pO1xuXHRcdFx0XG5cdFx0XHR0bC5zdGFnZ2VyVG8oW1wiI2MtMFwiLCBcIiNjLTFcIl0sIDAuNTUsIHsgYm9yZGVyUmFkaXVzOiBcIjBcIiwgd2lkdGg6IFwiNjAwcHhcIiwgaGVpZ2h0OiBcIjYwMHB4XCIsIG9wYWNpdHk6IDEgfSwgMC4yKTtcblx0XHRcdHRsLnRvKFtcIiNjLTBcIiwgXCIjYy0xXCJdLCAwLjE1LCB7IHdpZHRoOiBcIjEwMCVcIiwgaGVpZ2h0OiBcIjEwMCVcIiwgYmFja2dyb3VuZENvbG9yOiBcIiNERUQ0QjlcIiB9KTtcblxuXHRcdFx0dGwudG8oXCIjYy0yXCIsIDAuNSwgeyB4OiBcIjBcIiwgdHJhbnNmb3JtT3JpZ2luOiBcIi0zMDAlIC0xMDAlXCIgfSwgXCItPTAuMjVcIik7XG5cdFx0XHR0bC50byhcIiNjLTJcIiwgMC4yNSwgeyB5OiBcIi0xMDAlXCIsIHRyYW5zZm9ybU9yaWdpbjogXCItMzAwJSAtMTAwJVwiIH0sIFwiLT0wLjVcIik7XG5cdFx0XHR0bC50byhcIiNjLTJcIiwgMC4yNSwgeyB5OiBcIjUwcHhcIiwgdHJhbnNmb3JtT3JpZ2luOiBcIi0zMDAlIC0xMDAlXCIgfSwgXCItPTAuMjVcIik7XG5cdFx0XHR0bC50byhcIiNjLTJcIiwgMC4yNSwgeyB3aWR0aDogXCIxMHB4XCIsIGhlaWdodDogXCIxMHB4XCIsIHRyYW5zZm9ybU9yaWdpbjogXCIwIDBcIiB9KTtcblx0XHRcdHRsLnRvKFwiI2MtMlwiLCAwLjE1LCB7IHdpZHRoOiBcIjUwcHhcIiwgaGVpZ2h0OiBcIjUwcHhcIiwgZWFzZTogRWxhc3RpYy5lYXNlT3V0IH0pO1xuXHRcdFx0dGwudG8oXCIjYy0yXCIsIDAuMjUsIHsgeDogXCIxNTBweFwiIH0pO1xuXHRcdFx0dGwudG8oXCIjYy0yXCIsIDAuMjUsIHsgeDogXCIwXCIsIGVhc2U6IEVsYXN0aWMuZWFzZU91dCB9KTtcblx0XHRcdFxuXHRcdFx0dGwuc2V0KFwiI2MtM1wiLCB7IG9wYWNpdHk6IDEgfSwgXCItPTAuMjVcIik7XG5cdFx0XHR0bC50byhcIiNjLTNcIiwgMC41NSwgeyBzY2FsZTogMSwgeDogXCItMTUwcHhcIiwgZWFzZTogRWxhc3RpYy5lYXNlT3V0IH0sIFwiLT0wLjI1XCIpO1xuXHRcdFx0dGwudG8oXCIjYy0yXCIsIDAuMTUsIHsgeDogXCIyNXB4XCIsIGJhY2tncm91bmRDb2xvcjogXCIjNjRCNkIxXCIgfSk7XG5cdFx0XHR0bC50byhcIiNjLTNcIiwgMC4xNSwgeyB4OiBcIi0yNXB4XCIsIGJhY2tncm91bmRDb2xvcjogXCIjNjRCNkIxXCIgfSwgXCItPTAuMTVcIik7XG5cdFx0XHRcblx0XHRcdHRsLnRvKFwiI2MtMlwiLCAwLjE1LCB7IHg6IFwiMTI1cHhcIiB9KTtcblx0XHRcdHRsLnRvKFwiI2MtM1wiLCAwLjE1LCB7IHg6IFwiLTEyNXB4XCIgfSwgXCItPTAuMTVcIik7XG5cblx0XHRcdHRsLnRvKFwiI2MtMlwiLCAwLjg1LCB7IHg6IFwiNDVweFwiLCBlYXNlOiBDdWJpYy5lYXNlT3V0IH0pO1xuXHRcdFx0dGwudG8oXCIjYy0zXCIsIDAuODUsIHsgeDogXCItNDVweFwiLCBlYXNlOiBDdWJpYy5lYXNlT3V0IH0sIFwiLT0wLjg1XCIpO1xuXG5cdFx0XHR0bC50byhcIiNjLTJcIiwgMC4xNSwgeyB4OiBcIjEyNXB4XCIgfSk7XG5cdFx0XHR0bC50byhcIiNjLTNcIiwgMC4xNSwgeyB4OiBcIi0xMjVweFwiIH0sIFwiLT0wLjE1XCIpO1xuXG5cdFx0XHR0bC50byhcIiNjLTJcIiwgMC40NSwgeyB4OiBcIjI1cHhcIiwgZWFzZTogQ3ViaWMuZWFzZU91dCB9KTtcblx0XHRcdHRsLnRvKFwiI2MtM1wiLCAwLjQ1LCB7IHg6IFwiLTI1cHhcIiwgZWFzZTogQ3ViaWMuZWFzZU91dCB9LCBcIi09MC40NVwiKTtcblxuXHRcdFx0dGwudG8oXCIjYy0yXCIsIDAuMTUsIHsgeDogXCIxNDVweFwiIH0pO1xuXHRcdFx0dGwudG8oXCIjYy0zXCIsIDAuMTUsIHsgeDogXCItMTQ1cHhcIiB9LCBcIi09MC4xNVwiKTtcblxuXHRcdFx0dGwudG8oW1wiI2MtMlwiLCBcIiNjLTNcIl0sIDAuMTUsIHsgeDogXCIwXCIsIGVhc2U6IEN1YmljLmVhc2VJbiB9KTtcblx0XHRcdHRsLnRvKFtcIiNjLTJcIiwgXCIjYy0zXCJdLCAwLjM1LCB7IHdpZHRoOiBcIjgwcHhcIiwgaGVpZ2h0OiBcIjgwcHhcIiwgZWFzZTogRWxhc3RpYy5lYXNlT3V0IH0pO1xuXHRcdFx0dGwudG8oW1wiI2MtMlwiLCBcIiNjLTNcIl0sIDEuMjUsIHsgd2lkdGg6IFwiMTAwcHhcIiwgaGVpZ2h0OiBcIjEwMHB4XCIsIGRlbGF5OiAwLjA1LCBlYXNlOiBRdWFydC5lYXNlSW4gfSk7XG5cdFx0XHR0bC50byhbXCIjYy0yXCIsIFwiI2MtM1wiXSwgMC4yNSwgeyB3aWR0aDogXCIyMHB4XCIsIGhlaWdodDogXCIyMHB4XCIsIGRlbGF5OiAwLjA1LCBlYXNlOiBDdWJpYy5lYXNlT3V0IH0pO1xuXHRcdFx0dGwudG8oW1wiI2MtMlwiLCBcIiNjLTNcIl0sIDAuMTUsIHsgb3BhY2l0eTogMCwgd2lkdGg6IFwiMTUwcHhcIiwgaGVpZ2h0OiBcIjE1MHB4XCIsIGRlbGF5OiAwLjA1LCBlYXNlOiBFbGFzdGljLmVhc2VPdXQgfSk7XG5cbiAgICAgICAgICAgICQoXCIjYmxvY2stYWJvdXRcIilcbiAgICAgICAgICAgICAgICAub24oXCJtb3VzZWVudGVyXCIsICgpID0+IHsgdGwucGxheSgpOyB9KVxuICAgICAgICAgICAgICAgIC5vbihcIm1vdXNlbGVhdmVcIiwgKCkgPT4geyB0bC5zZWVrKDApOyB0bC5zdG9wKCk7IH0pO1xuICAgICAgICAgICAgJChcIiNibG9jay1ob21lXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7ICQodGhpcykudG9nZ2xlQ2xhc3MoXCJhY3RpdmVcIik7IH0pO1xuXHRcdFx0XG4gICAgICAgIH1cbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zL2dyZWVuc29jay9ncmVlbnNvY2suZC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMvanF1ZXJ5L2pxdWVyeS5kLnRzXCIgLz5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2NvbW1vbi9Sb3V0ZXIudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2NvbW1vbi9WaWV3TWFuYWdlci50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY29tbW9uL1ZpZXcudHNcIiAvPlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiY29tcG9uZW50cy9NYWluTWVudS50c1wiIC8+XG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ2aWV3cy9Ib21lLnRzXCIgLz5cblxubW9kdWxlIGluZGV4IHtcbiAgICBcbiAgICBpbXBvcnQgUm91dGVyID0gY29tbW9uLlJvdXRlcjtcbiAgICBpbXBvcnQgVmlld01hbmFnZXIgPSBjb21tb24uVmlld01hbmFnZXI7XG4gICAgaW1wb3J0IFZpZXcgPSBjb21tb24uVmlldztcbiAgICBcbiAgICBpbXBvcnQgTWFpbk1lbnUgPSBjb21wb25lbnRzLk1haW5NZW51O1xuICAgIFxuICAgIGltcG9ydCBIb21lVmlldyA9IHZpZXdzLkhvbWU7XG5cbiAgICBleHBvcnQgZW51bSBNYWluVmlld3Mge1xuICAgICAgICBIb21lVmlldyxcbiAgICAgICAgQWJvdXRNZVZpZXcsXG4gICAgICAgIFNvbWVDb2RlXG4gICAgfVxuXHRleHBvcnQgY2xhc3MgSW5kZXhBcHAge1xuXHRcdFxuICAgICAgICBwcml2YXRlIHJvdXRlcjpSb3V0ZXI7XG4gICAgICAgIHByaXZhdGUgdmlld01hbmFnZXI6Vmlld01hbmFnZXI7XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIG1haW5NZW51Ok1haW5NZW51O1xuICAgICAgICBcbiAgICAgICAgcHJpdmF0ZSBIb21lVmlldzpIb21lVmlldztcbiAgICAgICAgcHJpdmF0ZSBBYm91dE1lVmlldzpWaWV3O1xuICAgICAgICBwcml2YXRlIFNvbWVDb2RlOlZpZXc7XG4gICAgICAgIFxuXHRcdGNvbnN0cnVjdG9yICgpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5yb3V0ZXIgPSBuZXcgUm91dGVyKCk7XG4gICAgICAgICAgICB0aGlzLnZpZXdNYW5hZ2VyID0gbmV3IFZpZXdNYW5hZ2VyKCk7XG5cdFx0fVxuXG5cdFx0aW5pdCAoKTp2b2lkIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5tYWluTWVudSA9IG5ldyBNYWluTWVudSgkKFwiI2J1dHRvbi1tZW51XCIpLCAkKFwiI21haW4tbmF2aWdhdGlvblwiKSk7XG5cdFx0XHRcbiAgICAgICAgICAgIHZhciBtYWluQ29udGFpbmVyID0gJChcIiNtYWluLWNvbnRhaW5lclwiKTtcbiAgICAgICAgICAgIHRoaXMuSG9tZVZpZXcgPSBuZXcgSG9tZVZpZXcoXCIvaW5kZXguaHRtbCAjY29udGFpbmVyX19ob21lXCIsIG1haW5Db250YWluZXIgKTtcbiAgICAgICAgICAgIHRoaXMuQWJvdXRNZVZpZXcgPSBuZXcgVmlldyhcIi9hYm91dC1tZS9pbmRleC5odG1sICNjb250YWluZXJfX2Fib3V0bWVcIiwgbWFpbkNvbnRhaW5lciApO1xuICAgICAgICAgICAgdGhpcy5Tb21lQ29kZSA9IG5ldyBWaWV3KFwiL3NvbWUtY29kZS9pbmRleC5odG1sICNjb250YWluZXJfX3NvbWVjb2RlXCIsIG1haW5Db250YWluZXIgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy52aWV3TWFuYWdlci5hZGRWaWV3KE1haW5WaWV3cy5Ib21lVmlldywgdGhpcy5Ib21lVmlldyApO1xuICAgICAgICAgICAgdGhpcy52aWV3TWFuYWdlci5hZGRWaWV3KE1haW5WaWV3cy5BYm91dE1lVmlldywgdGhpcy5BYm91dE1lVmlldyApO1xuICAgICAgICAgICAgdGhpcy52aWV3TWFuYWdlci5hZGRWaWV3KE1haW5WaWV3cy5Tb21lQ29kZSwgdGhpcy5Tb21lQ29kZSApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBpc0ZpcnN0TG9hZCA9IHRydWU7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMucm91dGVyXG4gICAgICAgICAgICAgICAgLmFkZCgvYWJvdXQtbWUvLCAoKSA9PntcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYWluTWVudS5lbmVhYmxlKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmKGlzRmlyc3RMb2FkKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzRmlyc3RMb2FkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXdNYW5hZ2VyLmN1cnJlbnRWaWV3ID0gdGhpcy5BYm91dE1lVmlldztcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXdNYW5hZ2VyLm9wZW5WaWV3KE1haW5WaWV3cy5BYm91dE1lVmlldyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5hZGQoL3NvbWUtY29kZS8sICgpID0+e1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1haW5NZW51LmVuZWFibGUoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYoaXNGaXJzdExvYWQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNGaXJzdExvYWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmlld01hbmFnZXIuY3VycmVudFZpZXcgPSB0aGlzLlNvbWVDb2RlO1xuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmlld01hbmFnZXIub3BlblZpZXcoTWFpblZpZXdzLlNvbWVDb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmFkZCgoKSA9PntcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYWluTWVudS5kaXNlYWJsZSgpO1xuICAgICAgICAgICAgICAgICAgICBpZihpc0ZpcnN0TG9hZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc0ZpcnN0TG9hZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52aWV3TWFuYWdlci5jdXJyZW50VmlldyA9IHRoaXMuSG9tZVZpZXc7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLkhvbWVWaWV3LmJpbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXdNYW5hZ2VyLm9wZW5WaWV3KE1haW5WaWV3cy5Ib21lVmlldyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5saXN0ZW4oKTtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCJhLnB1c2hzdGF0ZVwiLCAoZTogSlF1ZXJ5RXZlbnRPYmplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUoJChlLmN1cnJlbnRUYXJnZXQpLmF0dHIoXCJocmVmXCIpKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB0aGlzLnJvdXRlci5jaGVjaygpO1xuICAgICAgICB9XG5cdH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiZGVmaW5pdGlvbnMvZ3JlZW5zb2NrL2dyZWVuc29jay5kLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJkZWZpbml0aW9ucy9qcXVlcnkvanF1ZXJ5LmQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImluZGV4L0luZGV4QXBwLnRzXCIgLz5cblxuaW1wb3J0IEluZGV4QXBwID0gaW5kZXguSW5kZXhBcHA7XG52YXIgYXBwOiBJbmRleEFwcDtcbiQoZnVuY3Rpb24oKSB7XG5cdFxuXHRhcHAgPSBuZXcgSW5kZXhBcHAoKTtcblx0YXBwLmluaXQoKTtcbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
