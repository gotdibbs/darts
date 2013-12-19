var Darts;

Darts = Backbone.View.extend(function () {

    var subviews = {},
        Dispatcher = _.clone(Backbone.Events);

    function initialize() {
        var view = this;

        view.subviews.Config = new Config({
            Dispatcher: Dispatcher
        });

        view.subviews.NavBar = new NavBar({
            Dispatcher: Dispatcher
        });

        view.attachEvents();

        // Render the page
        view.render();

        // Initialize Foundation
        $(document).foundation();
    }

    function attachEvents() {
        var view = this;

        Dispatcher.on('new', function (event) {
            // Assign the config container
            view.assign('.js-config-container', view.subviews.Config);
        });

        Dispatcher.on('start', function (event) {
            // Remove the dialog
            view.subviews.Config.remove();
            // Remove the old board
            view.subviews.Board && view.subviews.Board.remove();

            // Append new board wrapper
            $('.board').append('<div class="large-12 columns js-board-wrapper"></div>');

            // Create the board
            view.subviews.Board = new Games[event.game]({
                Dispatcher: Dispatcher,
                players: event.players
            });

            // Assign the board to the wrapper and render
            view.assign('.js-board-wrapper', view.subviews.Board);
            
        });
    }

    function render() {
        var view = this;

        view.assign({
            '.js-nav-bar': view.subviews.NavBar,
            '.js-config-container': view.subviews.Config
        });
    }

    function assign(selector, view) {
        var selectors;
        if (_.isObject(selector)) {
            selectors = selector;
        }
        else {
            selectors = {};
            selectors[selector] = view;
        }
        if (!selectors) return;
        _.each(selectors, function (view, selector) {
            view.setElement(this.$(selector)).render();
        }, this);
    }

    return {
        subviews: subviews,

        initialize: initialize,
        attachEvents: attachEvents,
        render: render,
        assign: assign
    };

}());