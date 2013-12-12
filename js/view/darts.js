var Darts;

Darts = Backbone.View.extend(function () {

    var subviews = {};

    function initialize() {
        var view = this;

        view.subviews.Config = new Config();
        view.subviews.Config.on('new', function (event) {
            // Remove the dialog
            view.subviews.Config.remove();
            // Remove the old board
            view.subviews.Board && view.subviews.Board.remove();

            // Append new board wrapper
            $('.board').append('<div class="large-12 columns js-board-wrapper"></div>');

            // Create the board
            view.subviews.Board = new Board({
                players: event.players,
                game: event.game
            });

            // Assign the board to the wrapper and render
            view.assign('.js-board-wrapper', view.subviews.Board);
        });

        view.subviews.NavBar = new NavBar();
        view.subviews.NavBar.on('new', function () {
            view.subviews.Config = new Config();
            view.assign('.js-config-container', view.subviews.Config);
        });

        // Render the page
        view.render();

        // Initialize Foundation
        $(document).foundation();
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
        render: render,
        assign: assign
    };

}());