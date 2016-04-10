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
// TO-DO:
// Clean animations
// Animations with GSAP
// Separate loader images to another class
var common;
(function (common) {
    var Loader = (function () {
        function Loader() {
            this.container = '#js-main-container';
            this.result = $('#js-res');
            this.overlay = $('#js-overlay-loader');
            this.overlayBar = $('#js-overlay-loader--bar');
            this.overlayBg = $('#js-overlay-loader--bg');
            this.body = $('body');
        }
        Loader.prototype.animateOpen = function () {
            var _this = this;
            var defer = $.Deferred();
            TweenMax.killTweensOf(this.overlayBar);
            this.body.css({ 'overflow': 'hidden' });
            TweenMax.set(this.overlayBar, { width: 0, y: 0 });
            TweenMax.set(this.overlay, { left: 0 });
            TweenLite.to(this.overlayBg, 0.25, { opacity: .2, onComplete: function () {
                    // FIX THIS!
                    _this.body.stop().animate({ scrollTop: 0 }, '250', 'swing', function () {
                        TweenMax.to(_this.result, 0.25, { y: "100px", opacity: 0, onComplete: function () { defer.resolve(); } });
                    });
                } });
            return defer.promise();
        };
        Loader.prototype.animateClose = function () {
            var _this = this;
            var defer = $.Deferred();
            this.animateFillBar(100)
                .then(function () {
                TweenLite.to(_this.overlayBg, 0.25, { opacity: 0 });
                TweenLite.to(_this.overlayBar, 0.25, { y: "-60px" });
                TweenLite.to(_this.result, 0.25, { delay: 0.35, y: 0, opacity: 1, onComplete: function () {
                        TweenMax.set(_this.overlay, { left: '-100%' });
                        _this.body.css({ 'overflow': 'auto' });
                        defer.resolve();
                    } });
            });
            return defer.promise();
        };
        Loader.prototype.animateFillBar = function (toPercent) {
            var defer = $.Deferred();
            TweenMax.killTweensOf(this.overlayBar);
            TweenLite.to(this.overlayBar, 0.25, { width: toPercent + "%", onComplete: defer.resolve });
            return defer.promise();
        };
        Loader.prototype.processImages = function () {
            var _this = this;
            var defer = $.Deferred();
            var images = this.result.find('[data-load]');
            var count = 0;
            if (images.length == 0) {
                defer.resolve();
            }
            for (var index = 0; index < images.length; index++) {
                var src = $(images[index]).data("load");
                var img = new Image();
                img.src = src;
                img.onload = function () {
                    count++;
                    _this.animateFillBar((count / images.length) * 100);
                    if (count >= images.length) {
                        defer.resolve();
                    }
                };
                img.onerror = function () {
                    count++;
                    if (count >= images.length) {
                        defer.resolve();
                    }
                };
            }
            return defer.promise();
        };
        Loader.prototype.load = function (path) {
            var _this = this;
            console.log(path);
            var defer = $.Deferred();
            this.result.load("/" + path + ' ' + this.container, function () {
                _this.processImages().then(defer.resolve);
            });
            return defer.promise();
        };
        Loader.prototype.open = function (path) {
            this.animateOpen()
                .then(this.load.bind(this, path))
                .then(this.animateClose.bind(this));
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
                _this.loader.open(_this.router.getpathname());
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9Sb3V0ZXIudHMiLCJjb21tb24vSVZpZXcudHMiLCJjb21tb24vVmlld01hbmFnZXIudHMiLCJjb21tb24vVmlldy50cyIsImNvbW1vbi9Mb2FkZXIudHMiLCJpbmRleC9jb21wb25lbnRzL01haW5NZW51LnRzIiwiaW5kZXgvdmlld3MvSG9tZS50cyIsImluZGV4L0luZGV4QXBwLnRzIiwibWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxJQUFPLE1BQU0sQ0FxTFo7QUFyTEQsV0FBTyxNQUFNLEVBQUMsQ0FBQztJQVlYO1FBT0k7WUFDSSxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxpQkFBaUI7UUFDdkQsQ0FBQztRQUVPLDZCQUFZLEdBQXBCLFVBQXFCLElBQVk7WUFDN0IsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakUsQ0FBQztRQUdQOzs7V0FHRztRQUVHOzs7V0FHRztRQUNILHVCQUFNLEdBQU4sVUFBTyxPQUF3QjtZQUMzQixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxTQUFTLEdBQUcsTUFBTSxDQUFDO1lBQ2hILElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxH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QUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDM0MsS0FBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFL0IsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsTUFBTTtpQkFDTixHQUFHLENBQUM7Z0JBQ0QsS0FBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQ2hELENBQUMsQ0FBQztpQkFDRCxNQUFNLEVBQUUsQ0FBQztZQUNkLHVCQUF1QjtRQUMzQixDQUFDO1FBQ1IsZUFBQztJQUFELENBckNBLEFBcUNDLElBQUE7SUFyQ1ksY0FBUSxXQXFDcEIsQ0FBQTtBQUNGLENBQUMsRUF0RE0sS0FBSyxLQUFMLEtBQUssUUFzRFg7QUNsRUQsNkRBQTZEO0FBQzdELHVEQUF1RDtBQUN2RCwwQ0FBMEM7QUFFMUMsSUFBTyxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQztBQUNqQyxJQUFJLEdBQWEsQ0FBQztBQUNsQixpQkFBaUI7QUFFakIseUJBQXlCO0FBQ3pCLGVBQWU7QUFDZixNQUFNO0FBR04sQ0FBQyxVQUFTLENBQU07SUFDWixHQUFHLEdBQUcsSUFBSSxRQUFRLEVBQUUsQ0FBQztJQUN4QixHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDWixDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBGcm9tIGhlcmU6XG4gKiBodHRwOi8va3Jhc2ltaXJ0c29uZXYuY29tL2Jsb2cvYXJ0aWNsZS9BLW1vZGVybi1KYXZhU2NyaXB0LXJvdXRlci1pbi0xMDAtbGluZXMtaGlzdG9yeS1hcGktcHVzaFN0YXRlLWhhc2gtdXJsXG4gKi9cblxubW9kdWxlIGNvbW1vbiB7XG5cbiAgICBleHBvcnQgaW50ZXJmYWNlIElSb3V0ZXJPcHRpb25zIHtcbiAgICAgICAgbW9kZT86IHN0cmluZztcbiAgICAgICAgcm9vdD86IHN0cmluZztcbiAgICB9XG5cbiAgICBpbnRlcmZhY2UgSVJvdXRlckFkZEFyZ3Mge1xuICAgICAgICByb3V0ZTogUmVnRXhwO1xuICAgICAgICBoYW5kbGVyOiAoKSA9PiB2b2lkO1xuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBSb3V0ZXIge1xuXG4gICAgICAgIHByaXZhdGUgbW9kZTogc3RyaW5nO1xuICAgICAgICBwcml2YXRlIHJvb3Q6IHN0cmluZztcbiAgICAgICAgcHJpdmF0ZSByb3V0ZXM6IElSb3V0ZXJBZGRBcmdzW107XG5cbiAgICAgICAgcHJpdmF0ZSBpbnRlcnZhbDogbnVtYmVyO1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIHRoaXMucm91dGVzID0gW107XG4gICAgICAgICAgICB0aGlzLmNvbmZpZyh7IG1vZGU6ICdoaXN0b3J5JyB9KTsgLy8gRGVmYXVsdCBDb25maWdcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgY2xlYXJTbGFzaGVzKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgICAgICByZXR1cm4gcGF0aC50b1N0cmluZygpLnJlcGxhY2UoL1xcLyQvLCAnJykucmVwbGFjZSgvXlxcLy8sICcnKTtcbiAgICAgICAgfVxuXG5cblx0XHQvKipcblx0XHQgKiBQVUJMSUMgQVBJXG5cdFx0ICogPT09PT09PT09PVxuXHRcdCAqL1xuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge0lSb3V0ZXJPcHRpb25zfSBvcHRpb25zP1xuICAgICAgICAgKiBAcmV0dXJucyBSb3V0ZXJcbiAgICAgICAgICovXG4gICAgICAgIGNvbmZpZyhvcHRpb25zPzogSVJvdXRlck9wdGlvbnMpOiBSb3V0ZXIge1xuICAgICAgICAgICAgdGhpcy5tb2RlID0gb3B0aW9ucyAmJiBvcHRpb25zLm1vZGUgJiYgb3B0aW9ucy5tb2RlID09PSAnaGlzdG9yeScgJiYgISEoaGlzdG9yeS5wdXNoU3RhdGUpID8gJ2hpc3RvcnknIDogJ2hhc2gnO1xuICAgICAgICAgICAgdGhpcy5yb290ID0gb3B0aW9ucyAmJiBvcHRpb25zLnJvb3QgJiYgb3B0aW9ucy5yb290ID8gJy8nICsgdGhpcy5jbGVhclNsYXNoZXMob3B0aW9ucy5yb290KSArICcvJyA6ICcvJztcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IHJvdXRlP1xuICAgICAgICAgKiBAcmV0dXJucyBSb3V0ZXJcbiAgICAgICAgICovXG4gICAgICAgIGNoZWNrKHJvdXRlPzogc3RyaW5nKTogUm91dGVyIHtcbiAgICAgICAgICAgIHZhciBmcmFnbWVudCA9IHJvdXRlIHx8IHRoaXMuZ2V0cGF0aG5hbWUoKTtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAgICAgdGhpcy5yb3V0ZXMuZXZlcnkoKHIsIGkpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2ggPSBmcmFnbWVudC5tYXRjaChyLnJvdXRlKTtcblxuICAgICAgICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICBtYXRjaC5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICByLmhhbmRsZXIuYXBwbHkoe30sIG1hdGNoKTtcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQHJldHVybnMgc3RyaW5nXG4gICAgICAgICAqL1xuICAgICAgICBnZXRwYXRobmFtZSgpOiBzdHJpbmcge1xuICAgICAgICAgICAgdmFyIGZyYWdtZW50ID0gJyc7XG4gICAgICAgICAgICBpZiAodGhpcy5tb2RlID09PSAnaGlzdG9yeScpIHtcbiAgICAgICAgICAgICAgICBmcmFnbWVudCA9IHRoaXMuY2xlYXJTbGFzaGVzKGRlY29kZVVSSShsb2NhdGlvbi5wYXRobmFtZSArIGxvY2F0aW9uLnNlYXJjaCkpO1xuICAgICAgICAgICAgICAgIGZyYWdtZW50ID0gZnJhZ21lbnQucmVwbGFjZSgvXFw/KC4qKSQvLCAnJyk7XG4gICAgICAgICAgICAgICAgZnJhZ21lbnQgPSB0aGlzLnJvb3QgIT0gJy8nID8gZnJhZ21lbnQucmVwbGFjZSh0aGlzLnJvb3QsICcnKSA6IGZyYWdtZW50O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2ggPSB3aW5kb3cubG9jYXRpb24uaHJlZi5tYXRjaCgvIyguKikkLyk7XG4gICAgICAgICAgICAgICAgZnJhZ21lbnQgPSBtYXRjaCA/IG1hdGNoWzFdIDogJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jbGVhclNsYXNoZXMoZnJhZ21lbnQpO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHsoKT0+dm9pZH0gaGFuZGxlclxuICAgICAgICAgKiBAcmV0dXJucyBSb3V0ZXJcbiAgICAgICAgICovXG4gICAgICAgIGFkZChoYW5kbGVyOiAoKSA9PiB2b2lkKTogUm91dGVyO1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7UmVnRXhwfSByb3V0ZVxuICAgICAgICAgKiBAcGFyYW0gIHsoKT0+dm9pZH0gaGFuZGxlclxuICAgICAgICAgKiBAcmV0dXJucyBSb3V0ZXJcbiAgICAgICAgICovXG4gICAgICAgIGFkZChyb3V0ZTogUmVnRXhwLCBoYW5kbGVyOiAoKSA9PiB2b2lkKTogUm91dGVyO1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7YW55fSBwYXJhbVxuICAgICAgICAgKiBAcGFyYW0gIHsoKT0+dm9pZH0gaGFuZGxlcj9cbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICBhZGQocGFyYW06IGFueSwgaGFuZGxlcj86ICgpID0+IHZvaWQpOiBSb3V0ZXIge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwYXJhbSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRoaXMucm91dGVzLnB1c2goeyByb3V0ZTogPGFueT4nJywgaGFuZGxlcjogcGFyYW0gfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucm91dGVzLnB1c2goeyByb3V0ZTogcGFyYW0sIGhhbmRsZXI6IGhhbmRsZXIgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHsoKT0+dm9pZH0gaGFuZGxlclxuICAgICAgICAgKiBAcmV0dXJucyBSb3V0ZXJcbiAgICAgICAgICovXG4gICAgICAgIHJlbW92ZShoYW5kbGVyOiAoKSA9PiB2b2lkKTogUm91dGVyO1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7c3RyaW5nfFJlZ0V4cH0gcm91dGVcbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICByZW1vdmUocm91dGU6IHN0cmluZyB8IFJlZ0V4cCk6IFJvdXRlcjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge2FueX0gcGFyYW1cbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICByZW1vdmUocGFyYW06IGFueSk6IFJvdXRlciB7XG4gICAgICAgICAgICB0aGlzLnJvdXRlcy5ldmVyeSgocm91dGUsIGkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocm91dGUuaGFuZGxlciA9PT0gcGFyYW0gfHwgcm91dGUucm91dGUudG9TdHJpbmcoKSA9PT0gcGFyYW0udG9TdHJpbmcoKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJvdXRlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIGZsdXNoKCk6IFJvdXRlciB7XG4gICAgICAgICAgICB0aGlzLnJvdXRlcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5jb25maWcoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBsaXN0ZW4oKTogUm91dGVyIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5nZXRwYXRobmFtZSgpO1xuXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xuXG4gICAgICAgICAgICB0aGlzLmludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50ICE9PSB0aGlzLmdldHBhdGhuYW1lKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudCA9IHRoaXMuZ2V0cGF0aG5hbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVjayhjdXJyZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCA1MCk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgbmF2aWdhdGUoKTogUm91dGVyO1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7c3RyaW5nfSByb3V0ZVxuICAgICAgICAgKiBAcmV0dXJucyBSb3V0ZXJcbiAgICAgICAgICovXG4gICAgICAgIG5hdmlnYXRlKHJvdXRlOiBzdHJpbmcpOiBSb3V0ZXI7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IHJvdXRlP1xuICAgICAgICAgKiBAcmV0dXJucyBSb3V0ZXJcbiAgICAgICAgICovXG4gICAgICAgIG5hdmlnYXRlKHJvdXRlPzogc3RyaW5nKTogUm91dGVyIHtcbiAgICAgICAgICAgIHJvdXRlID0gcm91dGUgfHwgJyc7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGUgPT09ICdoaXN0b3J5Jykge1xuICAgICAgICAgICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKG51bGwsIG51bGwsIHRoaXMucm9vdCArIHRoaXMuY2xlYXJTbGFzaGVzKHJvdXRlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmLm1hdGNoKC8jKC4qKSQvKTtcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmLnJlcGxhY2UoLyMoLiopJC8sICcnKSArICcjJyArIHJvdXRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy9ncmVlbnNvY2svZ3JlZW5zb2NrLmQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zL2pxdWVyeS9qcXVlcnkuZC50c1wiIC8+XG5cblxubW9kdWxlIGNvbW1vbntcblxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSVZpZXcge1xuICAgICAgICBvcGVuKCk6SlF1ZXJ5UHJvbWlzZTx7fT47XG4gICAgICAgIGNsb3NlKCk6SlF1ZXJ5UHJvbWlzZTx7fT47XG4gICAgICAgIGlzT3Blbjpib29sZWFuO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJJVmlldy50c1wiIC8+XG5cbm1vZHVsZSBjb21tb24ge1xuXG4gICAgaW1wb3J0IElWaWV3ID0gY29tbW9uLklWaWV3O1xuXG4gICAgZXhwb3J0IGNsYXNzIFZpZXdNYW5hZ2VyIHtcblxuICAgICAgICBwcml2YXRlIHZpZXdzOiBBcnJheTxJVmlldz4gPSBbXTtcbiAgICAgICAgY3VycmVudFZpZXc6IElWaWV3ID0gbnVsbDtcblxuICAgICAgICBhZGRWaWV3ID0gKGlkOiBudW1iZXIsIHZpZXc6IElWaWV3KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnZpZXdzW2lkXSA9IHZpZXc7XG4gICAgICAgIH07XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHtudW1iZXJ9IGlkXG4gICAgICAgICAqIEByZXR1cm5zIElWaWV3XG4gICAgICAgICAqL1xuICAgICAgICBnZXRWaWV3QnlJZChpZDogbnVtYmVyKTogSVZpZXcge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmlld3NbaWRdO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHtudW1iZXJ9IGlkXG4gICAgICAgICAqIEByZXR1cm5zIGJvb2xlYW5cbiAgICAgICAgICovXG4gICAgICAgIGlzVmlld09wZW4oaWQ6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Vmlld0J5SWQoaWQpLmlzT3BlbjtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7bnVtYmVyfSBpZFxuICAgICAgICAgKiBAcmV0dXJucyBKUXVlcnlQcm9taXNlXG4gICAgICAgICAqL1xuICAgICAgICBjbG9zZVZpZXcoaWQ6IG51bWJlcik6IEpRdWVyeVByb21pc2U8e30+IHtcbiAgICAgICAgICAgIHZhciB2aWV3ID0gdGhpcy5nZXRWaWV3QnlJZChpZCk7XG4gICAgICAgICAgICB2aWV3LmlzT3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHZpZXcuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7bnVtYmVyfSBpZFxuICAgICAgICAgKiBAcmV0dXJucyBKUXVlcnlQcm9taXNlXG4gICAgICAgICAqL1xuICAgICAgICBvcGVuVmlldyA9IChpZDogbnVtYmVyKTogSlF1ZXJ5UHJvbWlzZTx7fT4gPT4ge1xuXG4gICAgICAgICAgICB2YXIgZGVmZXIgPSAkLkRlZmVycmVkKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRWaWV3ICE9IG51bGwgJiYgKHRoaXMuZ2V0Vmlld0J5SWQoaWQpID09PSB0aGlzLmN1cnJlbnRWaWV3KSkge1xuICAgICAgICAgICAgICAgIHZhciBkZWZlciA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlKCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50VmlldyAhPSBudWxsKSB7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50Vmlldy5jbG9zZSgpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFZpZXcgPSB0aGlzLmdldFZpZXdCeUlkKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRWaWV3Lm9wZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3VycmVudFZpZXcgPSB0aGlzLmdldFZpZXdCeUlkKGlkKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRWaWV3Lm9wZW4oKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjbG9zZUN1cnJlbnRWaWV3ID0gKCk6IEpRdWVyeVByb21pc2U8e30+ID0+IHtcblxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFZpZXcgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHZhciBhY3RpdmVWaWV3ID0gdGhpcy5jdXJyZW50VmlldztcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gbnVsbDtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWN0aXZlVmlldy5jbG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHJlc2V0KCk6IHZvaWQge1xuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWaWV3ID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsIlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIklWaWV3LnRzXCIgLz5cblxubW9kdWxlIGNvbW1vbiB7XG5cbiAgICBpbXBvcnQgSVZpZXcgPSBjb21tb24uSVZpZXc7XG4gICAgXG4gICAgZXhwb3J0IGNsYXNzIFZpZXcgaW1wbGVtZW50cyBJVmlldyB7XG5cbiAgICAgICAgcHJpdmF0ZSBfaXNPcGVuOiBib29sZWFuID0gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIHRhcmdldDpzdHJpbmc7XG4gICAgICAgIHByaXZhdGUgJHJlc3VsdDpKUXVlcnk7XG4gICAgICAgIC8vIHB1YmxpYyB0YXJnZXQ6IEhUTUxFbGVtZW50O1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHRhcmdldDpzdHJpbmcsICRyZXN1bHQ6SlF1ZXJ5KSB7XG4gICAgICAgICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICAgICAgICAgIHRoaXMuJHJlc3VsdCA9ICRyZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICBnZXQgaXNPcGVuKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5faXNPcGVuOyB9XG5cbiAgICAgICAgb3BlbigpOiBKUXVlcnlQcm9taXNlPHt9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm9wZW4hISFcIiwgdGhpcy50YXJnZXQsIHRoaXMuJHJlc3VsdClcbiAgICAgICAgICAgIHZhciBkZWZlciA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy4kcmVzdWx0XG4gICAgICAgICAgICAgICAgLmxvYWQodGhpcy50YXJnZXQsICgpPT57XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2lzT3BlbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnRvKHRoaXMuJHJlc3VsdCwgLjQ1LCB7bGVmdDogMCwgZWFzZTogQ3ViaWMuZWFzZUluLCBvbkNvbXBsZXRlOiAoKT0+e1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmludHJvKGRlZmVyKTtcbiAgICAgICAgICAgICAgICAgICAgfX0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGRlZmVyLnByb21pc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNsb3NlKCk6IEpRdWVyeVByb21pc2U8e30+IHtcbiAgICAgICAgICAgIHZhciBkZWZlciA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy51bmJpbmQoKTtcbiAgICAgICAgICAgIHRoaXMuX2lzT3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBUd2Vlbk1heC50byggdGhpcy4kcmVzdWx0LCAuNDUsIHtsZWZ0OiBcIi0xMDAlXCIsIGVhc2U6IEN1YmljLmVhc2VPdXQsIG9uQ29tcGxldGU6KCk9PntcbiAgICAgICAgICAgICAgICB0aGlzLiRyZXN1bHQuc2Nyb2xsVG9wKDApO1xuICAgICAgICAgICAgICAgIHRoaXMuZGVwYXJ0dXJlKGRlZmVyKTsgXG4gICAgICAgICAgICB9fSApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBkZWZlci5wcm9taXNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHtKUXVlcnlEZWZlcnJlZDx7fT59IGRcbiAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgKi9cbiAgICAgICAgcHJvdGVjdGVkIGludHJvKGQ6IEpRdWVyeURlZmVycmVkPHt9Pik6IHZvaWQgeyBcbiAgICAgICAgICAgIHRoaXMuYmluZCgpOyBcbiAgICAgICAgICAgIGQucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHtKUXVlcnlEZWZlcnJlZDx7fT59IGRcbiAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgKi9cbiAgICAgICAgcHJvdGVjdGVkIGRlcGFydHVyZShkOiBKUXVlcnlEZWZlcnJlZDx7fT4pOiB2b2lkIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZC5yZXNvbHZlKCk7IFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBiaW5kKCk6dm9pZCB7IH1cbiAgICAgICAgcHJvdGVjdGVkIHVuYmluZCgpOnZvaWQgeyB9XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zL2dyZWVuc29jay9ncmVlbnNvY2suZC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMvanF1ZXJ5L2pxdWVyeS5kLnRzXCIgLz5cblxuXG4vLyBUTy1ETzpcbi8vIENsZWFuIGFuaW1hdGlvbnNcbi8vIEFuaW1hdGlvbnMgd2l0aCBHU0FQXG4vLyBTZXBhcmF0ZSBsb2FkZXIgaW1hZ2VzIHRvIGFub3RoZXIgY2xhc3Ncbm1vZHVsZSBjb21tb257XG4gICAgXG4gICAgZXhwb3J0IGNsYXNzIExvYWRlciB7XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIGNvbnRhaW5lcjogc3RyaW5nO1xuICAgICAgICBcbiAgICAgICAgcHJpdmF0ZSByZXN1bHQ6IEpRdWVyeTtcbiAgICAgICAgcHJpdmF0ZSBvdmVybGF5OiBKUXVlcnk7XG4gICAgICAgIHByaXZhdGUgb3ZlcmxheUJhcjogSlF1ZXJ5O1xuICAgICAgICBwcml2YXRlIG92ZXJsYXlCZzogSlF1ZXJ5O1xuICAgICAgICBwcml2YXRlIGJvZHk6IEpRdWVyeTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lciA9ICcjanMtbWFpbi1jb250YWluZXInO1xuICAgICAgICAgICAgdGhpcy5yZXN1bHQgPSAkKCAnI2pzLXJlcycgKTtcbiAgICAgICAgICAgIHRoaXMub3ZlcmxheSA9ICQoICcjanMtb3ZlcmxheS1sb2FkZXInICk7XG4gICAgICAgICAgICB0aGlzLm92ZXJsYXlCYXIgPSAkKCAnI2pzLW92ZXJsYXktbG9hZGVyLS1iYXInICk7XG4gICAgICAgICAgICB0aGlzLm92ZXJsYXlCZyA9ICQoICcjanMtb3ZlcmxheS1sb2FkZXItLWJnJyApO1xuICAgICAgICAgICAgdGhpcy5ib2R5ID0gJCggJ2JvZHknICk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHByaXZhdGUgYW5pbWF0ZU9wZW4oKSA6IEpRdWVyeVByb21pc2U8e30+IHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGRlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFR3ZWVuTWF4LmtpbGxUd2VlbnNPZiggdGhpcy5vdmVybGF5QmFyICk7XG4gICAgICAgICAgICB0aGlzLmJvZHkuY3NzKCB7ICdvdmVyZmxvdyc6ICdoaWRkZW4nIH0gKTtcbiAgICAgICAgICAgIFR3ZWVuTWF4LnNldCggdGhpcy5vdmVybGF5QmFyLCB7IHdpZHRoOiAwLCB5OiAwIH0gKTtcbiAgICAgICAgICAgIFR3ZWVuTWF4LnNldCggdGhpcy5vdmVybGF5LCB7IGxlZnQ6IDAgfSApO1xuXG4gICAgICAgICAgICBUd2VlbkxpdGUudG8odGhpcy5vdmVybGF5QmcsIDAuMjUsIHtvcGFjaXR5OiAuMiwgb25Db21wbGV0ZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBGSVggVEhJUyFcbiAgICAgICAgICAgICAgICB0aGlzLmJvZHkuc3RvcCgpLmFuaW1hdGUoe3Njcm9sbFRvcDowfSwgJzI1MCcsICdzd2luZycsICgpID0+IHsgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnRvKCB0aGlzLnJlc3VsdCwgMC4yNSwgeyB5OiBcIjEwMHB4XCIsIG9wYWNpdHk6IDAsIG9uQ29tcGxldGU6ICgpID0+IHsgZGVmZXIucmVzb2x2ZSgpOyB9IH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9fSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBkZWZlci5wcm9taXNlKCk7ICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIGFuaW1hdGVDbG9zZSgpIDogSlF1ZXJ5UHJvbWlzZTx7fT4ge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgZGVmZXIgPSAkLkRlZmVycmVkKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5hbmltYXRlRmlsbEJhciggMTAwIClcbiAgICAgICAgICAgICAgICAudGhlbiggKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIFR3ZWVuTGl0ZS50byggdGhpcy5vdmVybGF5QmcsIDAuMjUsIHtvcGFjaXR5OiAwIH0pO1xuICAgICAgICAgICAgICAgICAgICBUd2VlbkxpdGUudG8oIHRoaXMub3ZlcmxheUJhciwgMC4yNSwge3k6IFwiLTYwcHhcIiB9ICk7XG4gICAgICAgICAgICAgICAgICAgIFR3ZWVuTGl0ZS50byggdGhpcy5yZXN1bHQsIDAuMjUsIHsgZGVsYXk6IDAuMzUsIHk6IDAsIG9wYWNpdHk6IDEsIG9uQ29tcGxldGU6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnNldCggdGhpcy5vdmVybGF5LCB7IGxlZnQ6ICctMTAwJScgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ib2R5LmNzcyggeyAnb3ZlcmZsb3cnOiAnYXV0bycgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZSgpOyBcbiAgICAgICAgICAgICAgICAgICAgfSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgIFxuICAgICAgICAgICAgcmV0dXJuIGRlZmVyLnByb21pc2UoKTsgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHByaXZhdGUgYW5pbWF0ZUZpbGxCYXIgKHRvUGVyY2VudDogbnVtYmVyKSA6IEpRdWVyeVByb21pc2U8e30+IHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGRlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBUd2Vlbk1heC5raWxsVHdlZW5zT2YoIHRoaXMub3ZlcmxheUJhciApO1xuICAgICAgICAgICAgVHdlZW5MaXRlLnRvKCB0aGlzLm92ZXJsYXlCYXIsIDAuMjUsIHt3aWR0aDogdG9QZXJjZW50ICsgXCIlXCIsIG9uQ29tcGxldGU6IGRlZmVyLnJlc29sdmUgfSApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZSgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIHByb2Nlc3NJbWFnZXMgKCkgOiBKUXVlcnlQcm9taXNlPHt9PiB7XG4gICAgICAgICAgICB2YXIgZGVmZXIgPSAkLkRlZmVycmVkKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBpbWFnZXMgPSB0aGlzLnJlc3VsdC5maW5kKCAnW2RhdGEtbG9hZF0nKTtcbiAgICAgICAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKGltYWdlcy5sZW5ndGggPT0gMCl7XG4gICAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGltYWdlcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgc3JjID0gJCggaW1hZ2VzW2luZGV4XSApLmRhdGEoXCJsb2FkXCIpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgICAgICBpbWcuc3JjID0gc3JjO1xuICAgICAgICAgICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7IFxuICAgICAgICAgICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGVGaWxsQmFyKCAoY291bnQvaW1hZ2VzLmxlbmd0aCApICogMTAwICk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiggY291bnQgPj0gaW1hZ2VzLmxlbmd0aCApe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpbWcub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgaWYoIGNvdW50ID49IGltYWdlcy5sZW5ndGggKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZSgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIGxvYWQoIHBhdGg6IHN0cmluZyApIDogSlF1ZXJ5UHJvbWlzZTx7fT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2cocGF0aClcbiAgICAgICAgICAgIHZhciBkZWZlciA9ICQuRGVmZXJyZWQoKTtcbiAgICAgICAgICAgIHRoaXMucmVzdWx0LmxvYWQoIFwiL1wiICsgcGF0aCArICcgJyArIHRoaXMuY29udGFpbmVyLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzSW1hZ2VzKCkudGhlbiggZGVmZXIucmVzb2x2ZSApOyBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVyLnByb21pc2UoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgb3BlbiAoIHBhdGg6IHN0cmluZyApIDogdm9pZCB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0ZU9wZW4oKVxuICAgICAgICAgICAgICAgIC50aGVuKCB0aGlzLmxvYWQuYmluZCggdGhpcywgcGF0aCApKVxuICAgICAgICAgICAgICAgIC50aGVuKCB0aGlzLmFuaW1hdGVDbG9zZS5iaW5kKCB0aGlzICkgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9XG59IiwibW9kdWxlIGNvbXBvbmVudHMge1xuICAgIFxuICAgIGV4cG9ydCBjbGFzcyBNYWluTWVudSB7XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIGJ0TWVudTogSlF1ZXJ5O1xuICAgICAgICBwcml2YXRlIGJ0TGlua3M6IEpRdWVyeTtcbiAgICAgICAgcHJpdmF0ZSBjb250YWluZXI6IEpRdWVyeTtcbiAgICAgICAgXG4gICAgICAgIHByaXZhdGUgaXNPcGVuZWQ6Ym9vbGVhbjtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0cnVjdG9yKGJ0OiBKUXVlcnksIGNvbnRhaW5lcjogSlF1ZXJ5KXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5idE1lbnUgPSBidDtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyO1xuICAgICAgICAgICAgdGhpcy5idExpbmtzID0gJChcImEucGFnZS1sb2FkXCIsIHRoaXMuY29udGFpbmVyKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5pc09wZW5lZCA9IGZhbHNlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmJpbmQoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHJpdmF0ZSBiaW5kKCk6dm9pZHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5idE1lbnUub24oXCJjbGlja1wiLCB0aGlzLnRvb2dsZVN0YXRlLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGhpcy5idExpbmtzLm9uKFwiY2xpY2tcIiwgdGhpcy5jbG9zZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHJpdmF0ZSB0b29nbGVTdGF0ZSgpOiB2b2lke1xuICAgICAgICAgICAgaWYodGhpcy5pc09wZW5lZCl7IHRoaXMuY2xvc2UoKTtcbiAgICAgICAgICAgIH1lbHNleyB0aGlzLm9wZW4oKTsgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIG9wZW4oKTp2b2lke1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmlzT3BlbmVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuYnRNZW51LmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXIuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHByaXZhdGUgY2xvc2UoKTp2b2lke1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmlzT3BlbmVkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmJ0TWVudS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBlbmVhYmxlKCk6dm9pZHtcbiAgICAgICAgICAgIC8vIHRoaXMuYnRNZW51LmNzcyh7bGVmdDogXCIwXCJ9KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBkaXNlYWJsZSgpOnZvaWR7XG4gICAgICAgICAgICAvLyB0aGlzLmJ0TWVudS5jc3Moe2xlZnQ6IFwiLTYwcHhcIn0pO1xuICAgICAgICB9XG4gICAgfVxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9jb21tb24vVmlldy50c1wiIC8+XG5cbm1vZHVsZSB2aWV3c3tcbiAgICBcbiAgICBleHBvcnQgY2xhc3MgSG9tZSBleHRlbmRzIGNvbW1vbi5WaWV3e1xuICAgICAgICBcbiAgICAgICAgYmluZCgpOnZvaWQge1xuICAgICAgICB9XG4gICAgfVxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy9ncmVlbnNvY2svZ3JlZW5zb2NrLmQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zL2pxdWVyeS9qcXVlcnkuZC50c1wiIC8+XG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9jb21tb24vUm91dGVyLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9jb21tb24vVmlld01hbmFnZXIudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2NvbW1vbi9WaWV3LnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9jb21tb24vTG9hZGVyLnRzXCIgLz5cblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImNvbXBvbmVudHMvTWFpbk1lbnUudHNcIiAvPlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwidmlld3MvSG9tZS50c1wiIC8+XG5cbm1vZHVsZSBpbmRleCB7XG4gICAgXG4gICAgaW1wb3J0IFJvdXRlciA9IGNvbW1vbi5Sb3V0ZXI7XG4gICAgaW1wb3J0IFZpZXdNYW5hZ2VyID0gY29tbW9uLlZpZXdNYW5hZ2VyO1xuICAgIGltcG9ydCBMb2FkZXIgPSBjb21tb24uTG9hZGVyO1xuICAgIC8vIGltcG9ydCBWaWV3ID0gY29tbW9uLlZpZXc7XG4gICAgXG4gICAgaW1wb3J0IE1haW5NZW51ID0gY29tcG9uZW50cy5NYWluTWVudTtcbiAgICBcbiAgICAvLyBpbXBvcnQgSG9tZVZpZXcgPSB2aWV3cy5Ib21lO1xuXG4gICAgZXhwb3J0IGVudW0gTWFpblZpZXdzIHtcbiAgICAgICAgLy8gSG9tZVZpZXcsXG4gICAgICAgIC8vIEFib3V0TWVWaWV3LFxuICAgICAgICAvLyBTb21lQ29kZVxuICAgIH1cblx0ZXhwb3J0IGNsYXNzIEluZGV4QXBwIHtcblx0XHRcbiAgICAgICAgcHJpdmF0ZSByb3V0ZXI6Um91dGVyO1xuICAgICAgICAvLyBwcml2YXRlIHZpZXdNYW5hZ2VyOlZpZXdNYW5hZ2VyO1xuICAgICAgICBwcml2YXRlIGxvYWRlcjpMb2FkZXI7XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIG1haW5NZW51Ok1haW5NZW51O1xuICAgICAgICBcbiAgICAgICAgLy8gcHJpdmF0ZSBIb21lVmlldzpIb21lVmlldztcbiAgICAgICAgLy8gcHJpdmF0ZSBBYm91dE1lVmlldzpWaWV3O1xuICAgICAgICAvLyBwcml2YXRlIFNvbWVDb2RlOlZpZXc7XG4gICAgICAgIFxuXHRcdGNvbnN0cnVjdG9yICgpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5yb3V0ZXIgPSBuZXcgUm91dGVyKCk7XG4gICAgICAgICAgICAvLyB0aGlzLnZpZXdNYW5hZ2VyID0gbmV3IFZpZXdNYW5hZ2VyKCk7XG4gICAgICAgICAgICB0aGlzLmxvYWRlciA9IG5ldyBMb2FkZXIoKTtcblx0XHR9XG5cblx0XHRpbml0ICgpOnZvaWQge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLm1haW5NZW51ID0gbmV3IE1haW5NZW51KCQoXCIjanMtbWFpbi1oZWFkZXJfX2J1dHRvblwiKSwgJChcIiNqcy1tYWluLWhlYWRlcl9fbmF2XCIpKTtcblx0XHRcdFxuICAgICAgICAgICAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcImEucGFnZS1sb2FkXCIsIChlOiBKUXVlcnlFdmVudE9iamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB2YXIgcGF0aCA9ICQoZS5jdXJyZW50VGFyZ2V0KS5hdHRyKFwiaHJlZlwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShwYXRoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnJvdXRlclxuICAgICAgICAgICAgICAgIC5hZGQoKCk9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZGVyLm9wZW4odGhpcy5yb3V0ZXIuZ2V0cGF0aG5hbWUoKSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAubGlzdGVuKCk7XG4gICAgICAgICAgICAvLyB0aGlzLnJvdXRlci5jaGVjaygpO1xuICAgICAgICB9XG5cdH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiZGVmaW5pdGlvbnMvZ3JlZW5zb2NrL2dyZWVuc29jay5kLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJkZWZpbml0aW9ucy9qcXVlcnkvanF1ZXJ5LmQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImluZGV4L0luZGV4QXBwLnRzXCIgLz5cblxuaW1wb3J0IEluZGV4QXBwID0gaW5kZXguSW5kZXhBcHA7XG52YXIgYXBwOiBJbmRleEFwcDtcbi8vICQoZnVuY3Rpb24oKSB7XG5cdFxuLy8gXHRhcHAgPSBuZXcgSW5kZXhBcHAoKTtcbi8vIFx0YXBwLmluaXQoKTtcbi8vIH0pO1xuXG5cbihmdW5jdGlvbigkOiBhbnkpIHtcbiAgICBhcHAgPSBuZXcgSW5kZXhBcHAoKTtcblx0YXBwLmluaXQoKTsgXG59KShqUXVlcnkpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
