/**
 * From here:
 * http://krasimirtsonev.com/blog/article/A-modern-JavaScript-router-in-100-lines-history-api-pushState-hash-url
 */

module common {

    export interface IRouterOptions {
        mode?: string;
        root?: string;
    }

    interface IRouterAddArgs {
        route: RegExp;
        handler: () => void;
    }

    export class Router {

        private mode: string;
        private root: string;
        private routes: IRouterAddArgs[];

        private interval: number;
        constructor() {
            this.routes = [];
            this.config({ mode: 'history' }); // Default Config
        }

        private clearSlashes(path: string): string {
            return path.toString().replace(/\/$/, '').replace(/^\//, '');
        }


		/**
		 * PUBLIC API
		 * ==========
		 */
        
        /**
         * @param  {IRouterOptions} options?
         * @returns Router
         */
        config(options?: IRouterOptions): Router {
            this.mode = options && options.mode && options.mode === 'history' && !!(history.pushState) ? 'history' : 'hash';
            this.root = options && options.root && options.root ? '/' + this.clearSlashes(options.root) + '/' : '/';

            return this;
        }
        
        /**
         * @param  {string} route?
         * @returns Router
         */
        check(route?: string): Router {
            var fragment = route || this.getpathname();
            var self = this;

            this.routes.every((r, i) => {
                var match = fragment.match(r.route);

                if (match) {
                    match.shift();
                    r.handler.apply({}, match);

                    return false;
                }

                return true
            });

            return this;
        }
        /**
         * @returns string
         */
        getpathname(): string {
            var fragment = '';
            if (this.mode === 'history') {
                fragment = this.clearSlashes(decodeURI(location.pathname + location.search));
                fragment = fragment.replace(/\?(.*)$/, '');
                fragment = this.root != '/' ? fragment.replace(this.root, '') : fragment;
            } else {
                var match = window.location.href.match(/#(.*)$/);
                fragment = match ? match[1] : '';
            }
            return this.clearSlashes(fragment);
        }
        /**
         * @param  {()=>void} handler
         * @returns Router
         */
        add(handler: () => void): Router;
        /**
         * @param  {RegExp} route
         * @param  {()=>void} handler
         * @returns Router
         */
        add(route: RegExp, handler: () => void): Router;
        /**
         * @param  {any} param
         * @param  {()=>void} handler?
         * @returns Router
         */
        add(param: any, handler?: () => void): Router {
            if (typeof param === 'function') {
                this.routes.push({ route: <any>'', handler: param });
            } else {
                this.routes.push({ route: param, handler: handler });
            }

            return this;
        }
        /**
         * @param  {()=>void} handler
         * @returns Router
         */
        remove(handler: () => void): Router;
        /**
         * @param  {string|RegExp} route
         * @returns Router
         */
        remove(route: string | RegExp): Router;
        /**
         * @param  {any} param
         * @returns Router
         */
        remove(param: any): Router {
            this.routes.every((route, i) => {
                if (route.handler === param || route.route.toString() === param.toString()) {
                    this.routes.splice(i, 1);
                    return false;
                }

                return true;
            });

            return this;
        }

        flush(): Router {
            this.routes = [];
            this.config();

            return this;
        }

        listen(): Router {
            var current = this.getpathname();

            clearInterval(this.interval);

            this.interval = setInterval(() => {
                if (current !== this.getpathname()) {
                    current = this.getpathname();
                    this.check(current);
                }
            }, 50);

            return this;
        }

        navigate(): Router;
        /**
         * @param  {string} route
         * @returns Router
         */
        navigate(route: string): Router;
        /**
         * @param  {string} route?
         * @returns Router
         */
        navigate(route?: string): Router {
            route = route || '';

            if (this.mode === 'history') {
                history.pushState(null, null, this.root + this.clearSlashes(route));
            }
            else {
                location.href.match(/#(.*)$/);
                location.href.replace(/#(.*)$/, '') + '#' + route;
            }

            return this;
        }
    }
}
