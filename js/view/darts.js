var Darts;

Darts = Backbone.View.extend(function () {

    function initialize() {
        var view = this;

        view.subviews = {};

        view.subviews.NavBar = new NavBar();
        view.subviews.NavBar.on('new', function () {
            // Reset state
            view.subviews.Board.initialize();
            // Redraw
            view.subviews.Board.render();
        });

        view.subviews.Board = new Board();

        // Render the page
        view.render();

        // Initialize Foundation
        $(document).foundation();
    }

    function render() {
        var view = this;

        view.assign({
            '.js-nav-bar': view.subviews.NavBar,
            '.js-board-wrapper': view.subviews.Board
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
        initialize: initialize,
        render: render,
        assign: assign
    };

}());