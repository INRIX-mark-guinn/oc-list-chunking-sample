define(function (require) {
    'use strict';

    const
        ModuleView = require('common/platform/ModuleView'),
        IDA = require('common/InternetDataAccessAPI'),
        Button = require('common/ui/Button'),
        Pane = require('common/ui/Pane'),
        ListControl = require('common/ui/ListControl');

    /**
     *
     * @param {int} [start]
     * @param {int} [limit]
     * @returns {Promise.<Object>}
     */
    function fetchSomeRepos(start = 0, limit = 5) {
        let page = Math.floor(start / limit) + 1;
        return IDA.fetch(`https://api.github.com/search/repositories?sort=starts&order=desc&q=created:>2016-01-01&per_page=${limit}&page=${page}`).then(response => {
            return {
                totalCount: response.data.total_count,
                data: response.data.items.map(item => {
                    return {
                        text: [item.full_name, item.description],
                        icon: item.owner.avatar_url,
                    };
                })
            };
        });
    }

    /**
     * This is the application's root view, which is used for any UI control creation and handling.
     *
     * Note that functions defined in the controller may be called via this.getController()
     * Functions declared in this view class may also be called from the controller.
     * Functions designed to be called from the controller must return a Promise.
     *
     * @see Application Lifecycle {@link https://insidetrack.opencar.com/documentation/2.2/lifecycle}
     * @see Views & Controllers {@link https://insidetrack.opencar.com/documentation/2.2/controllers_and_views}
     * @see Promises {@link https://insidetrack.opencar.com/documentation/2.2/promises}
     */
    return class extends ModuleView {

        /**
         * Controller and View are now linked
         *
         * @async
         * @override super.beforeStart
         * @returns {Promise}
         */
        beforeStart () {
            return super.beforeStart().then(() => {
                let list = new ListControl({
                    data: [{itemType:'loadingPlaceholder'}],
                    dataChunkAutoLoad: true,
                    onNextChunk: (e) => {
                        console.log('fetching next chunk...', e);
                        let curData = list.get('data');
                        fetchSomeRepos(curData.length).then(response => {
                            list.set('data', curData.concat(response.data));
                        });
                    }
                }, false);

                console.log('fetching initial chunk of data...');
                fetchSomeRepos().then(response => {
                    list.set('totalCount', response.totalCount);
                    list.set('data', response.data);
                });

                let p = new Pane();
                p.addChild(new Button({
                    model: {
                        text: 'List'
                    },
                    click() {
                        list.set('layout', 'list');
                    }
                }));
                p.addChild(new Button({
                    model: {
                        text: 'Grid',
                    },
                    click() {
                        list.set('layout', 'grid');
                    }
                }));
                p.addChild(new Button({
                    model: {
                        text: 'Hero'
                    },
                    click() {
                        list.set('layout', 'hero');
                    }
                }));
                p.addChild(new Button({
                    model: {
                        text: 'V'
                    },
                    click() {
                        list.set('orientation', 'vertical');
                    }
                }));
                p.addChild(new Button({
                    model: {
                        text: 'H'
                    },
                    click() {
                        list.set('orientation', 'horizontal');
                    }
                }));
                p.addChild(new Button({
                    model: {
                        text: 'Scroll'
                    },
                    click() {
                        list.set('scroll', 'item');
                    }
                }));
                p.addChild(new Button({
                    model: {
                        text: 'Page'
                    },
                    click() {
                        list.set('scroll', 'page');
                    }
                }));
                p.addChild(new Button({
                    model: {
                        text: 'Bar'
                    },
                    click() {
                        list.set('scrollControl', 'scrollbar');
                    }
                }));
                p.addChild(new Button({
                    model: {
                        text: 'Dots'
                    },
                    click() {
                        list.set('scrollControl', 'dots');
                    }
                }));
                p.render(this.getView());

                list.render(this.getView());
            });
        }

    };
});
