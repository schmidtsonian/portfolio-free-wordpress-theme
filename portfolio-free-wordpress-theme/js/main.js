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
/// <reference path="../definitions/greensock/greensock.d.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />
var common;
(function (common) {
    var Loader = (function () {
        function Loader() {
            this.container = '#js-main-container';
            this.result = $('#js-res');
            this.overlay = $('#js-overlay-loader');
            this.body = $('body');
        }
        Loader.prototype.load = function (path, onLoad) {
            var _this = this;
            this.body.css({ 'overflow': 'none' });
            this.body.scrollTop(0);
            TweenMax.set(this.overlay, { left: 0 });
            this.result.load(path + ' ' + this.container, function () {
                onLoad();
                TweenMax.to(_this.overlay, 0.25, {
                    left: '-100%',
                    onComplete: function () {
                        _this.body.css({ 'overflow': 'auto' });
                    }
                });
            });
        };
        return Loader;
    }());
    common.Loader = Loader;
})(common || (common = {}));
var components;
(function (components) {
    var MainMenu = (function () {
        function MainMenu(bt, container) {
            this.btMenu = bt;
            this.container = container;
            this.btLinks = $("a.page-load", this.container);
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
            // this.btMenu.css({left: "0"});
        };
        MainMenu.prototype.diseable = function () {
            // this.btMenu.css({left: "-60px"});
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
/// <reference path="../common/Loader.ts" />
/// <reference path="components/MainMenu.ts" />
/// <reference path="views/Home.ts" />
var index;
(function (index) {
    var Router = common.Router;
    var Loader = common.Loader;
    // import View = common.View;
    var MainMenu = components.MainMenu;
    // import HomeView = views.Home;
    (function (MainViews) {
    })(index.MainViews || (index.MainViews = {}));
    var MainViews = index.MainViews;
    var IndexApp = (function () {
        // private HomeView:HomeView;
        // private AboutMeView:View;
        // private SomeCode:View;
        function IndexApp() {
            this.router = new Router();
            // this.viewManager = new ViewManager();
            this.loader = new Loader();
        }
        IndexApp.prototype.init = function () {
            var _this = this;
            this.mainMenu = new MainMenu($("#js-main-header__button"), $("#js-main-header__nav"));
            $(document).on("click", "a.page-load", function (e) {
                e.preventDefault();
                var path = $(e.currentTarget).attr("href");
                _this.router.navigate(path);
            });
            this.router
                .add(function () {
                _this.loader.load(_this.router.getpathname(), function () { });
            })
                .listen();
            // this.router.check();
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
// $(function() {
// 	app = new IndexApp();
// 	app.init();
// });
(function ($) {
    app = new IndexApp();
    app.init();
})(jQuery);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9Sb3V0ZXIudHMiLCJjb21tb24vSVZpZXcudHMiLCJjb21tb24vVmlld01hbmFnZXIudHMiLCJjb21tb24vVmlldy50cyIsImNvbW1vbi9Mb2FkZXIudHMiLCJpbmRleC9jb21wb25lbnRzL01haW5NZW51LnRzIiwiaW5kZXgvdmlld3MvSG9tZS50cyIsImluZGV4L0luZGV4QXBwLnRzIiwibWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxJQUFPLE1BQU0sQ0FxTFo7QUFyTEQsV0FBTyxNQUFNLEVBQUMsQ0FBQztJQVlYO1FBT0k7WUFDSSxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxpQkFBaUI7UUFDdkQsQ0FBQztRQUVPLDZCQUFZLEdBQXBCLFVBQXFCLElBQVk7WUFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUdQOzs7V0FHRztRQUVHOzs7V0FHRztRQUNILHVCQUFNLEdBQU4sVUFBTyxPQUF3QjtZQUMzQixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxTQUFTLEdBQUcsTUFBTSxDQUFDO1lBQ2hILElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxH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RCxDQXJDQSxBQXFDQyxJQUFBO0lBckNZLGNBQVEsV0FxQ3BCLENBQUE7QUFDRixDQUFDLEVBdERNLEtBQUssS0FBTCxLQUFLLFFBc0RYO0FDbEVELDZEQUE2RDtBQUM3RCx1REFBdUQ7QUFDdkQsMENBQTBDO0FBRTFDLElBQU8sUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7QUFDakMsSUFBSSxHQUFhLENBQUM7QUFDbEIsaUJBQWlCO0FBRWpCLHlCQUF5QjtBQUN6QixlQUFlO0FBQ2YsTUFBTTtBQUdOLENBQUMsVUFBUyxDQUFNO0lBQ1osR0FBRyxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7SUFDeEIsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ1osQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRnJvbSBoZXJlOlxuICogaHR0cDovL2tyYXNpbWlydHNvbmV2LmNvbS9ibG9nL2FydGljbGUvQS1tb2Rlcm4tSmF2YVNjcmlwdC1yb3V0ZXItaW4tMTAwLWxpbmVzLWhpc3RvcnktYXBpLXB1c2hTdGF0ZS1oYXNoLXVybFxuICovXG5cbm1vZHVsZSBjb21tb24ge1xuXG4gICAgZXhwb3J0IGludGVyZmFjZSBJUm91dGVyT3B0aW9ucyB7XG4gICAgICAgIG1vZGU/OiBzdHJpbmc7XG4gICAgICAgIHJvb3Q/OiBzdHJpbmc7XG4gICAgfVxuXG4gICAgaW50ZXJmYWNlIElSb3V0ZXJBZGRBcmdzIHtcbiAgICAgICAgcm91dGU6IFJlZ0V4cDtcbiAgICAgICAgaGFuZGxlcjogKCkgPT4gdm9pZDtcbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3MgUm91dGVyIHtcblxuICAgICAgICBwcml2YXRlIG1vZGU6IHN0cmluZztcbiAgICAgICAgcHJpdmF0ZSByb290OiBzdHJpbmc7XG4gICAgICAgIHByaXZhdGUgcm91dGVzOiBJUm91dGVyQWRkQXJnc1tdO1xuXG4gICAgICAgIHByaXZhdGUgaW50ZXJ2YWw6IG51bWJlcjtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICB0aGlzLnJvdXRlcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5jb25maWcoeyBtb2RlOiAnaGlzdG9yeScgfSk7IC8vIERlZmF1bHQgQ29uZmlnXG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIGNsZWFyU2xhc2hlcyhwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICAgICAgcmV0dXJuIHBhdGgudG9TdHJpbmcoKS5yZXBsYWNlKC9cXC8kLywgJycpLnJlcGxhY2UoL15cXC8vLCAnJyk7XG4gICAgICAgIH1cblxuXG5cdFx0LyoqXG5cdFx0ICogUFVCTElDIEFQSVxuXHRcdCAqID09PT09PT09PT1cblx0XHQgKi9cbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHtJUm91dGVyT3B0aW9uc30gb3B0aW9ucz9cbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICBjb25maWcob3B0aW9ucz86IElSb3V0ZXJPcHRpb25zKTogUm91dGVyIHtcbiAgICAgICAgICAgIHRoaXMubW9kZSA9IG9wdGlvbnMgJiYgb3B0aW9ucy5tb2RlICYmIG9wdGlvbnMubW9kZSA9PT0gJ2hpc3RvcnknICYmICEhKGhpc3RvcnkucHVzaFN0YXRlKSA/ICdoaXN0b3J5JyA6ICdoYXNoJztcbiAgICAgICAgICAgIHRoaXMucm9vdCA9IG9wdGlvbnMgJiYgb3B0aW9ucy5yb290ICYmIG9wdGlvbnMucm9vdCA/ICcvJyArIHRoaXMuY2xlYXJTbGFzaGVzKG9wdGlvbnMucm9vdCkgKyAnLycgOiAnLyc7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7c3RyaW5nfSByb3V0ZT9cbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICBjaGVjayhyb3V0ZT86IHN0cmluZyk6IFJvdXRlciB7XG4gICAgICAgICAgICB2YXIgZnJhZ21lbnQgPSByb3V0ZSB8fCB0aGlzLmdldHBhdGhuYW1lKCk7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMucm91dGVzLmV2ZXJ5KChyLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIG1hdGNoID0gZnJhZ21lbnQubWF0Y2goci5yb3V0ZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2guc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgci5oYW5kbGVyLmFwcGx5KHt9LCBtYXRjaCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZXR1cm5zIHN0cmluZ1xuICAgICAgICAgKi9cbiAgICAgICAgZ2V0cGF0aG5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgICAgIHZhciBmcmFnbWVudCA9ICcnO1xuICAgICAgICAgICAgaWYgKHRoaXMubW9kZSA9PT0gJ2hpc3RvcnknKSB7XG4gICAgICAgICAgICAgICAgZnJhZ21lbnQgPSB0aGlzLmNsZWFyU2xhc2hlcyhkZWNvZGVVUkkobG9jYXRpb24ucGF0aG5hbWUgKyBsb2NhdGlvbi5zZWFyY2gpKTtcbiAgICAgICAgICAgICAgICBmcmFnbWVudCA9IGZyYWdtZW50LnJlcGxhY2UoL1xcPyguKikkLywgJycpO1xuICAgICAgICAgICAgICAgIGZyYWdtZW50ID0gdGhpcy5yb290ICE9ICcvJyA/IGZyYWdtZW50LnJlcGxhY2UodGhpcy5yb290LCAnJykgOiBmcmFnbWVudDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIG1hdGNoID0gd2luZG93LmxvY2F0aW9uLmhyZWYubWF0Y2goLyMoLiopJC8pO1xuICAgICAgICAgICAgICAgIGZyYWdtZW50ID0gbWF0Y2ggPyBtYXRjaFsxXSA6ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xlYXJTbGFzaGVzKGZyYWdtZW50KTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7KCk9PnZvaWR9IGhhbmRsZXJcbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICBhZGQoaGFuZGxlcjogKCkgPT4gdm9pZCk6IFJvdXRlcjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge1JlZ0V4cH0gcm91dGVcbiAgICAgICAgICogQHBhcmFtICB7KCk9PnZvaWR9IGhhbmRsZXJcbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICBhZGQocm91dGU6IFJlZ0V4cCwgaGFuZGxlcjogKCkgPT4gdm9pZCk6IFJvdXRlcjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge2FueX0gcGFyYW1cbiAgICAgICAgICogQHBhcmFtICB7KCk9PnZvaWR9IGhhbmRsZXI/XG4gICAgICAgICAqIEByZXR1cm5zIFJvdXRlclxuICAgICAgICAgKi9cbiAgICAgICAgYWRkKHBhcmFtOiBhbnksIGhhbmRsZXI/OiAoKSA9PiB2b2lkKTogUm91dGVyIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyYW0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvdXRlcy5wdXNoKHsgcm91dGU6IDxhbnk+JycsIGhhbmRsZXI6IHBhcmFtIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvdXRlcy5wdXNoKHsgcm91dGU6IHBhcmFtLCBoYW5kbGVyOiBoYW5kbGVyIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7KCk9PnZvaWR9IGhhbmRsZXJcbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICByZW1vdmUoaGFuZGxlcjogKCkgPT4gdm9pZCk6IFJvdXRlcjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge3N0cmluZ3xSZWdFeHB9IHJvdXRlXG4gICAgICAgICAqIEByZXR1cm5zIFJvdXRlclxuICAgICAgICAgKi9cbiAgICAgICAgcmVtb3ZlKHJvdXRlOiBzdHJpbmcgfCBSZWdFeHApOiBSb3V0ZXI7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHthbnl9IHBhcmFtXG4gICAgICAgICAqIEByZXR1cm5zIFJvdXRlclxuICAgICAgICAgKi9cbiAgICAgICAgcmVtb3ZlKHBhcmFtOiBhbnkpOiBSb3V0ZXIge1xuICAgICAgICAgICAgdGhpcy5yb3V0ZXMuZXZlcnkoKHJvdXRlLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJvdXRlLmhhbmRsZXIgPT09IHBhcmFtIHx8IHJvdXRlLnJvdXRlLnRvU3RyaW5nKCkgPT09IHBhcmFtLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yb3V0ZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBmbHVzaCgpOiBSb3V0ZXIge1xuICAgICAgICAgICAgdGhpcy5yb3V0ZXMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuY29uZmlnKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgbGlzdGVuKCk6IFJvdXRlciB7XG4gICAgICAgICAgICB2YXIgY3VycmVudCA9IHRoaXMuZ2V0cGF0aG5hbWUoKTtcblxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKTtcblxuICAgICAgICAgICAgdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudCAhPT0gdGhpcy5nZXRwYXRobmFtZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnQgPSB0aGlzLmdldHBhdGhuYW1lKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2soY3VycmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgNTApO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIG5hdmlnYXRlKCk6IFJvdXRlcjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge3N0cmluZ30gcm91dGVcbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICBuYXZpZ2F0ZShyb3V0ZTogc3RyaW5nKTogUm91dGVyO1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7c3RyaW5nfSByb3V0ZT9cbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICBuYXZpZ2F0ZShyb3V0ZT86IHN0cmluZyk6IFJvdXRlciB7XG4gICAgICAgICAgICByb3V0ZSA9IHJvdXRlIHx8ICcnO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5tb2RlID09PSAnaGlzdG9yeScpIHtcbiAgICAgICAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBudWxsLCB0aGlzLnJvb3QgKyB0aGlzLmNsZWFyU2xhc2hlcyhyb3V0ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZi5tYXRjaCgvIyguKikkLyk7XG4gICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZi5yZXBsYWNlKC8jKC4qKSQvLCAnJykgKyAnIycgKyByb3V0ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMvZ3JlZW5zb2NrL2dyZWVuc29jay5kLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy9qcXVlcnkvanF1ZXJ5LmQudHNcIiAvPlxuXG5cbm1vZHVsZSBjb21tb257XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIElWaWV3IHtcbiAgICAgICAgb3BlbigpOkpRdWVyeVByb21pc2U8e30+O1xuICAgICAgICBjbG9zZSgpOkpRdWVyeVByb21pc2U8e30+O1xuICAgICAgICBpc09wZW46Ym9vbGVhbjtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiSVZpZXcudHNcIiAvPlxuXG5tb2R1bGUgY29tbW9uIHtcblxuICAgIGltcG9ydCBJVmlldyA9IGNvbW1vbi5JVmlldztcblxuICAgIGV4cG9ydCBjbGFzcyBWaWV3TWFuYWdlciB7XG5cbiAgICAgICAgcHJpdmF0ZSB2aWV3czogQXJyYXk8SVZpZXc+ID0gW107XG4gICAgICAgIGN1cnJlbnRWaWV3OiBJVmlldyA9IG51bGw7XG5cbiAgICAgICAgYWRkVmlldyA9IChpZDogbnVtYmVyLCB2aWV3OiBJVmlldykgPT4ge1xuICAgICAgICAgICAgdGhpcy52aWV3c1tpZF0gPSB2aWV3O1xuICAgICAgICB9O1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7bnVtYmVyfSBpZFxuICAgICAgICAgKiBAcmV0dXJucyBJVmlld1xuICAgICAgICAgKi9cbiAgICAgICAgZ2V0Vmlld0J5SWQoaWQ6IG51bWJlcik6IElWaWV3IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZpZXdzW2lkXTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7bnVtYmVyfSBpZFxuICAgICAgICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAgICAgICAqL1xuICAgICAgICBpc1ZpZXdPcGVuKGlkOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFZpZXdCeUlkKGlkKS5pc09wZW47XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge251bWJlcn0gaWRcbiAgICAgICAgICogQHJldHVybnMgSlF1ZXJ5UHJvbWlzZVxuICAgICAgICAgKi9cbiAgICAgICAgY2xvc2VWaWV3KGlkOiBudW1iZXIpOiBKUXVlcnlQcm9taXNlPHt9PiB7XG4gICAgICAgICAgICB2YXIgdmlldyA9IHRoaXMuZ2V0Vmlld0J5SWQoaWQpO1xuICAgICAgICAgICAgdmlldy5pc09wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgIHJldHVybiB2aWV3LmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge251bWJlcn0gaWRcbiAgICAgICAgICogQHJldHVybnMgSlF1ZXJ5UHJvbWlzZVxuICAgICAgICAgKi9cbiAgICAgICAgb3BlblZpZXcgPSAoaWQ6IG51bWJlcik6IEpRdWVyeVByb21pc2U8e30+ID0+IHtcblxuICAgICAgICAgICAgdmFyIGRlZmVyID0gJC5EZWZlcnJlZCgpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50VmlldyAhPSBudWxsICYmICh0aGlzLmdldFZpZXdCeUlkKGlkKSA9PT0gdGhpcy5jdXJyZW50VmlldykpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGVmZXIgPSAkLkRlZmVycmVkKCk7XG4gICAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZSgpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVyLnByb21pc2UoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFZpZXcgIT0gbnVsbCkge1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFZpZXcuY2xvc2UoKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdGhpcy5nZXRWaWV3QnlJZChpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50Vmlldy5vcGVuKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gdGhpcy5nZXRWaWV3QnlJZChpZCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50Vmlldy5vcGVuKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY2xvc2VDdXJyZW50VmlldyA9ICgpOiBKUXVlcnlQcm9taXNlPHt9PiA9PiB7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRWaWV3ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB2YXIgYWN0aXZlVmlldyA9IHRoaXMuY3VycmVudFZpZXc7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50VmlldyA9IG51bGw7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjdGl2ZVZpZXcuY2xvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICByZXNldCgpOiB2b2lkIHtcblxuICAgICAgICAgICAgdGhpcy5jdXJyZW50VmlldyA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJJVmlldy50c1wiIC8+XG5cbm1vZHVsZSBjb21tb24ge1xuXG4gICAgaW1wb3J0IElWaWV3ID0gY29tbW9uLklWaWV3O1xuICAgIFxuICAgIGV4cG9ydCBjbGFzcyBWaWV3IGltcGxlbWVudHMgSVZpZXcge1xuXG4gICAgICAgIHByaXZhdGUgX2lzT3BlbjogYm9vbGVhbiA9IGZhbHNlO1xuICAgICAgICBcbiAgICAgICAgcHJpdmF0ZSB0YXJnZXQ6c3RyaW5nO1xuICAgICAgICBwcml2YXRlICRyZXN1bHQ6SlF1ZXJ5O1xuICAgICAgICAvLyBwdWJsaWMgdGFyZ2V0OiBIVE1MRWxlbWVudDtcblxuICAgICAgICBjb25zdHJ1Y3Rvcih0YXJnZXQ6c3RyaW5nLCAkcmVzdWx0OkpRdWVyeSkge1xuICAgICAgICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgICAgICAgICB0aGlzLiRyZXN1bHQgPSAkcmVzdWx0O1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0IGlzT3BlbigpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX2lzT3BlbjsgfVxuXG4gICAgICAgIG9wZW4oKTogSlF1ZXJ5UHJvbWlzZTx7fT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJvcGVuISEhXCIsIHRoaXMudGFyZ2V0LCB0aGlzLiRyZXN1bHQpXG4gICAgICAgICAgICB2YXIgZGVmZXIgPSAkLkRlZmVycmVkKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuJHJlc3VsdFxuICAgICAgICAgICAgICAgIC5sb2FkKHRoaXMudGFyZ2V0LCAoKT0+e1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pc09wZW4gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBUd2Vlbk1heC50byh0aGlzLiRyZXN1bHQsIC40NSwge2xlZnQ6IDAsIGVhc2U6IEN1YmljLmVhc2VJbiwgb25Db21wbGV0ZTogKCk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnRybyhkZWZlcik7XG4gICAgICAgICAgICAgICAgICAgIH19KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBkZWZlci5wcm9taXNlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjbG9zZSgpOiBKUXVlcnlQcm9taXNlPHt9PiB7XG4gICAgICAgICAgICB2YXIgZGVmZXIgPSAkLkRlZmVycmVkKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMudW5iaW5kKCk7XG4gICAgICAgICAgICB0aGlzLl9pc09wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgVHdlZW5NYXgudG8oIHRoaXMuJHJlc3VsdCwgLjQ1LCB7bGVmdDogXCItMTAwJVwiLCBlYXNlOiBDdWJpYy5lYXNlT3V0LCBvbkNvbXBsZXRlOigpPT57XG4gICAgICAgICAgICAgICAgdGhpcy4kcmVzdWx0LnNjcm9sbFRvcCgwKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRlcGFydHVyZShkZWZlcik7IFxuICAgICAgICAgICAgfX0gKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZSgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7SlF1ZXJ5RGVmZXJyZWQ8e30+fSBkXG4gICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICovXG4gICAgICAgIHByb3RlY3RlZCBpbnRybyhkOiBKUXVlcnlEZWZlcnJlZDx7fT4pOiB2b2lkIHsgXG4gICAgICAgICAgICB0aGlzLmJpbmQoKTsgXG4gICAgICAgICAgICBkLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7SlF1ZXJ5RGVmZXJyZWQ8e30+fSBkXG4gICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICovXG4gICAgICAgIHByb3RlY3RlZCBkZXBhcnR1cmUoZDogSlF1ZXJ5RGVmZXJyZWQ8e30+KTogdm9pZCB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGQucmVzb2x2ZSgpOyBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYmluZCgpOnZvaWQgeyB9XG4gICAgICAgIHByb3RlY3RlZCB1bmJpbmQoKTp2b2lkIHsgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy9ncmVlbnNvY2svZ3JlZW5zb2NrLmQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zL2pxdWVyeS9qcXVlcnkuZC50c1wiIC8+XG5cbm1vZHVsZSBjb21tb257XG4gICAgXG4gICAgZXhwb3J0IGNsYXNzIExvYWRlciB7XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIGNvbnRhaW5lcjogc3RyaW5nO1xuICAgICAgICBcbiAgICAgICAgcHJpdmF0ZSByZXN1bHQ6IEpRdWVyeTtcbiAgICAgICAgcHJpdmF0ZSBvdmVybGF5OiBKUXVlcnk7XG4gICAgICAgIHByaXZhdGUgYm9keTogSlF1ZXJ5O1xuICAgICAgICBcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyID0gJyNqcy1tYWluLWNvbnRhaW5lcic7XG4gICAgICAgICAgICB0aGlzLnJlc3VsdCA9ICQoICcjanMtcmVzJyApO1xuICAgICAgICAgICAgdGhpcy5vdmVybGF5ID0gJCggJyNqcy1vdmVybGF5LWxvYWRlcicgKTtcbiAgICAgICAgICAgIHRoaXMuYm9keSA9ICQoICdib2R5JyApO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBsb2FkICggcGF0aDogc3RyaW5nLCBvbkxvYWQ6IEZ1bmN0aW9uICkgOiB2b2lkIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5ib2R5LmNzcyggeyAnb3ZlcmZsb3cnOiAnbm9uZScgfSApO1xuICAgICAgICAgICAgdGhpcy5ib2R5LnNjcm9sbFRvcCggMCApO1xuICAgICAgICAgICAgVHdlZW5NYXguc2V0KCB0aGlzLm92ZXJsYXksIHsgbGVmdDogMCB9ICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMucmVzdWx0LmxvYWQoIHBhdGggKyAnICcgKyB0aGlzLmNvbnRhaW5lciwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIG9uTG9hZCgpO1xuICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnRvKCB0aGlzLm92ZXJsYXksIDAuMjUsIHtcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogJy0xMDAlJywgXG4gICAgICAgICAgICAgICAgICAgIG9uQ29tcGxldGU6ICgpID0+ICB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ib2R5LmNzcyggeyAnb3ZlcmZsb3cnOiAnYXV0bycgfSApO1xuICAgICAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgfVxufSIsIm1vZHVsZSBjb21wb25lbnRzIHtcbiAgICBcbiAgICBleHBvcnQgY2xhc3MgTWFpbk1lbnUge1xuICAgICAgICBcbiAgICAgICAgcHJpdmF0ZSBidE1lbnU6IEpRdWVyeTtcbiAgICAgICAgcHJpdmF0ZSBidExpbmtzOiBKUXVlcnk7XG4gICAgICAgIHByaXZhdGUgY29udGFpbmVyOiBKUXVlcnk7XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIGlzT3BlbmVkOmJvb2xlYW47XG4gICAgICAgIFxuICAgICAgICBjb25zdHJ1Y3RvcihidDogSlF1ZXJ5LCBjb250YWluZXI6IEpRdWVyeSl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuYnRNZW51ID0gYnQ7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICAgICAgICAgIHRoaXMuYnRMaW5rcyA9ICQoXCJhLnBhZ2UtbG9hZFwiLCB0aGlzLmNvbnRhaW5lcik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuaXNPcGVuZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5iaW5kKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHByaXZhdGUgYmluZCgpOnZvaWR7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuYnRNZW51Lm9uKFwiY2xpY2tcIiwgdGhpcy50b29nbGVTdGF0ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIHRoaXMuYnRMaW5rcy5vbihcImNsaWNrXCIsIHRoaXMuY2xvc2UuYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHByaXZhdGUgdG9vZ2xlU3RhdGUoKTogdm9pZHtcbiAgICAgICAgICAgIGlmKHRoaXMuaXNPcGVuZWQpeyB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICB9ZWxzZXsgdGhpcy5vcGVuKCk7IH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHJpdmF0ZSBvcGVuKCk6dm9pZHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5pc09wZW5lZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmJ0TWVudS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIGNsb3NlKCk6dm9pZHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5pc09wZW5lZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5idE1lbnUucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZW5lYWJsZSgpOnZvaWR7XG4gICAgICAgICAgICAvLyB0aGlzLmJ0TWVudS5jc3Moe2xlZnQ6IFwiMFwifSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZGlzZWFibGUoKTp2b2lke1xuICAgICAgICAgICAgLy8gdGhpcy5idE1lbnUuY3NzKHtsZWZ0OiBcIi02MHB4XCJ9KTtcbiAgICAgICAgfVxuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vY29tbW9uL1ZpZXcudHNcIiAvPlxuXG5tb2R1bGUgdmlld3N7XG4gICAgXG4gICAgZXhwb3J0IGNsYXNzIEhvbWUgZXh0ZW5kcyBjb21tb24uVmlld3tcbiAgICAgICAgXG4gICAgICAgIGJpbmQoKTp2b2lkIHtcbiAgICAgICAgfVxuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMvZ3JlZW5zb2NrL2dyZWVuc29jay5kLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy9qcXVlcnkvanF1ZXJ5LmQudHNcIiAvPlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY29tbW9uL1JvdXRlci50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY29tbW9uL1ZpZXdNYW5hZ2VyLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9jb21tb24vVmlldy50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY29tbW9uL0xvYWRlci50c1wiIC8+XG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJjb21wb25lbnRzL01haW5NZW51LnRzXCIgLz5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInZpZXdzL0hvbWUudHNcIiAvPlxuXG5tb2R1bGUgaW5kZXgge1xuICAgIFxuICAgIGltcG9ydCBSb3V0ZXIgPSBjb21tb24uUm91dGVyO1xuICAgIGltcG9ydCBWaWV3TWFuYWdlciA9IGNvbW1vbi5WaWV3TWFuYWdlcjtcbiAgICBpbXBvcnQgTG9hZGVyID0gY29tbW9uLkxvYWRlcjtcbiAgICAvLyBpbXBvcnQgVmlldyA9IGNvbW1vbi5WaWV3O1xuICAgIFxuICAgIGltcG9ydCBNYWluTWVudSA9IGNvbXBvbmVudHMuTWFpbk1lbnU7XG4gICAgXG4gICAgLy8gaW1wb3J0IEhvbWVWaWV3ID0gdmlld3MuSG9tZTtcblxuICAgIGV4cG9ydCBlbnVtIE1haW5WaWV3cyB7XG4gICAgICAgIC8vIEhvbWVWaWV3LFxuICAgICAgICAvLyBBYm91dE1lVmlldyxcbiAgICAgICAgLy8gU29tZUNvZGVcbiAgICB9XG5cdGV4cG9ydCBjbGFzcyBJbmRleEFwcCB7XG5cdFx0XG4gICAgICAgIHByaXZhdGUgcm91dGVyOlJvdXRlcjtcbiAgICAgICAgLy8gcHJpdmF0ZSB2aWV3TWFuYWdlcjpWaWV3TWFuYWdlcjtcbiAgICAgICAgcHJpdmF0ZSBsb2FkZXI6TG9hZGVyO1xuICAgICAgICBcbiAgICAgICAgcHJpdmF0ZSBtYWluTWVudTpNYWluTWVudTtcbiAgICAgICAgXG4gICAgICAgIC8vIHByaXZhdGUgSG9tZVZpZXc6SG9tZVZpZXc7XG4gICAgICAgIC8vIHByaXZhdGUgQWJvdXRNZVZpZXc6VmlldztcbiAgICAgICAgLy8gcHJpdmF0ZSBTb21lQ29kZTpWaWV3O1xuICAgICAgICBcblx0XHRjb25zdHJ1Y3RvciAoKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMucm91dGVyID0gbmV3IFJvdXRlcigpO1xuICAgICAgICAgICAgLy8gdGhpcy52aWV3TWFuYWdlciA9IG5ldyBWaWV3TWFuYWdlcigpO1xuICAgICAgICAgICAgdGhpcy5sb2FkZXIgPSBuZXcgTG9hZGVyKCk7XG5cdFx0fVxuXG5cdFx0aW5pdCAoKTp2b2lkIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5tYWluTWVudSA9IG5ldyBNYWluTWVudSgkKFwiI2pzLW1haW4taGVhZGVyX19idXR0b25cIiksICQoXCIjanMtbWFpbi1oZWFkZXJfX25hdlwiKSk7XG5cdFx0XHRcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCJhLnBhZ2UtbG9hZFwiLCAoZTogSlF1ZXJ5RXZlbnRPYmplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgdmFyIHBhdGggPSAkKGUuY3VycmVudFRhcmdldCkuYXR0cihcImhyZWZcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUocGF0aCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5yb3V0ZXJcbiAgICAgICAgICAgICAgICAuYWRkKCgpPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvYWRlci5sb2FkKHRoaXMucm91dGVyLmdldHBhdGhuYW1lKCksICgpID0+IHsgIH0gKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5saXN0ZW4oKTtcbiAgICAgICAgICAgIC8vIHRoaXMucm91dGVyLmNoZWNrKCk7XG4gICAgICAgIH1cblx0fVxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJkZWZpbml0aW9ucy9ncmVlbnNvY2svZ3JlZW5zb2NrLmQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImRlZmluaXRpb25zL2pxdWVyeS9qcXVlcnkuZC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiaW5kZXgvSW5kZXhBcHAudHNcIiAvPlxuXG5pbXBvcnQgSW5kZXhBcHAgPSBpbmRleC5JbmRleEFwcDtcbnZhciBhcHA6IEluZGV4QXBwO1xuLy8gJChmdW5jdGlvbigpIHtcblx0XG4vLyBcdGFwcCA9IG5ldyBJbmRleEFwcCgpO1xuLy8gXHRhcHAuaW5pdCgpO1xuLy8gfSk7XG5cblxuKGZ1bmN0aW9uKCQ6IGFueSkge1xuICAgIGFwcCA9IG5ldyBJbmRleEFwcCgpO1xuXHRhcHAuaW5pdCgpOyBcbn0pKGpRdWVyeSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
