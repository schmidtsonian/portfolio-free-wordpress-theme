/// <reference path="IView.ts" />

module common {

    import IView = common.IView;

    export class ViewManager {

        private views: Array<IView> = [];
        currentView: IView = null;

        addView = (id: number, view: IView) => {
            this.views[id] = view;
        };
        /**
         * @param  {number} id
         * @returns IView
         */
        getViewById(id: number): IView {
            return this.views[id];
        }
        /**
         * @param  {number} id
         * @returns boolean
         */
        isViewOpen(id: number): boolean {
            return this.getViewById(id).isOpen;
        }
        /**
         * @param  {number} id
         * @returns JQueryPromise
         */
        closeView(id: number): JQueryPromise<{}> {
            var view = this.getViewById(id);
            view.isOpen = false;
            return view.close();
        }
        /**
         * @param  {number} id
         * @returns JQueryPromise
         */
        openView = (id: number): JQueryPromise<{}> => {

            var defer = $.Deferred();

            if (this.currentView != null && (this.getViewById(id) === this.currentView)) {
                var defer = $.Deferred();
                defer.resolve();

                return defer.promise();
            }

            if (this.currentView != null) {

                return this.currentView.close()
                    .then(() => {
                        this.currentView = this.getViewById(id);
                        return this.currentView.open();
                    })
            }
            this.currentView = this.getViewById(id);
            return this.currentView.open();
        };

        closeCurrentView = (): JQueryPromise<{}> => {

            if (this.currentView != null) {
                var activeView = this.currentView;
                this.currentView = null;
                return activeView.close();
            }
        };

        reset(): void {

            this.currentView = null;
        }
    }
}
