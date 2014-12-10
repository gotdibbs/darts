(function (global) {

    var displayName = 'Cricket';

    global.Games = global.Games || {};

    global.Games[displayName] = Backbone.View.extend(function () {

        var events = {
            'click .js-mark': updateScore,
            'click .js-undo': undo
        },

        headerTemplate = [
            '<div class="row board-header">',
                '<div class="small-1 columns">&nbsp;</div>',
                '<% if (players < 3) { %>',
                    '<div class="small-2 columns">&nbsp;</div>',
                '<% } %>',
                '<div class="small-2 columns player player1<%= player === 1 ? " board-header-active" : "" %>">P1</div>',
                '<% if (players > 2) { %>',
                    '<div class="small-2 columns player player3<%= player === 3 ? " board-header-active" : "" %>">P3</div>',
                '<% } %>',
                '<div class="small-2 columns game-mode">',
                    displayName,
                '</div>',
                '<% if (players > 1) { %>',
                    '<div class="small-2 columns player player2<%= player === 2 ? " board-header-active" : "" %>">P2</div>',
                '<% } %>',
                '<% if (players > 3) { %>',
                    '<div class="small-2 columns player player4<%= player === 4 ? " board-header-active" : "" %>">P4</div>',
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
                '<div class="small-2 columns player player1"><%= scores.player1 %></div>',
                '<% if (players > 2) { %>',
                    '<div class="small-2 columns player player3"><%= scores.player3 %></div>',
                '<% } %>',
                '<div class="small-2 columns">',
                    '<a href="javascript:void(0)" class="alert button js-undo<%= actions.length === 0 ? " disabled" : "" %>">Undo</a>',
                '</div>',
                '<% if (players > 1) { %>',
                    '<div class="small-2 columns player player2"><%= scores.player2 %></div>',
                '<% } %>',
                '<% if (players > 3) { %>',
                    '<div class="small-2 columns player player4"><%= scores.player4 %></div>',
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

            view.state = {
                player: 1,
                players: view.options.players,
                rounds: 1,
                actions: [],
                marks: 0,
                scores: {
                    player1: 0,
                    player2: 0,
                    player3: 0,
                    player4: 0
                },
                isTouchRegistered: false
            };

            view.collection = new Marks([
                { value: '20', players: view.options.players },
                { value: '19', players: view.options.players },
                { value: '18', players: view.options.players },
                { value: '17', players: view.options.players },
                { value: '16', players: view.options.players },
                { value: '15', players: view.options.players },
                { value: 'BULL', players: view.options.players }
            ]);

            view.attachEvents();
        }

        function attachEvents() {
            var view = this;

            view.options.Dispatcher.on('next-round', advanceRound.bind(view));
        }

        function render() {
            var view = this,
                $header = $(view.templates.header(view.state)),
                $score = $(view.templates.score({
                    marks: view.collection.toJSON()
                })),
                $footer = $(view.templates.footer(view.state)),
                touchControl;

            view.$el
                .empty()
                .append($header)
                .append($score)
                .append($footer);

            if (!view.state.isTouchRegistered) {
                view.state.isTouchRegistered = true;

                // Initialize Hammer
                touchControl = new Hammer(view.el);

                touchControl.get('swipe').set({ 
                    direction: Hammer.DIRECTION_LEFT,
                    threshold: 100
                });

                touchControl.on('swipeleft', $.proxy(showStats, view));
            }
        }

        function showStats(event) {
            var view = this,
                stats,
                marks,
                currentPlayer = view.state.player,
                nextPlayer = currentPlayer === view.state.players ? 1 : currentPlayer + 1;

            marks = _.filter(view.state.actions, function (action) {
                    return ((action.type === 'points' || action.type === 'add') && action.player === view.state.player);
                }).length;

            view.options.Dispatcher.trigger('show-stats', {
                header: 'Round Summary',
                stats: [
                    { Name: 'Rounds', Value: view.state.rounds },
                    { Name: 'Marks per Round', Value: (marks / view.state.rounds) }
                ],
                currentPlayer: currentPlayer,
                nextPlayer: nextPlayer
            });
        }

        function advanceRound(event) {
            var view = this;

            view.state.player = event.nextPlayer;

            if (view.state.player !== 1) {
                view.state.actions.push({
                    type: 'end-turn',
                    player: event.currentPlayer
                });
            }

            view.render();

            // Start of new round
            if (view.state.player === 1) {
                view.state.rounds++;
                view.state.actions.push({
                    type: 'end-round',
                    player: event.currentPlayer
                });
            }
        }

        function updateScore(event) {
            var view = this,
                $target = $(event.currentTarget),
                player = view.state.player,
                $player = $('.player' + player, $target.parent()),
                currentMarks = $player.text(),
                valueText = $target.text(),
                value = parseInt(valueText, 10) || 25,
                currentMark;

            // Delay the highlight so that it runs after re-render is complete.
            // 1337 hax, I know :( will fix later
            setTimeout(function () {
                $('.player' + player + '.js-value-' + valueText)
                    .stop()
                    .css({backgroundColor: '#ddd'})
                    .animate({backgroundColor: 'transparent'}, 1500);
            }, 100);

            view.collection.forEach(function (mark) {
                var modelValue = mark.get('value');

                if (modelValue === valueText) {
                    currentMark = mark;
                }
            });

            currentScore = currentMark.get(player);

            if (currentMark.canScorePoints(player) || currentScore < 3) {
                if (currentScore === 3) {
                    view.state.scores['player' + player] += value;
                    view.state.actions.push({
                        type: 'points',
                        player: player,
                        value: valueText
                    });
                }
                else {
                    currentMark.set(player, ++currentScore);

                    view.state.actions.push({
                        type: 'add',
                        player: player,
                        value: valueText
                    });
                }
            }

            view.render();

            view.checkState();
        }

        function checkState() {
            var view = this,
                player = view.state.player,
                // Assume innocent until proven guilty
                isPlayerClosed = true, 
                stats;

            view.collection.forEach(function (mark) {
                if (mark.get(player) < 3) {
                    // guilty ... of not winning ... yet!
                    isPlayerClosed = false;
                }
            });

            if (isPlayerClosed && view.state.scores['player' + player] >= _.max(view.state.scores)) {
                view.options.Dispatcher.trigger('show-stats', {
                    header: 'Game Over',
                    endGame: true,
                    stats: [
                        { Name: 'Winner', Value: 'Player ' + player },
                        { Name: 'Rounds', Value: view.state.rounds }
                    ]
                });
            }
        }

        function undo(event) {
            var view = this,
                action = view.state.actions.pop(),
                currentPlayer = view.state.player,
                type,
                player,
                value;

            if (!action) {
                return;
            }

            type = action.type;
            player = action.player;

            if (action.type === 'add') {
                view.collection.forEach(function (mark) {
                    var modelValue = mark.get('value'),
                        currentScore;

                    if (modelValue === action.value) {
                        currentScore = mark.get(player);
                        mark.set(player, --currentScore);
                    }
                });
            }

            if (action.type === 'points') {
                value = parseInt(action.value, 10) || 25;

                view.state.scores['player' + player] -= value;
            }

            if (action.type === 'end-turn') {
                view.state.player = player;
            }

            if (action.type === 'end-round') {
                view.state.player = player;
                view.state.rounds--;
            }

            view.render();
        }

        return {
            events: events,

            initialize: initialize,
            attachEvents: attachEvents,
            render: render,
            checkState: checkState
        };

    }());

}(window));