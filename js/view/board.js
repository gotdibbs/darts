var Board;

Board = Backbone.View.extend(function () {

    var events = {
        'click .js-mark': updateScore,
        'click .js-undo': undo,
        'mousedown .columns': preventTextSelection,
        'click .player': nextRound
    },

    headerTemplate = [
        '<div class="row board-header">',
            '<div class="small-1 columns">&nbsp;</div>',
            '<% if (players < 3) { %>',
                '<div class="small-2 columns">&nbsp;</div>',
            '<% } %>',
            '<div class="small-2 columns player player1<%= player==="player1" ? " board-header-active" : "" %>">P1</div>',
            '<% if (players > 2) { %>',
                '<div class="small-2 columns player player3<%= player==="player3" ? " board-header-active" : "" %>">P3</div>',
            '<% } %>',
            '<div class="small-2 columns game-mode">',
                '<%= game %>',
            '</div>',
            '<% if (players > 1) { %>',
                '<div class="small-2 columns player player2<%= player==="player2" ? " board-header-active" : "" %>">P2</div>',
            '<% } %>',
            '<% if (players > 3) { %>',
                '<div class="small-2 columns player player4<%= player==="player4" ? " board-header-active" : "" %>">P4</div>',
            '<% } %>',
            '<% if (players < 4) { %>',
                '<div class="small-2 columns">&nbsp;</div>',
            '<% } %>',
            '<% if (players < 2) { %>',
                '<div class="small-2 columns">&nbsp;</div>',
            '<% } %>',
            '<div class="small-1 columns">&nbsp;</div>',
        '</div>'
    ].join(''),

    scoreTemplate = [
        '<% _.each(marks, function (mark) { %>',
            '<div class="row board-score<%= mark.closed ? " closed" : "" %>">',
                '<div class="small-1 columns">&nbsp;</div>',
                '<% if (mark.players < 3) { %>',
                    '<div class="small-2 columns">&nbsp;</div>',
                '<% } %>',
                '<div class="small-2 columns player player1 js-value-<%= mark.value %>"><%= mark.player1Text %></div>',
                '<% if (mark.players > 2) { %>',
                    '<div class="small-2 columns player player3 js-value-<%= mark.value %>"><%= mark.player3Text %></div>',
                '<% } %>',
                '<div class="small-2 columns label board-divider js-mark">',
                    '<%= mark.value %>',
                '</div>',
                '<% if (mark.players > 1) { %>',
                    '<div class="small-2 columns player player2 js-value-<%= mark.value %>"><%= mark.player2Text %></div>',
                '<% } %>',
                '<% if (mark.players > 3) { %>',
                    '<div class="small-2 columns player player4 js-value-<%= mark.value %>"><%= mark.player4Text %></div>',
                '<% } %>',
                '<% if (mark.players < 4) { %>',
                    '<div class="small-2 columns">&nbsp;</div>',
                '<% } %>',
                '<% if (mark.players < 2) { %>',
                    '<div class="small-2 columns">&nbsp;</div>',
                '<% } %>',
                '<div class="small-1 columns">&nbsp;</div>',
            '</div>',
        '<% }); %>'
    ].join(''),

    footerTemplate = [
        '<div class="row board-footer">',
            '<div class="small-1 columns">&nbsp;</div>',
            '<% if (players < 3) { %>',
                '<div class="small-2 columns">&nbsp;</div>',
            '<% } %>',
            '<div class="small-2 columns player player1"><%= player1 %></div>',
            '<% if (players > 2) { %>',
                '<div class="small-2 columns player player3"><%= player3 %></div>',
            '<% } %>',
            '<div class="small-2 columns">',
                '<a href="javascript:void(0)" class="alert button js-undo">Undo</a>',
            '</div>',
            '<% if (players > 1) { %>',
                '<div class="small-2 columns player player2"><%= player2 %></div>',
            '<% } %>',
            '<% if (players > 3) { %>',
                '<div class="small-2 columns player player4"><%= player4 %></div>',
            '<% } %>',
            '<% if (players < 4) { %>',
                '<div class="small-2 columns">&nbsp;</div>',
            '<% } %>',
            '<% if (players < 2) { %>',
                '<div class="small-2 columns">&nbsp;</div>',
            '<% } %>',
            '<div class="small-1 columns">&nbsp;</div>',
        '</div>'
    ].join('');

    function initialize() {
        var view = this;

        view.templates ={
            header: _.template(headerTemplate),
            score: _.template(scoreTemplate),
            footer: _.template(footerTemplate),
        };

        view.logic = Games[view.options.game];

        view.state = {
            player: 'player1',
            players: view.options.players,
            game: view.options.game,
            rounds: 0,
            actions: []
        };

        view.logic.initialize(view);
    }

    function render() {
        var view = this,
            $header = $(view.templates.header(view.state)),
            $score = $(view.templates.score({
                marks: view.collection.toJSON()
            })),
            $footer = $(view.templates.footer(view.scores));

        view.$el.empty();
        view.$el.append($header)
            .append($score)
            .append($footer);
    }

    function updateScore(event) {
        var view = this;

        view.logic.updateScore(event, view, function () {
            view.render();
        });
    }

    function _interpretPlayer($elem) {
        return $elem.hasClass('player1') ? 'player1' :
            $elem.hasClass('player2') ? 'player2' :
            $elem.hasClass('player3') ? 'player3' : 'player4';
    }

    function preventTextSelection(event) {
        event.preventDefault();
        return false;
    }

    function nextRound(event) {
        var view = this,
            $target = $(event.currentTarget),
            player = _interpretPlayer($target);

        view.$('.board-header .player').removeClass('board-header-active');
        $('.board-header .' + player).addClass('board-header-active');

        view.state.player = player;
        view.state.rounds++;

        view.logic.nextRound(event, view, function () {
            view.render();
        });
    }

    function undo(event) {
        var view = this,
            action = view.state.actions.pop(),
            currentPlayer = _interpretPlayer(view.$('.board-header-active'));

        if (!action) {
            return;
        }

        view.logic.undo(view, action, currentPlayer, function () {
            view.render();
        });
    }

    return {
        events: events,

        initialize: initialize,
        render: render
    };

}());