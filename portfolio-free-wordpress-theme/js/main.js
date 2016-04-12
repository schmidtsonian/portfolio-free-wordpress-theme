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
            TweenLite.to(this.overlayBg, 0.05, { opacity: .2, onComplete: function () {
                    // FIX THIS!
                    _this.animateFillBar(1);
                    _this.body.stop().animate({ scrollTop: 0 }, '250', 'swing', function () {
                        TweenMax.to(_this.result, 0.05, { y: "100px", opacity: 0, onComplete: function () {
                                defer.resolve();
                            } });
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
/// <reference path="../definitions/greensock/greensock.d.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />
var common;
(function (common) {
    var FilterGrid = (function () {
        function FilterGrid() {
        }
        FilterGrid.prototype.init = function () {
            $(document).on("click", "a.filter-grid", function (e) {
                e.preventDefault();
                var target = $(e.currentTarget);
                var filter = target.data('filter');
                var terms = $("[data-terms]");
                $("a.filter-grid").removeClass("active");
                target.addClass("active");
                if (filter == 'all') {
                    terms.css({ "display": "block" });
                }
                else {
                    for (var index = 0; index < terms.length; index++) {
                        var selector = $(terms[index]);
                        var term = selector.data("terms");
                        if (term.indexOf(filter) <= -1) {
                            selector.css({ "display": "none" });
                        }
                        else {
                            selector.css({ "display": "block" });
                        }
                    }
                }
            });
        };
        return FilterGrid;
    }());
    common.FilterGrid = FilterGrid;
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
/// <reference path="../definitions/greensock/greensock.d.ts" />
/// <reference path="../definitions/jquery/jquery.d.ts" />
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
/// <reference path="../common/Loader.ts" />
/// <reference path="../common/FilterGrid.ts" />
/// <reference path="components/MainMenu.ts" />
/// <reference path="views/Home.ts" />
var index;
(function (index) {
    var Router = common.Router;
    var Loader = common.Loader;
    var FilterGrid = common.FilterGrid;
    var MainMenu = components.MainMenu;
    var IndexApp = (function () {
        function IndexApp() {
            this.router = new Router();
            this.loader = new Loader();
            this.filterGrid = new FilterGrid();
        }
        IndexApp.prototype.init = function () {
            var _this = this;
            this.mainMenu = new MainMenu($("#js-main-header__button"), $("#js-main-header__nav"));
            this.filterGrid.init();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9Sb3V0ZXIudHMiLCJjb21tb24vTG9hZGVyLnRzIiwiY29tbW9uL0ZpbHRlckdyaWQudHMiLCJpbmRleC9jb21wb25lbnRzL01haW5NZW51LnRzIiwiY29tbW9uL0lWaWV3LnRzIiwiY29tbW9uL1ZpZXcudHMiLCJpbmRleC92aWV3cy9Ib21lLnRzIiwiaW5kZXgvSW5kZXhBcHAudHMiLCJtYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILElBQU8sTUFBTSxDQXFMWjtBQXJMRCxXQUFPLE1BQU0sRUFBQyxDQUFDO0lBWVg7UUFPSTtZQUNJLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLGlCQUFpQjtRQUN2RCxDQUFDO1FBRU8sNkJBQVksR0FBcEIsVUFBcUIsSUFBWTtZQUM3QixNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNqRSxDQUFDO1FBR1A7OztXQUdHO1FBRUc7OztXQUdHO1FBQ0gsdUJBQU0sR0FBTixVQUFPLE9BQXdCO1lBQzNCLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLFNBQVMsR0FBRyxNQUFNLENBQUM7WUFDaEgsSUFBSSxDQUFDLElBQUksR0FBRyxPQUFPLElBQUksT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdB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UUFBUSxFQUFFLENBQUM7SUFDeEIsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ1osQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRnJvbSBoZXJlOlxuICogaHR0cDovL2tyYXNpbWlydHNvbmV2LmNvbS9ibG9nL2FydGljbGUvQS1tb2Rlcm4tSmF2YVNjcmlwdC1yb3V0ZXItaW4tMTAwLWxpbmVzLWhpc3RvcnktYXBpLXB1c2hTdGF0ZS1oYXNoLXVybFxuICovXG5cbm1vZHVsZSBjb21tb24ge1xuXG4gICAgZXhwb3J0IGludGVyZmFjZSBJUm91dGVyT3B0aW9ucyB7XG4gICAgICAgIG1vZGU/OiBzdHJpbmc7XG4gICAgICAgIHJvb3Q/OiBzdHJpbmc7XG4gICAgfVxuXG4gICAgaW50ZXJmYWNlIElSb3V0ZXJBZGRBcmdzIHtcbiAgICAgICAgcm91dGU6IFJlZ0V4cDtcbiAgICAgICAgaGFuZGxlcjogKCkgPT4gdm9pZDtcbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3MgUm91dGVyIHtcblxuICAgICAgICBwcml2YXRlIG1vZGU6IHN0cmluZztcbiAgICAgICAgcHJpdmF0ZSByb290OiBzdHJpbmc7XG4gICAgICAgIHByaXZhdGUgcm91dGVzOiBJUm91dGVyQWRkQXJnc1tdO1xuXG4gICAgICAgIHByaXZhdGUgaW50ZXJ2YWw6IG51bWJlcjtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICB0aGlzLnJvdXRlcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5jb25maWcoeyBtb2RlOiAnaGlzdG9yeScgfSk7IC8vIERlZmF1bHQgQ29uZmlnXG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIGNsZWFyU2xhc2hlcyhwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICAgICAgcmV0dXJuIHBhdGgudG9TdHJpbmcoKS5yZXBsYWNlKC9cXC8kLywgJycpLnJlcGxhY2UoL15cXC8vLCAnJyk7XG4gICAgICAgIH1cblxuXG5cdFx0LyoqXG5cdFx0ICogUFVCTElDIEFQSVxuXHRcdCAqID09PT09PT09PT1cblx0XHQgKi9cbiAgICAgICAgXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHtJUm91dGVyT3B0aW9uc30gb3B0aW9ucz9cbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICBjb25maWcob3B0aW9ucz86IElSb3V0ZXJPcHRpb25zKTogUm91dGVyIHtcbiAgICAgICAgICAgIHRoaXMubW9kZSA9IG9wdGlvbnMgJiYgb3B0aW9ucy5tb2RlICYmIG9wdGlvbnMubW9kZSA9PT0gJ2hpc3RvcnknICYmICEhKGhpc3RvcnkucHVzaFN0YXRlKSA/ICdoaXN0b3J5JyA6ICdoYXNoJztcbiAgICAgICAgICAgIHRoaXMucm9vdCA9IG9wdGlvbnMgJiYgb3B0aW9ucy5yb290ICYmIG9wdGlvbnMucm9vdCA/ICcvJyArIHRoaXMuY2xlYXJTbGFzaGVzKG9wdGlvbnMucm9vdCkgKyAnLycgOiAnLyc7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7c3RyaW5nfSByb3V0ZT9cbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICBjaGVjayhyb3V0ZT86IHN0cmluZyk6IFJvdXRlciB7XG4gICAgICAgICAgICB2YXIgZnJhZ21lbnQgPSByb3V0ZSB8fCB0aGlzLmdldHBhdGhuYW1lKCk7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoaXMucm91dGVzLmV2ZXJ5KChyLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIG1hdGNoID0gZnJhZ21lbnQubWF0Y2goci5yb3V0ZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2guc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgci5oYW5kbGVyLmFwcGx5KHt9LCBtYXRjaCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZXR1cm5zIHN0cmluZ1xuICAgICAgICAgKi9cbiAgICAgICAgZ2V0cGF0aG5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgICAgIHZhciBmcmFnbWVudCA9ICcnO1xuICAgICAgICAgICAgaWYgKHRoaXMubW9kZSA9PT0gJ2hpc3RvcnknKSB7XG4gICAgICAgICAgICAgICAgZnJhZ21lbnQgPSB0aGlzLmNsZWFyU2xhc2hlcyhkZWNvZGVVUkkobG9jYXRpb24ucGF0aG5hbWUgKyBsb2NhdGlvbi5zZWFyY2gpKTtcbiAgICAgICAgICAgICAgICBmcmFnbWVudCA9IGZyYWdtZW50LnJlcGxhY2UoL1xcPyguKikkLywgJycpO1xuICAgICAgICAgICAgICAgIGZyYWdtZW50ID0gdGhpcy5yb290ICE9ICcvJyA/IGZyYWdtZW50LnJlcGxhY2UodGhpcy5yb290LCAnJykgOiBmcmFnbWVudDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIG1hdGNoID0gd2luZG93LmxvY2F0aW9uLmhyZWYubWF0Y2goLyMoLiopJC8pO1xuICAgICAgICAgICAgICAgIGZyYWdtZW50ID0gbWF0Y2ggPyBtYXRjaFsxXSA6ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2xlYXJTbGFzaGVzKGZyYWdtZW50KTtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7KCk9PnZvaWR9IGhhbmRsZXJcbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICBhZGQoaGFuZGxlcjogKCkgPT4gdm9pZCk6IFJvdXRlcjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge1JlZ0V4cH0gcm91dGVcbiAgICAgICAgICogQHBhcmFtICB7KCk9PnZvaWR9IGhhbmRsZXJcbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICBhZGQocm91dGU6IFJlZ0V4cCwgaGFuZGxlcjogKCkgPT4gdm9pZCk6IFJvdXRlcjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge2FueX0gcGFyYW1cbiAgICAgICAgICogQHBhcmFtICB7KCk9PnZvaWR9IGhhbmRsZXI/XG4gICAgICAgICAqIEByZXR1cm5zIFJvdXRlclxuICAgICAgICAgKi9cbiAgICAgICAgYWRkKHBhcmFtOiBhbnksIGhhbmRsZXI/OiAoKSA9PiB2b2lkKTogUm91dGVyIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyYW0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvdXRlcy5wdXNoKHsgcm91dGU6IDxhbnk+JycsIGhhbmRsZXI6IHBhcmFtIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvdXRlcy5wdXNoKHsgcm91dGU6IHBhcmFtLCBoYW5kbGVyOiBoYW5kbGVyIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7KCk9PnZvaWR9IGhhbmRsZXJcbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICByZW1vdmUoaGFuZGxlcjogKCkgPT4gdm9pZCk6IFJvdXRlcjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge3N0cmluZ3xSZWdFeHB9IHJvdXRlXG4gICAgICAgICAqIEByZXR1cm5zIFJvdXRlclxuICAgICAgICAgKi9cbiAgICAgICAgcmVtb3ZlKHJvdXRlOiBzdHJpbmcgfCBSZWdFeHApOiBSb3V0ZXI7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0gIHthbnl9IHBhcmFtXG4gICAgICAgICAqIEByZXR1cm5zIFJvdXRlclxuICAgICAgICAgKi9cbiAgICAgICAgcmVtb3ZlKHBhcmFtOiBhbnkpOiBSb3V0ZXIge1xuICAgICAgICAgICAgdGhpcy5yb3V0ZXMuZXZlcnkoKHJvdXRlLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJvdXRlLmhhbmRsZXIgPT09IHBhcmFtIHx8IHJvdXRlLnJvdXRlLnRvU3RyaW5nKCkgPT09IHBhcmFtLnRvU3RyaW5nKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yb3V0ZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBmbHVzaCgpOiBSb3V0ZXIge1xuICAgICAgICAgICAgdGhpcy5yb3V0ZXMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMuY29uZmlnKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgbGlzdGVuKCk6IFJvdXRlciB7XG4gICAgICAgICAgICB2YXIgY3VycmVudCA9IHRoaXMuZ2V0cGF0aG5hbWUoKTtcblxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKTtcblxuICAgICAgICAgICAgdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudCAhPT0gdGhpcy5nZXRwYXRobmFtZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnQgPSB0aGlzLmdldHBhdGhuYW1lKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hlY2soY3VycmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgNTApO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIG5hdmlnYXRlKCk6IFJvdXRlcjtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge3N0cmluZ30gcm91dGVcbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICBuYXZpZ2F0ZShyb3V0ZTogc3RyaW5nKTogUm91dGVyO1xuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtICB7c3RyaW5nfSByb3V0ZT9cbiAgICAgICAgICogQHJldHVybnMgUm91dGVyXG4gICAgICAgICAqL1xuICAgICAgICBuYXZpZ2F0ZShyb3V0ZT86IHN0cmluZyk6IFJvdXRlciB7XG4gICAgICAgICAgICByb3V0ZSA9IHJvdXRlIHx8ICcnO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5tb2RlID09PSAnaGlzdG9yeScpIHtcbiAgICAgICAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBudWxsLCB0aGlzLnJvb3QgKyB0aGlzLmNsZWFyU2xhc2hlcyhyb3V0ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZi5tYXRjaCgvIyguKikkLyk7XG4gICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZi5yZXBsYWNlKC8jKC4qKSQvLCAnJykgKyAnIycgKyByb3V0ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMvZ3JlZW5zb2NrL2dyZWVuc29jay5kLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy9qcXVlcnkvanF1ZXJ5LmQudHNcIiAvPlxuXG5cbi8vIFRPLURPOlxuLy8gQ2xlYW4gYW5pbWF0aW9uc1xuLy8gQW5pbWF0aW9ucyB3aXRoIEdTQVBcbi8vIFNlcGFyYXRlIGxvYWRlciBpbWFnZXMgdG8gYW5vdGhlciBjbGFzc1xubW9kdWxlIGNvbW1vbntcbiAgICBcbiAgICBleHBvcnQgY2xhc3MgTG9hZGVyIHtcbiAgICAgICAgXG4gICAgICAgIHByaXZhdGUgY29udGFpbmVyOiBzdHJpbmc7XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIHJlc3VsdDogSlF1ZXJ5O1xuICAgICAgICBwcml2YXRlIG92ZXJsYXk6IEpRdWVyeTtcbiAgICAgICAgcHJpdmF0ZSBvdmVybGF5QmFyOiBKUXVlcnk7XG4gICAgICAgIHByaXZhdGUgb3ZlcmxheUJnOiBKUXVlcnk7XG4gICAgICAgIHByaXZhdGUgYm9keTogSlF1ZXJ5O1xuICAgICAgICBcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyID0gJyNqcy1tYWluLWNvbnRhaW5lcic7XG4gICAgICAgICAgICB0aGlzLnJlc3VsdCA9ICQoICcjanMtcmVzJyApO1xuICAgICAgICAgICAgdGhpcy5vdmVybGF5ID0gJCggJyNqcy1vdmVybGF5LWxvYWRlcicgKTtcbiAgICAgICAgICAgIHRoaXMub3ZlcmxheUJhciA9ICQoICcjanMtb3ZlcmxheS1sb2FkZXItLWJhcicgKTtcbiAgICAgICAgICAgIHRoaXMub3ZlcmxheUJnID0gJCggJyNqcy1vdmVybGF5LWxvYWRlci0tYmcnICk7XG4gICAgICAgICAgICB0aGlzLmJvZHkgPSAkKCAnYm9keScgKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHJpdmF0ZSBhbmltYXRlT3BlbigpIDogSlF1ZXJ5UHJvbWlzZTx7fT4ge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgZGVmZXIgPSAkLkRlZmVycmVkKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgVHdlZW5NYXgua2lsbFR3ZWVuc09mKCB0aGlzLm92ZXJsYXlCYXIgKTtcbiAgICAgICAgICAgIHRoaXMuYm9keS5jc3MoIHsgJ292ZXJmbG93JzogJ2hpZGRlbicgfSApO1xuICAgICAgICAgICAgVHdlZW5NYXguc2V0KCB0aGlzLm92ZXJsYXlCYXIsIHsgd2lkdGg6IDAsIHk6IDAgfSApO1xuICAgICAgICAgICAgVHdlZW5NYXguc2V0KCB0aGlzLm92ZXJsYXksIHsgbGVmdDogMCB9ICk7XG5cbiAgICAgICAgICAgIFR3ZWVuTGl0ZS50byh0aGlzLm92ZXJsYXlCZywgMC4wNSwge29wYWNpdHk6IC4yLCBvbkNvbXBsZXRlOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIEZJWCBUSElTIVxuICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0ZUZpbGxCYXIoIDEgKTsgXG4gICAgICAgICAgICAgICAgdGhpcy5ib2R5LnN0b3AoKS5hbmltYXRlKHtzY3JvbGxUb3A6MH0sICcyNTAnLCAnc3dpbmcnLCAoKSA9PiB7IFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBUd2Vlbk1heC50byggdGhpcy5yZXN1bHQsIDAuMDUsIHsgeTogXCIxMDBweFwiLCBvcGFjaXR5OiAwLCBvbkNvbXBsZXRlOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlKCk7IFxuICAgICAgICAgICAgICAgICAgICB9IH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9fSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBkZWZlci5wcm9taXNlKCk7ICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIGFuaW1hdGVDbG9zZSgpIDogSlF1ZXJ5UHJvbWlzZTx7fT4ge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgZGVmZXIgPSAkLkRlZmVycmVkKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5hbmltYXRlRmlsbEJhciggMTAwIClcbiAgICAgICAgICAgICAgICAudGhlbiggKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgICAgIFR3ZWVuTGl0ZS50byggdGhpcy5vdmVybGF5QmcsIDAuMjUsIHtvcGFjaXR5OiAwIH0pO1xuICAgICAgICAgICAgICAgICAgICBUd2VlbkxpdGUudG8oIHRoaXMub3ZlcmxheUJhciwgMC4yNSwge3k6IFwiLTYwcHhcIiB9ICk7XG4gICAgICAgICAgICAgICAgICAgIFR3ZWVuTGl0ZS50byggdGhpcy5yZXN1bHQsIDAuMjUsIHsgZGVsYXk6IDAuMzUsIHk6IDAsIG9wYWNpdHk6IDEsIG9uQ29tcGxldGU6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIFR3ZWVuTWF4LnNldCggdGhpcy5vdmVybGF5LCB7IGxlZnQ6ICctMTAwJScgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ib2R5LmNzcyggeyAnb3ZlcmZsb3cnOiAnYXV0bycgfSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZSgpOyBcbiAgICAgICAgICAgICAgICAgICAgfSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgIFxuICAgICAgICAgICAgcmV0dXJuIGRlZmVyLnByb21pc2UoKTsgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHByaXZhdGUgYW5pbWF0ZUZpbGxCYXIgKHRvUGVyY2VudDogbnVtYmVyKSA6IEpRdWVyeVByb21pc2U8e30+IHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGRlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBUd2Vlbk1heC5raWxsVHdlZW5zT2YoIHRoaXMub3ZlcmxheUJhciApO1xuICAgICAgICAgICAgVHdlZW5MaXRlLnRvKCB0aGlzLm92ZXJsYXlCYXIsIDAuMjUsIHt3aWR0aDogdG9QZXJjZW50ICsgXCIlXCIsIG9uQ29tcGxldGU6IGRlZmVyLnJlc29sdmUgfSApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZSgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIHByb2Nlc3NJbWFnZXMgKCkgOiBKUXVlcnlQcm9taXNlPHt9PiB7XG4gICAgICAgICAgICB2YXIgZGVmZXIgPSAkLkRlZmVycmVkKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBpbWFnZXMgPSB0aGlzLnJlc3VsdC5maW5kKCAnW2RhdGEtbG9hZF0nKTtcbiAgICAgICAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKGltYWdlcy5sZW5ndGggPT0gMCl7XG4gICAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGltYWdlcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgc3JjID0gJCggaW1hZ2VzW2luZGV4XSApLmRhdGEoXCJsb2FkXCIpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgICAgICBpbWcuc3JjID0gc3JjO1xuICAgICAgICAgICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7IFxuICAgICAgICAgICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGVGaWxsQmFyKCAoY291bnQvaW1hZ2VzLmxlbmd0aCApICogMTAwICk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiggY291bnQgPj0gaW1hZ2VzLmxlbmd0aCApe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpbWcub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgaWYoIGNvdW50ID49IGltYWdlcy5sZW5ndGggKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVyLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZSgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIGxvYWQoIHBhdGg6IHN0cmluZyApIDogSlF1ZXJ5UHJvbWlzZTx7fT4ge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB2YXIgZGVmZXIgPSAkLkRlZmVycmVkKCk7XG4gICAgICAgICAgICB0aGlzLnJlc3VsdC5sb2FkKCBcIi9cIiArIHBhdGggKyAnICcgKyB0aGlzLmNvbnRhaW5lciwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMucHJvY2Vzc0ltYWdlcygpLnRoZW4oIGRlZmVyLnJlc29sdmUgKTsgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBkZWZlci5wcm9taXNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIG9wZW4gKCBwYXRoOiBzdHJpbmcgKSA6IHZvaWQge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGVPcGVuKClcbiAgICAgICAgICAgICAgICAudGhlbiggdGhpcy5sb2FkLmJpbmQoIHRoaXMsIHBhdGggKSlcbiAgICAgICAgICAgICAgICAudGhlbiggdGhpcy5hbmltYXRlQ2xvc2UuYmluZCggdGhpcyApICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfVxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy9ncmVlbnNvY2svZ3JlZW5zb2NrLmQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zL2pxdWVyeS9qcXVlcnkuZC50c1wiIC8+XG5cbm1vZHVsZSBjb21tb24ge1xuICAgIFxuICAgIGV4cG9ydCBjbGFzcyBGaWx0ZXJHcmlkIHtcbiAgICAgICBcbiAgICAgICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgICAgICAgIFxuICAgICAgIH1cbiAgICAgICBcbiAgICAgICBpbml0ICgpIDogdm9pZCB7XG4gICAgICAgICAgIFxuICAgICAgICAgICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiYS5maWx0ZXItZ3JpZFwiLCAoZTogSlF1ZXJ5RXZlbnRPYmplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gJCggZS5jdXJyZW50VGFyZ2V0ICk7XG4gICAgICAgICAgICAgICAgdmFyIGZpbHRlciA9IHRhcmdldC5kYXRhKCdmaWx0ZXInKTtcbiAgICAgICAgICAgICAgICB2YXIgdGVybXMgPSAkKFwiW2RhdGEtdGVybXNdXCIpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICQoXCJhLmZpbHRlci1ncmlkXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgICAgIHRhcmdldC5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiggZmlsdGVyID09ICdhbGwnKXtcbiAgICAgICAgICAgICAgICAgICAgdGVybXMuY3NzKHtcImRpc3BsYXlcIjogXCJibG9ja1wifSk7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCB0ZXJtcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3RvciA9ICQodGVybXNbaW5kZXhdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0ZXJtID0gc2VsZWN0b3IuZGF0YShcInRlcm1zXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYodGVybS5pbmRleE9mKCBmaWx0ZXIgKSA8PSAtMSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IuY3NzKHtcImRpc3BsYXlcIjogXCJub25lXCJ9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yLmNzcyh7XCJkaXNwbGF5XCI6IFwiYmxvY2tcIn0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgfVxuICAgIH1cbn0iLCJtb2R1bGUgY29tcG9uZW50cyB7XG4gICAgXG4gICAgZXhwb3J0IGNsYXNzIE1haW5NZW51IHtcbiAgICAgICAgXG4gICAgICAgIHByaXZhdGUgYnRNZW51OiBKUXVlcnk7XG4gICAgICAgIHByaXZhdGUgYnRMaW5rczogSlF1ZXJ5O1xuICAgICAgICBwcml2YXRlIGNvbnRhaW5lcjogSlF1ZXJ5O1xuICAgICAgICBcbiAgICAgICAgcHJpdmF0ZSBpc09wZW5lZDpib29sZWFuO1xuICAgICAgICBcbiAgICAgICAgY29uc3RydWN0b3IoYnQ6IEpRdWVyeSwgY29udGFpbmVyOiBKUXVlcnkpe1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmJ0TWVudSA9IGJ0O1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXIgPSBjb250YWluZXI7XG4gICAgICAgICAgICB0aGlzLmJ0TGlua3MgPSAkKFwiYS5wYWdlLWxvYWRcIiwgdGhpcy5jb250YWluZXIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmlzT3BlbmVkID0gZmFsc2U7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuYmluZCgpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIGJpbmQoKTp2b2lke1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmJ0TWVudS5vbihcImNsaWNrXCIsIHRoaXMudG9vZ2xlU3RhdGUuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB0aGlzLmJ0TGlua3Mub24oXCJjbGlja1wiLCB0aGlzLmNsb3NlLmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIHRvb2dsZVN0YXRlKCk6IHZvaWR7XG4gICAgICAgICAgICBpZih0aGlzLmlzT3BlbmVkKXsgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgICAgfWVsc2V7IHRoaXMub3BlbigpOyB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHByaXZhdGUgb3BlbigpOnZvaWR7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuaXNPcGVuZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5idE1lbnUuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcHJpdmF0ZSBjbG9zZSgpOnZvaWR7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuaXNPcGVuZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuYnRNZW51LnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXIucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGVuZWFibGUoKTp2b2lke1xuICAgICAgICAgICAgLy8gdGhpcy5idE1lbnUuY3NzKHtsZWZ0OiBcIjBcIn0pO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGRpc2VhYmxlKCk6dm9pZHtcbiAgICAgICAgICAgIC8vIHRoaXMuYnRNZW51LmNzcyh7bGVmdDogXCItNjBweFwifSk7XG4gICAgICAgIH1cbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL2RlZmluaXRpb25zL2dyZWVuc29jay9ncmVlbnNvY2suZC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMvanF1ZXJ5L2pxdWVyeS5kLnRzXCIgLz5cblxuXG5tb2R1bGUgY29tbW9ue1xuXG4gICAgZXhwb3J0IGludGVyZmFjZSBJVmlldyB7XG4gICAgICAgIG9wZW4oKTpKUXVlcnlQcm9taXNlPHt9PjtcbiAgICAgICAgY2xvc2UoKTpKUXVlcnlQcm9taXNlPHt9PjtcbiAgICAgICAgaXNPcGVuOmJvb2xlYW47XG4gICAgfVxufVxuIiwiXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiSVZpZXcudHNcIiAvPlxuXG5tb2R1bGUgY29tbW9uIHtcblxuICAgIGltcG9ydCBJVmlldyA9IGNvbW1vbi5JVmlldztcbiAgICBcbiAgICBleHBvcnQgY2xhc3MgVmlldyBpbXBsZW1lbnRzIElWaWV3IHtcblxuICAgICAgICBwcml2YXRlIF9pc09wZW46IGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgXG4gICAgICAgIHByaXZhdGUgdGFyZ2V0OnN0cmluZztcbiAgICAgICAgcHJpdmF0ZSAkcmVzdWx0OkpRdWVyeTtcbiAgICAgICAgLy8gcHVibGljIHRhcmdldDogSFRNTEVsZW1lbnQ7XG5cbiAgICAgICAgY29uc3RydWN0b3IodGFyZ2V0OnN0cmluZywgJHJlc3VsdDpKUXVlcnkpIHtcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgICAgICAgICAgdGhpcy4kcmVzdWx0ID0gJHJlc3VsdDtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldCBpc09wZW4oKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9pc09wZW47IH1cblxuICAgICAgICBvcGVuKCk6IEpRdWVyeVByb21pc2U8e30+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwib3BlbiEhIVwiLCB0aGlzLnRhcmdldCwgdGhpcy4kcmVzdWx0KVxuICAgICAgICAgICAgdmFyIGRlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLiRyZXN1bHRcbiAgICAgICAgICAgICAgICAubG9hZCh0aGlzLnRhcmdldCwgKCk9PntcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faXNPcGVuID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgVHdlZW5NYXgudG8odGhpcy4kcmVzdWx0LCAuNDUsIHtsZWZ0OiAwLCBlYXNlOiBDdWJpYy5lYXNlSW4sIG9uQ29tcGxldGU6ICgpPT57XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW50cm8oZGVmZXIpO1xuICAgICAgICAgICAgICAgICAgICB9fSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xvc2UoKTogSlF1ZXJ5UHJvbWlzZTx7fT4ge1xuICAgICAgICAgICAgdmFyIGRlZmVyID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLnVuYmluZCgpO1xuICAgICAgICAgICAgdGhpcy5faXNPcGVuID0gZmFsc2U7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFR3ZWVuTWF4LnRvKCB0aGlzLiRyZXN1bHQsIC40NSwge2xlZnQ6IFwiLTEwMCVcIiwgZWFzZTogQ3ViaWMuZWFzZU91dCwgb25Db21wbGV0ZTooKT0+e1xuICAgICAgICAgICAgICAgIHRoaXMuJHJlc3VsdC5zY3JvbGxUb3AoMCk7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXBhcnR1cmUoZGVmZXIpOyBcbiAgICAgICAgICAgIH19ICk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIGRlZmVyLnByb21pc2UoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge0pRdWVyeURlZmVycmVkPHt9Pn0gZFxuICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAqL1xuICAgICAgICBwcm90ZWN0ZWQgaW50cm8oZDogSlF1ZXJ5RGVmZXJyZWQ8e30+KTogdm9pZCB7IFxuICAgICAgICAgICAgdGhpcy5iaW5kKCk7IFxuICAgICAgICAgICAgZC5yZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSAge0pRdWVyeURlZmVycmVkPHt9Pn0gZFxuICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAqL1xuICAgICAgICBwcm90ZWN0ZWQgZGVwYXJ0dXJlKGQ6IEpRdWVyeURlZmVycmVkPHt9Pik6IHZvaWQge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBkLnJlc29sdmUoKTsgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGJpbmQoKTp2b2lkIHsgfVxuICAgICAgICBwcm90ZWN0ZWQgdW5iaW5kKCk6dm9pZCB7IH1cbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vY29tbW9uL1ZpZXcudHNcIiAvPlxuXG5tb2R1bGUgdmlld3N7XG4gICAgXG4gICAgZXhwb3J0IGNsYXNzIEhvbWUgZXh0ZW5kcyBjb21tb24uVmlld3tcbiAgICAgICAgXG4gICAgICAgIGJpbmQoKTp2b2lkIHtcbiAgICAgICAgfVxuICAgIH1cbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vZGVmaW5pdGlvbnMvZ3JlZW5zb2NrL2dyZWVuc29jay5kLnRzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9kZWZpbml0aW9ucy9qcXVlcnkvanF1ZXJ5LmQudHNcIiAvPlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY29tbW9uL1JvdXRlci50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY29tbW9uL0xvYWRlci50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vY29tbW9uL0ZpbHRlckdyaWQudHNcIiAvPlxuXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiY29tcG9uZW50cy9NYWluTWVudS50c1wiIC8+XG5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ2aWV3cy9Ib21lLnRzXCIgLz5cblxubW9kdWxlIGluZGV4IHtcbiAgICBcbiAgICBpbXBvcnQgUm91dGVyID0gY29tbW9uLlJvdXRlcjtcbiAgICBpbXBvcnQgTG9hZGVyID0gY29tbW9uLkxvYWRlcjtcbiAgICBpbXBvcnQgRmlsdGVyR3JpZCA9IGNvbW1vbi5GaWx0ZXJHcmlkO1xuICAgIFxuICAgIGltcG9ydCBNYWluTWVudSA9IGNvbXBvbmVudHMuTWFpbk1lbnU7XG4gICAgXG4gICAgXG5cdGV4cG9ydCBjbGFzcyBJbmRleEFwcCB7XG5cdFx0XG4gICAgICAgIHByaXZhdGUgcm91dGVyOlJvdXRlcjtcbiAgICAgICAgcHJpdmF0ZSBsb2FkZXI6TG9hZGVyO1xuICAgICAgICBwcml2YXRlIGZpbHRlckdyaWQ6RmlsdGVyR3JpZDtcbiAgICAgICAgXG4gICAgICAgIHByaXZhdGUgbWFpbk1lbnU6TWFpbk1lbnU7XG4gICAgICAgIFxuXHRcdGNvbnN0cnVjdG9yICgpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5yb3V0ZXIgPSBuZXcgUm91dGVyKCk7XG4gICAgICAgICAgICB0aGlzLmxvYWRlciA9IG5ldyBMb2FkZXIoKTtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyR3JpZCA9IG5ldyBGaWx0ZXJHcmlkKCk7XG5cdFx0fVxuXG5cdFx0aW5pdCAoKTp2b2lkIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5tYWluTWVudSA9IG5ldyBNYWluTWVudSgkKFwiI2pzLW1haW4taGVhZGVyX19idXR0b25cIiksICQoXCIjanMtbWFpbi1oZWFkZXJfX25hdlwiKSk7XG5cdFx0XHR0aGlzLmZpbHRlckdyaWQuaW5pdCgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiYS5wYWdlLWxvYWRcIiwgKGU6IEpRdWVyeUV2ZW50T2JqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHZhciBwYXRoID0gJChlLmN1cnJlbnRUYXJnZXQpLmF0dHIoXCJocmVmXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKHBhdGgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMucm91dGVyXG4gICAgICAgICAgICAgICAgLmFkZCgoKT0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkZXIub3Blbih0aGlzLnJvdXRlci5nZXRwYXRobmFtZSgpKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5saXN0ZW4oKTtcbiAgICAgICAgICAgIC8vIHRoaXMucm91dGVyLmNoZWNrKCk7XG4gICAgICAgIH1cblx0fVxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJkZWZpbml0aW9ucy9ncmVlbnNvY2svZ3JlZW5zb2NrLmQudHNcIiAvPlxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImRlZmluaXRpb25zL2pxdWVyeS9qcXVlcnkuZC50c1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiaW5kZXgvSW5kZXhBcHAudHNcIiAvPlxuXG5pbXBvcnQgSW5kZXhBcHAgPSBpbmRleC5JbmRleEFwcDtcbnZhciBhcHA6IEluZGV4QXBwO1xuLy8gJChmdW5jdGlvbigpIHtcblx0XG4vLyBcdGFwcCA9IG5ldyBJbmRleEFwcCgpO1xuLy8gXHRhcHAuaW5pdCgpO1xuLy8gfSk7XG5cblxuKGZ1bmN0aW9uKCQ6IGFueSkge1xuICAgIGFwcCA9IG5ldyBJbmRleEFwcCgpO1xuXHRhcHAuaW5pdCgpOyBcbn0pKGpRdWVyeSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
