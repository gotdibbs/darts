var NavBar;

NavBar = Backbone.View.extend(function () {

    var events = {
        'click .js-new-game': startNewGame,
        'click .js-start-tour': startTour,
    };

    function initialize() {
        var view = this;

        view.options.Dispatcher.on('start', function (event) {
            view.$('.js-game-title').text(event.game)
        });
    }

    function startNewGame() {
        var view = this;

        view.options.Dispatcher.trigger('new');
    }

    function startTour() {
        var tour = {
            id: 'welcome_tour',
            showPrevButton: true,
            steps: [
                {
                    target: $('.js-mark').first()[0],
                    placement: 'right',
                    title: 'Get Some Marks',
                    content: 'Tap numbers like these to track a mark against the selected number for the selected player.'
                },
                {
                    target: $('.board-score')[0],
                    placement: 'bottom',
                    title: 'End a Round',
                    content: 'Swipe across the board to end the current round.'
                },
                {
                    target: $('.js-undo')[0],
                    placement: 'top',
                    title: 'OH NOES!',
                    content: 'Make a mistake? Tap here to go back in time, step by step.'
                }
            ]
        };

        hopscotch.startTour(tour);
    }

    return {
        events: events,

        initialize: initialize
    };

}());