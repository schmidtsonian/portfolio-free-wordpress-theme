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
    var ViewManager = common.ViewManager;
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
            this.viewManager = new ViewManager();
            this.loader = new Loader();
        }
        IndexApp.prototype.init = function () {
            var _this = this;
            this.mainMenu = new MainMenu($("#js-main-header__button"), $("#js-main-header__nav"));
            $(document).on("click", "a.page-load", function (e) {
                e.preventDefault();
                var path = $(e.currentTarget).attr("href");
                _this.loader.load(path, function () { _this.router.navigate(path); });
            });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9Sb3V0ZXIudHMiLCJjb21tb24vSVZpZXcudHMiLCJjb21tb24vVmlld01hbmFnZXIudHMiLCJjb21tb24vVmlldy50cyIsImNvbW1vbi9Mb2FkZXIudHMiLCJpbmRleC9jb21wb25lbnRzL01haW5NZW51LnRzIiwiaW5kZXgvdmlld3MvSG9tZS50cyIsImluZGV4L0luZGV4QXBwLnRzIiwibWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxJQUFPLE1BQU0sQ0FxTFo7QUFyTEQsV0FBTyxNQUFNLEVBQUMsQ0FBQztJQVlYO1FBT0k7WUFDSSxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxpQkFBaUI7UUFDdkQsQ0FBQztRQUVPLDZCQUFZLEdBQXBCLFVBQXFCLElBQVk7WUFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUdQOzs7V0FHRztRQUVHOzs7V0FHRztRQUNILHVCQUFNLEdBQU4sVUFBTyxPQUF3QjtZQUMzQixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxTQUFTLEdBQUcsTUFBTSxDQUFDO1lBQ2hILElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxH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QUFRLFdBK0JwQixDQUFBO0FBQ0YsQ0FBQyxFQWhETSxLQUFLLEtBQUwsS0FBSyxRQWdEWDtBQzVERCw2REFBNkQ7QUFDN0QsdURBQXVEO0FBQ3ZELDBDQUEwQztBQUUxQyxJQUFPLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO0FBQ2pDLElBQUksR0FBYSxDQUFDO0FBQ2xCLGlCQUFpQjtBQUVqQix5QkFBeUI7QUFDekIsZUFBZTtBQUNmLE1BQU07QUFHTixDQUFDLFVBQVMsQ0FBTTtJQUNaLEdBQUcsR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFDO0lBQ3hCLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNaLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEZyb20gaGVyZTpcbiAqIGh0dHA6Ly9rcmFzaW1pcnRzb25ldi5jb20vYmxvZy9hcnRpY2xlL0EtbW9kZXJuLUphdmFTY3JpcHQtcm91dGVyLWluLTEwMC1saW5lcy1oaXN0b3J5LWFwaS1wdXNoU3RhdGUtaGFzaC11cmxcbiAqL1xuXG5tb2R1bGUgY29tbW9uIHtcblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSVJvdXRlck9wdGlvbnMge1xuICAgICAgICBtb2RlPzogc3RyaW5nO1xuICAgICAgICByb290Pzogc3RyaW5nO1xuICAgIH1cblxuICAgIGludGVyZmFjZSBJUm91dGVyQWRkQXJncyB7XG4gICAgICAgIHJvdXRlOiBSZWdFeHA7XG4gICAgICAgIGhhbmRsZXI6ICgpID0+IHZvaWQ7XG4gICAgfVxuXG4gICAgZXhwb3J0IGNsYXNzIFJvdXRlciB7XG5cbiAgICAgICAgcHJpdmF0ZSBtb2RlOiBzdHJpbmc7XG4gICAgICAgIHByaXZhdGUgcm9vdDogc3RyaW5nO1xuICAgICAgICBwcml2YXRlIHJvdXRlczogSVJvdXRlckFkZEFyZ3NbXTtcblxuICAgICAgICBwcml2YXRlIGludGVydmFsOiBudW1iZXI7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgdGhpcy5yb3V0ZXMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuY29uZmlnKHsgbW9kZTogJ2hpc3RvcnknIH0pOyAvLyBEZWZhdWx0IENvbmZpZ1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpdmF0ZSBjbGVhclNsYXNoZXMocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgICAgIHJldHVybiBwYXRoLnRvU3RyaW5nKCkucmVwbGFjZSgvXFwvJC8sICcnKS5yZXBsYWNlKC9eXFwvLywgJycpO1xuICAgICAgICB9XG5cblxuXHRcdC8qKlxuXHRcdCAqIFBVQkxJQyBBUElcblx0XHQgKiA9PT09PT09PT09XG5cdFx0ICovXG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7SVJvdXRlck9wdGlvbnN9IG9wdGlvbnM/XG4gICAgICAgICAqIEByZXR1cm5zIFJvdXRlclxuICAgICAgICAgKi9cbiAgICAgICAgY29uZmlnKG9wdGlvbnM/OiBJUm91dGVyT3B0aW9ucyk6IFJvdXRlciB7XG4gICAgICAgICAgICB0aGlzLm1vZGUgPSBvcHRpb25zICYmIG9wdGlvbnMubW9kZSAmJiBvcHRpb25zLm1vZGUgPT09ICdoaXN0b3J5JyAmJiAhIShoaXN0b3J5LnB1c2hTdGF0ZSkgPyAnaGlzdG9yeScgOiAnaGFzaCc7XG4gICAgICAgICAgICB0aGlzLnJvb3QgPSBvcHRpb25zICYmIG9wdGlvbnMucm9vdCAmJiBvcHRpb25zLnJvb3QgPyAnLycgKyB0aGlzLmNsZWFyU2xhc2hlcyhvcHRpb25zLnJvb3QpICsgJy8nIDogJy8nO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge3N0cmluZ30gcm91dGU/XG4gICAgICAgICAqIEByZXR1cm5zIFJvdXRlclxuICAgICAgICAgKi9cbiAgICAgICAgY2hlY2socm91dGU/OiBzdHJpbmcpOiBSb3V0ZXIge1xuICAgICAgICAgICAgdmFyIGZyYWdtZW50ID0gcm91dGUgfHwgdGhpcy5nZXRwYXRobmFtZSgpO1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICB0aGlzLnJvdXRlcy5ldmVyeSgociwgaSkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBtYXRjaCA9IGZyYWdtZW50Lm1hdGNoKHIucm91dGUpO1xuXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hdGNoLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIHIuaGFuZGxlci5hcHBseSh7fSwgbWF0Y2gpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcmV0dXJucyBzdHJpbmdcbiAgICAgICAgICovXG4gICAgICAgIGdldHBhdGhuYW1lKCk6IHN0cmluZyB7XG4gICAgICAgICAgICB2YXIgZnJhZ21lbnQgPSAnJztcbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGUgPT09ICdoaXN0b3J5Jykge1xuICAgICAgICAgICAgICAgIGZyYWdtZW50ID0gdGhpcy5jbGVhclNsYXNoZXMoZGVjb2RlVVJJKGxvY2F0aW9uLnBhdGhuYW1lICsgbG9jYXRpb24uc2VhcmNoKSk7XG4gICAgICAgICAgICAgICAgZnJhZ21lbnQgPSBmcmFnbWVudC5yZXBsYWNlKC9cXD8oLiopJC8sICcnKTtcbiAgICAgICAgICAgICAgICBmcmFnbWVudCA9IHRoaXMucm9vdCAhPSAnLycgPyBmcmFnbWVudC5yZXBsYWNlKHRoaXMucm9vdCwgJycpIDogZnJhZ21lbnQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBtYXRjaCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLm1hdGNoKC8jKC4qKSQvKTtcbiAgICAgICAgICAgICAgICBmcmFnbWVudCA9IG1hdGNoID8gbWF0Y2hbMV0gOiAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNsZWFyU2xhc2hlcyhmcmFnbWVudCk7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAgeygpPT52b2lkfSBoYW5kbGVyXG4gICAgICAgICAqIEByZXR1cm5zIFJvdXRlclxuICAgICAgICAgKi9cbiAgICAgICAgYWRkKGhhbmRsZXI6ICgpID0+IHZvaWQpOiBSb3V0ZXI7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHtSZWdFeHB9IHJvdXRlXG4gICAgICAgICAqIEBwYXJhbSAgeygpPT52b2lkfSBoYW5kbGVyXG4gICAgICAgICAqIEByZXR1cm5zIFJvdXRlclxuICAgICAgICAgKi9cbiAgICAgICAgYWRkKHJvdXRlOiBSZWdFeHAsIGhhbmRsZXI6ICgpID0+IHZvaWQpOiBSb3V0ZXI7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHthbnl9IHBhcmFtXG4gICAgICAgICAqIEBwYXJhbSAgeygpPT52b2lkfSBoYW5kbGVyP1xuICAgICAgICAgKiBAcmV0dXJucyBSb3V0ZXJcbiAgICAgICAgICovXG4gICAgICAgIGFkZChwYXJhbTogYW55LCBoYW5kbGVyPzogKCkgPT4gdm9pZCk6IFJvdXRlciB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHBhcmFtID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb3V0ZXMucHVzaCh7IHJvdXRlOiA8YW55PicnLCBoYW5kbGVyOiBwYXJhbSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb3V0ZXMucHVzaCh7IHJvdXRlOiBwYXJhbSwgaGFuZGxlcjogaGFuZGxlciB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAgeygpPT52b2lkfSBoYW5kbGVyXG4gICAgICAgICAqIEByZXR1cm5zIFJvdXRlclxuICAgICAgICAgKi9cbiAgICAgICAgcmVtb3ZlKGhhbmRsZXI6ICgpID0+IHZvaWQpOiBSb3V0ZXI7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHtzdHJpbmd8UmVnRXhwfSByb3V0ZVxuICAgICAgICAgKiBAcmV0dXJucyBSb3V0ZXJcbiAgICAgICAgICovXG4gICAgICAgIHJlbW92ZShyb3V0ZTogc3RyaW5nIHwgUmVnRXhwKTogUm91dGVyO1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7YW55fSBwYXJhbVxuICAgICAgICAgKiBAcmV0dXJucyBSb3V0ZXJcbiAgICAgICAgICovXG4gICAgICAgIHJlbW92ZShwYXJhbTogYW55KTogUm91dGVyIHtcbiAgICAgICAgICAgIHRoaXMucm91dGVzLmV2ZXJ5KChyb3V0ZSwgaSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyb3V0ZS5oYW5kbGVyID09PSBwYXJhbSB8fCByb3V0ZS5yb3V0ZS50b1N0cmluZygpID09PSBwYXJhbS50b1N0cmluZygpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm91dGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgZmx1c2goKTogUm91dGVyIHtcbiAgICAgICAgICAgIHRoaXMucm91dGVzID0gW107XG4gICAgICAgICAgICB0aGlzLmNvbmZpZygpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIGxpc3RlbigpOiBSb3V0ZXIge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzLmdldHBhdGhuYW1lKCk7XG5cbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbCk7XG5cbiAgICAgICAgICAgIHRoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnQgIT09IHRoaXMuZ2V0cGF0aG5hbWUoKSkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50ID0gdGhpcy5nZXRwYXRobmFtZSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoZWNrKGN1cnJlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDUwKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBuYXZpZ2F0ZSgpOiBSb3V0ZXI7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IHJvdXRlXG4gICAgICAgICAqIEByZXR1cm5zIFJvdXRlclxuICAgICAgICAgKi9cbiAgICAgICAgbmF2aWdhdGUocm91dGU6IHN0cmluZyk6IFJvdXRlcjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge3N0cmluZ30gcm91dGU/XG4gICAgICAgICAqIEByZXR1cm5zIFJvdXRlclxuICAgICAgICAgKi9cbiAgICAgICAgbmF2aWdhdGUocm91dGU/OiBzdHJpbmcpOiBSb3V0ZXIge1xuICAgICAgICAgICAgcm91dGUgPSByb3V0ZSB8fCAnJztcblxuICAgICAgICAgICAgaWYgKHRoaXMubW9kZSA9PT0gJ2hpc3RvcnknKSB7XG4gICAgICAgICAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUobnVsbCwgbnVsbCwgdGhpcy5yb290ICsgdGhpcy5jbGVhclNsYXNoZXMocm91dGUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYubWF0Y2goLyMoLiopJC8pO1xuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYucmVwbGFjZSgvIyguKikkLywgJycpICsgJyMnICsgcm91dGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zL2dyZWVuc29jay9ncmVlbnNvY2suZC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMvanF1ZXJ5L2pxdWVyeS5kLnRzXCIgLz5cblxuXG5tb2R1bGUgY29tbW9ue1xuXG4gICAgZXhwb3J0IGludGVyZmFjZSBJVmlldyB7XG4gICAgICAgIG9wZW4oKTpKUXVlcnlQcm9taXNlPHt9PjtcbiAgICAgICAgY2xvc2UoKTpKUXVlcnlQcm9taXNlPHt9PjtcbiAgICAgICAgaXNPcGVuOmJvb2xlYW47XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIklWaWV3LnRzXCIgLz5cblxubW9kdWxlIGNvbW1vbiB7XG5cbiAgICBpbXBvcnQgSVZpZXcgPSBjb21tb24uSVZpZXc7XG5cbiAgICBleHBvcnQgY2xhc3MgVmlld01hbmFnZXIge1xuXG4gICAgICAgIHByaXZhdGUgdmlld3M6IEFycmF5PElWaWV3PiA9IFtdO1xuICAgICAgICBjdXJyZW50VmlldzogSVZpZXcgPSBudWxsO1xuXG4gICAgICAgIGFkZFZpZXcgPSAoaWQ6IG51bWJlciwgdmlldzogSVZpZXcpID0+IHtcbiAgICAgICAgICAgIHRoaXMudmlld3NbaWRdID0gdmlldztcbiAgICAgICAgfTtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge251bWJlcn0gaWRcbiAgICAgICAgICogQHJldHVybnMgSVZpZXdcbiAgICAgICAgICovXG4gICAgICAgIGdldFZpZXdCeUlkKGlkOiBudW1iZXIpOiBJVmlldyB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy52aWV3c1tpZF07XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge251bWJlcn0gaWRcbiAgICAgICAgICogQHJldHVybnMgYm9vbGVhblxuICAgICAgICAgKi9cbiAgICAgICAgaXNWaWV3T3BlbihpZDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRWaWV3QnlJZChpZCkuaXNPcGVuO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHtudW1iZXJ9IGlkXG4gICAgICAgICAqIEByZXR1cm5zIEpRdWVyeVByb21pc2VcbiAgICAgICAgICovXG4gICAgICAgIGNsb3NlVmlldyhpZDogbnVtYmVyKTogSlF1ZXJ5UHJvbWlzZTx7fT4ge1xuICAgICAgICAgICAgdmFyIHZpZXcgPSB0aGlzLmdldFZpZXdCeUlkKGlkKTtcbiAgICAgICAgICAgIHZpZXcuaXNPcGVuID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gdmlldy5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHtudW1iZXJ9IGlkXG4gICAgICAgICAqIEByZXR1cm5zIEpRdWVyeVByb21pc2VcbiAgICAgICAgICovXG4gICAgICAgIG9wZW5WaWV3ID0gKGlkOiBudW1iZXIpOiBKUXVlcnlQcm9taXNlPHt9PiA9PiB7XG5cbiAgICAgICAgICAgIHZhciBkZWZlciA9ICQuRGVmZXJyZWQoKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFZpZXcgIT0gbnVsbCAmJiAodGhpcy5nZXRWaWV3QnlJZChpZCkgPT09IHRoaXMuY3VycmVudFZpZXcpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICAgICAgICAgIGRlZmVyLnJlc29sdmUoKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBkZWZlci5wcm9taXNlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRWaWV3ICE9IG51bGwpIHtcblxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRWaWV3LmNsb3NlKClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50VmlldyA9IHRoaXMuZ2V0Vmlld0J5SWQoaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFZpZXcub3BlbigpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdXJyZW50VmlldyA9IHRoaXMuZ2V0Vmlld0J5SWQoaWQpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFZpZXcub3BlbigpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNsb3NlQ3VycmVudFZpZXcgPSAoKTogSlF1ZXJ5UHJvbWlzZTx7fT4gPT4ge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50VmlldyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFjdGl2ZVZpZXcgPSB0aGlzLmN1cnJlbnRWaWV3O1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFZpZXcgPSBudWxsO1xuICAgICAgICAgICAgICAgIHJldHVybiBhY3RpdmVWaWV3LmNsb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgcmVzZXQoKTogdm9pZCB7XG5cbiAgICAgICAgICAgIHRoaXMuY3VycmVudFZpZXcgPSBudWxsO1xuICAgICAgICB9XG4gICAgfVxufVxuIiwiXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiSVZpZXcudHNcIiAvPlxuXG5tb2R1bGUgY29tbW9uIHtcblxuICAgIGltcG9ydCBJVmlldyA9IGNvbW1vbi5JVmlldztcbiAgICBcbiAgICBleHBvcnQgY2xhc3MgVmlldyBpbXBsZW1lbnRzIElWaWV3IHtcblxuICAgICAgICBwcml2YXRlIF9pc09wZW46IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgXG4gICAgICAgIHByaXZhdGUgdGFyZ2V0OnN0cmluZztcbiAgICAgICAgcHJpdmF0ZSAkcmVzdWx0OkpRdWVyeTtcbiAgICAgICAgLy8gcHVibGljIHRhcmdldDogSFRNTEVsZW1lbnQ7XG5cbiAgICAgICAgY29uc3RydWN0b3IodGFyZ2V0OnN0cmluZywgJHJlc3VsdDpKUXVlcnkpIHtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgICAgICAgICAgdGhpcy4kcmVzdWx0ID0gJHJlc3VsdDtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldCBpc09wZW4oKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9pc09wZW47IH1cblxuICAgICAgICBvcGVuKCk6IEpRdWVyeVByb21pc2U8e30+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwib3BlbiEhIVwiLCB0aGlzLnRhcmdldCwgdGhpcy4kcmVzdWx0KVxuICAgICAgICAgICAgdmFyIGRlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLiRyZXN1bHRcbiAgICAgICAgICAgICAgICAubG9hZCh0aGlzLnRhcmdldCwgKCk9PntcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faXNPcGVuID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgVHdlZW5NYXgudG8odGhpcy4kcmVzdWx0LCAuNDUsIHtsZWZ0OiAwLCBlYXNlOiBDdWJpYy5lYXNlSW4sIG9uQ29tcGxldGU6ICgpPT57XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW50cm8oZGVmZXIpO1xuICAgICAgICAgICAgICAgICAgICB9fSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xvc2UoKTogSlF1ZXJ5UHJvbWlzZTx7fT4ge1xuICAgICAgICAgICAgdmFyIGRlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnVuYmluZCgpO1xuICAgICAgICAgICAgdGhpcy5faXNPcGVuID0gZmFsc2U7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFR3ZWVuTWF4LnRvKCB0aGlzLiRyZXN1bHQsIC40NSwge2xlZnQ6IFwiLTEwMCVcIiwgZWFzZTogQ3ViaWMuZWFzZU91dCwgb25Db21wbGV0ZTooKT0+e1xuICAgICAgICAgICAgICAgIHRoaXMuJHJlc3VsdC5zY3JvbGxUb3AoMCk7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXBhcnR1cmUoZGVmZXIpOyBcbiAgICAgICAgICAgIH19ICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGRlZmVyLnByb21pc2UoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge0pRdWVyeURlZmVycmVkPHt9Pn0gZFxuICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAqL1xuICAgICAgICBwcm90ZWN0ZWQgaW50cm8oZDogSlF1ZXJ5RGVmZXJyZWQ8e30+KTogdm9pZCB7IFxuICAgICAgICAgICAgdGhpcy5iaW5kKCk7IFxuICAgICAgICAgICAgZC5yZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge0pRdWVyeURlZmVycmVkPHt9Pn0gZFxuICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAqL1xuICAgICAgICBwcm90ZWN0ZWQgZGVwYXJ0dXJlKGQ6IEpRdWVyeURlZmVycmVkPHt9Pik6IHZvaWQge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBkLnJlc29sdmUoKTsgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGJpbmQoKTp2b2lkIHsgfVxuICAgICAgICBwcm90ZWN0ZWQgdW5iaW5kKCk6dm9pZCB7IH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMvZ3JlZW5zb2NrL2dyZWVuc29jay5kLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy9qcXVlcnkvanF1ZXJ5LmQudHNcIiAvPlxuXG5tb2R1bGUgY29tbW9ue1xuICAgIFxuICAgIGV4cG9ydCBjbGFzcyBMb2FkZXIge1xuICAgICAgICBcbiAgICAgICAgcHJpdmF0ZSBjb250YWluZXI6IHN0cmluZztcbiAgICAgICAgXG4gICAgICAgIHByaXZhdGUgcmVzdWx0OiBKUXVlcnk7XG4gICAgICAgIHByaXZhdGUgb3ZlcmxheTogSlF1ZXJ5O1xuICAgICAgICBwcml2YXRlIGJvZHk6IEpRdWVyeTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lciA9ICcjanMtbWFpbi1jb250YWluZXInO1xuICAgICAgICAgICAgdGhpcy5yZXN1bHQgPSAkKCAnI2pzLXJlcycgKTtcbiAgICAgICAgICAgIHRoaXMub3ZlcmxheSA9ICQoICcjanMtb3ZlcmxheS1sb2FkZXInICk7XG4gICAgICAgICAgICB0aGlzLmJvZHkgPSAkKCAnYm9keScgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgbG9hZCAoIHBhdGg6IHN0cmluZywgb25Mb2FkOiBGdW5jdGlvbiApIDogdm9pZCB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuYm9keS5jc3MoIHsgJ292ZXJmbG93JzogJ25vbmUnIH0gKTtcbiAgICAgICAgICAgIHRoaXMuYm9keS5zY3JvbGxUb3AoIDAgKTtcbiAgICAgICAgICAgIFR3ZWVuTWF4LnNldCggdGhpcy5vdmVybGF5LCB7IGxlZnQ6IDAgfSApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnJlc3VsdC5sb2FkKCBwYXRoICsgJyAnICsgdGhpcy5jb250YWluZXIsICgpID0+IHtcbiAgICAgICAgICAgICAgICBvbkxvYWQoKTtcbiAgICAgICAgICAgICAgICBUd2Vlbk1heC50byggdGhpcy5vdmVybGF5LCAwLjI1LCB7XG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6ICctMTAwJScsIFxuICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlOiAoKSA9PiAgeyBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYm9keS5jc3MoIHsgJ292ZXJmbG93JzogJ2F1dG8nIH0gKTtcbiAgICAgICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgfVxuICAgIH1cbn0iLCJtb2R1bGUgY29tcG9uZW50cyB7XG4gICAgXG4gICAgZXhwb3J0IGNsYXNzIE1haW5NZW51IHtcbiAgICAgICAgXG4gICAgICAgIHByaXZhdGUgYnRNZW51OiBKUXVlcnk7XG4gICAgICAgIHByaXZhdGUgYnRMaW5rczogSlF1ZXJ5O1xuICAgICAgICBwcml2YXRlIGNvbnRhaW5lcjogSlF1ZXJ5O1xuICAgICAgICBcbiAgICAgICAgcHJpdmF0ZSBpc09wZW5lZDpib29sZWFuO1xuICAgICAgICBcbiAgICAgICAgY29uc3RydWN0b3IoYnQ6IEpRdWVyeSwgY29udGFpbmVyOiBKUXVlcnkpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmJ0TWVudSA9IGJ0O1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXIgPSBjb250YWluZXI7XG4gICAgICAgICAgICB0aGlzLmJ0TGlua3MgPSAkKFwiYS5wYWdlLWxvYWRcIiwgdGhpcy5jb250YWluZXIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmlzT3BlbmVkID0gZmFsc2U7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuYmluZCgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIGJpbmQoKTp2b2lke1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmJ0TWVudS5vbihcImNsaWNrXCIsIHRoaXMudG9vZ2xlU3RhdGUuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLmJ0TGlua3Mub24oXCJjbGlja1wiLCB0aGlzLmNsb3NlLmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIHRvb2dsZVN0YXRlKCk6IHZvaWR7XG4gICAgICAgICAgICBpZih0aGlzLmlzT3BlbmVkKXsgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgfWVsc2V7IHRoaXMub3BlbigpOyB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHByaXZhdGUgb3BlbigpOnZvaWR7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuaXNPcGVuZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5idE1lbnUuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHJpdmF0ZSBjbG9zZSgpOnZvaWR7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuaXNPcGVuZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuYnRNZW51LnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXIucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGVuZWFibGUoKTp2b2lke1xuICAgICAgICAgICAgLy8gdGhpcy5idE1lbnUuY3NzKHtsZWZ0OiBcIjBcIn0pO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGRpc2VhYmxlKCk6dm9pZHtcbiAgICAgICAgICAgIC8vIHRoaXMuYnRNZW51LmNzcyh7bGVmdDogXCItNjBweFwifSk7XG4gICAgICAgIH1cbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL2NvbW1vbi9WaWV3LnRzXCIgLz5cblxubW9kdWxlIHZpZXdze1xuICAgIFxuICAgIGV4cG9ydCBjbGFzcyBIb21lIGV4dGVuZHMgY29tbW9uLlZpZXd7XG4gICAgICAgIFxuICAgICAgICBiaW5kKCk6dm9pZCB7XG4gICAgICAgIH1cbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zL2dyZWVuc29jay9ncmVlbnNvY2suZC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMvanF1ZXJ5L2pxdWVyeS5kLnRzXCIgLz5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2NvbW1vbi9Sb3V0ZXIudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2NvbW1vbi9WaWV3TWFuYWdlci50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY29tbW9uL1ZpZXcudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2NvbW1vbi9Mb2FkZXIudHNcIiAvPlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiY29tcG9uZW50cy9NYWluTWVudS50c1wiIC8+XG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ2aWV3cy9Ib21lLnRzXCIgLz5cblxubW9kdWxlIGluZGV4IHtcbiAgICBcbiAgICBpbXBvcnQgUm91dGVyID0gY29tbW9uLlJvdXRlcjtcbiAgICBpbXBvcnQgVmlld01hbmFnZXIgPSBjb21tb24uVmlld01hbmFnZXI7XG4gICAgaW1wb3J0IExvYWRlciA9IGNvbW1vbi5Mb2FkZXI7XG4gICAgLy8gaW1wb3J0IFZpZXcgPSBjb21tb24uVmlldztcbiAgICBcbiAgICBpbXBvcnQgTWFpbk1lbnUgPSBjb21wb25lbnRzLk1haW5NZW51O1xuICAgIFxuICAgIC8vIGltcG9ydCBIb21lVmlldyA9IHZpZXdzLkhvbWU7XG5cbiAgICBleHBvcnQgZW51bSBNYWluVmlld3Mge1xuICAgICAgICAvLyBIb21lVmlldyxcbiAgICAgICAgLy8gQWJvdXRNZVZpZXcsXG4gICAgICAgIC8vIFNvbWVDb2RlXG4gICAgfVxuXHRleHBvcnQgY2xhc3MgSW5kZXhBcHAge1xuXHRcdFxuICAgICAgICBwcml2YXRlIHJvdXRlcjpSb3V0ZXI7XG4gICAgICAgIHByaXZhdGUgdmlld01hbmFnZXI6Vmlld01hbmFnZXI7XG4gICAgICAgIHByaXZhdGUgbG9hZGVyOkxvYWRlcjtcbiAgICAgICAgXG4gICAgICAgIHByaXZhdGUgbWFpbk1lbnU6TWFpbk1lbnU7XG4gICAgICAgIFxuICAgICAgICAvLyBwcml2YXRlIEhvbWVWaWV3OkhvbWVWaWV3O1xuICAgICAgICAvLyBwcml2YXRlIEFib3V0TWVWaWV3OlZpZXc7XG4gICAgICAgIC8vIHByaXZhdGUgU29tZUNvZGU6VmlldztcbiAgICAgICAgXG5cdFx0Y29uc3RydWN0b3IgKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnJvdXRlciA9IG5ldyBSb3V0ZXIoKTtcbiAgICAgICAgICAgIHRoaXMudmlld01hbmFnZXIgPSBuZXcgVmlld01hbmFnZXIoKTtcbiAgICAgICAgICAgIHRoaXMubG9hZGVyID0gbmV3IExvYWRlcigpO1xuXHRcdH1cblxuXHRcdGluaXQgKCk6dm9pZCB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMubWFpbk1lbnUgPSBuZXcgTWFpbk1lbnUoJChcIiNqcy1tYWluLWhlYWRlcl9fYnV0dG9uXCIpLCAkKFwiI2pzLW1haW4taGVhZGVyX19uYXZcIikpO1xuXHRcdFx0XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiYS5wYWdlLWxvYWRcIiwgKGU6IEpRdWVyeUV2ZW50T2JqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHZhciBwYXRoID0gJChlLmN1cnJlbnRUYXJnZXQpLmF0dHIoXCJocmVmXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZGVyLmxvYWQocGF0aCwgKCkgPT4geyB0aGlzLnJvdXRlci5uYXZpZ2F0ZShwYXRoKTogfSApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC8vIHRoaXMucm91dGVyLmNoZWNrKCk7XG4gICAgICAgIH1cblx0fVxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJkZWZpbml0aW9ucy9ncmVlbnNvY2svZ3JlZW5zb2NrLmQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImRlZmluaXRpb25zL2pxdWVyeS9qcXVlcnkuZC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiaW5kZXgvSW5kZXhBcHAudHNcIiAvPlxuXG5pbXBvcnQgSW5kZXhBcHAgPSBpbmRleC5JbmRleEFwcDtcbnZhciBhcHA6IEluZGV4QXBwO1xuLy8gJChmdW5jdGlvbigpIHtcblx0XG4vLyBcdGFwcCA9IG5ldyBJbmRleEFwcCgpO1xuLy8gXHRhcHAuaW5pdCgpO1xuLy8gfSk7XG5cblxuKGZ1bmN0aW9uKCQ6IGFueSkge1xuICAgIGFwcCA9IG5ldyBJbmRleEFwcCgpO1xuXHRhcHAuaW5pdCgpOyBcbn0pKGpRdWVyeSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
