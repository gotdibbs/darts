var Config;

Config = Backbone.View.extend(function () {

    var events = {
        'click .js-modal-close' : remove,
        'click .js-new-game': newGame,
        'click .js-players .button': updatePlayers,
        'click .js-game .button': updateGame,
    },

    overlayTemplate = [
        '<div class="js-modal-background modal-background">',
        '</div>'
    ].join(''),

    template = [
        '<div class="js-modal-dialog modal">',
            '<div class="modal-header"><h3>Game</h3></div>',
            '<div class="modal-description">',
                '<label for="tabs"># of Players</label>',
                '<ul class="button-group js-players">',
                    '<li><a href="#" class="button secondary">1</a></li>',
                    '<li><a href="#" class="button secondary">2</a></li>',
                    '<li><a href="#" class="button secondary">3</a></li>',
                    '<li><a href="#" class="button">4</a></li>',
                '</ul>',
                '<label for="tabs">Game</label>',
                '<ul class="button-group js-game">',
                    '<li><a href="#" class="button">Cricket</a></li>',
                    '<li><a href="#" class="button secondary">Wildcard</a></li>',,
                '</ul>',
            '</div>',
            '<div class="modal-footer">',
                '<a href="#" class="js-modal-close">Cancel</a>',
                '<a href="#" class="button success js-new-game">OK</a>',
            '</div>',
        '</div>'
    ].join('');

    function initialize(options) {
        var view = this;

        view.templates = {
            overlay: _.template(overlayTemplate),
            modal: _.template(template)
        };
    }

    function render(options) {
        var view = this,
            $template;

        view.state = {
            players: 4,
            game: 'Cricket'
        };

        $('body')
            .append(view.templates.overlay({}))
            .find('.js-modal-background')
            .fadeIn(100);

        $(view.el)
            .append(view.templates.modal(view.state))
            .find('.js-modal-dialog')
            .fadeIn(100)
            .css({ top: 0 });
    }

    function remove(event) {
        if (event) { event.preventDefault(); }

        $('.js-modal-dialog,.js-modal-background')
            .fadeOut(100, function onComplete() {
                $(this).remove();
            });
    }

    function newGame(event) {
        var view = this;

        view.trigger('new',  view.state);
    }

    function updatePlayers(event) {
        var view = this,
            $target = $(event.currentTarget),
            playersText = $target.text(),
            players = parseInt(playersText, 10);

        view.state.players = players;

        view.$('.js-players .button').addClass('secondary');
        $target.removeClass('secondary');
    }

    function updateGame(event) {
        var view = this,
            $target = $(event.currentTarget),
            game = $target.text();

        view.state.game = game;

        view.$('.js-game .button').addClass('secondary');
        $target.removeClass('secondary');
    }
   
    return {
        events: events,
        template: template,

        initialize: initialize,
        render: render,
        remove: remove,
        newGame: newGame,
        updatePlayers: updatePlayers,
        updateGame: updateGame
    }; 

}());