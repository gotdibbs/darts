(function (global) {

    var displayName = 'Cricket';

    global.Games = global.Games || {};

    global.Games[displayName] = Backbone.View.extend(function () {

        var events = {
            'click .js-mark': updateScore,
            'click .js-next': showStats,
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
                '<div class="small-2 columns board-button-container">',
                    '<a href="javascript:void(0);" class="alert button board-button js-next">Next</a>',
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
                    '<div class="small-2 columns label board-divider js-mark" data-value="<%= mark.value %>">',
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
                '<div class="small-2 columns board-button-container-footer">',
                    '<a href="javascript:void(0)" class="alert button board-button js-undo<%= actions.length === 0 ? " disabled" : "" %>">Undo</a>',
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
                rounds: {
                    player1: 1,
                    player2: 0,
                    player3: 0,
                    player4: 0
                },
                actions: [],
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

                console.log('show');

            view.options.Dispatcher.trigger('show-stats', {
                header: 'Round Summary',
                stats: [
                    { Name: 'Rounds', Value: view.state.rounds['player' + currentPlayer] },
                    { Name: 'Marks per Round', Value: view.getMarksPerRound() }
                ],
                currentPlayer: currentPlayer,
                nextPlayer: nextPlayer
            });
        }

        function getMarks(player) {
            var view = this;

            player = player || view.state.player;

            return _.filter(view.state.actions, function (action) {
                return (action.player === player &&
                    (action.type === 'points' || action.type === 'add'));
            }).length;
        }

        function getMarksPerRound(player) {
            var view = this;

            player = player || view.state.player;

            return (view.getMarks(player) / view.state.rounds['player' + player]).toFixed(2);
        }

        function advanceRound(event) {
            var view = this;

            view.state.player = event.nextPlayer;

            view.state.rounds['player' + event.nextPlayer]++;

            view.state.actions.push({
                type: 'end-turn',
                player: event.currentPlayer,
                nextPlayer: event.nextPlayer
            });

            view.render();
        }

        function updateScore(event) {
            var view = this,
                $target = $(event.currentTarget),
                player = view.state.player,
                $player = $('.player' + player, $target.parent()),
                currentMarks = $player.text(),
                valueText = $target.data('value'),
                value = parseInt(valueText, 10) || 25,
                currentMark = view.collection.get(valueText),
                currentScore = currentMark.get(player),
                sortedScores, maxScore, nextHighestScore;

            // Delay the highlight so that it runs after re-render is complete.
            // 1337 hax, I know :( will fix later
            setTimeout(function () {
                $('.player' + player + '.js-value-' + valueText)
                    .stop()
                    .css({backgroundColor: '#ddd'})
                    .animate({backgroundColor: 'transparent'}, 1500);
            }, 100);

            if (currentMark.canScorePoints(player) || currentScore < 3) {
                if (currentScore === 3) {
                    sortedScores = _.sortBy(view.state.scores, function (score) {
                        return score;
                    }),
                    maxScore = sortedScores.pop(),
                    nextHighestScore = sortedScores.pop();

                    // Check to ensure the score is not going to exceed 200 past next player
                    if (view.state.scores['player' + player] >= maxScore &&
                        (maxScore + value) > (nextHighestScore + 200)) {
                        value = ((nextHighestScore + 200) - maxScore) || 0;
                        valueText = value.toString();
                    }

                    if (value !== 0) {
                        view.state.scores['player' + player] += value;
                        view.state.actions.push({
                            type: 'points',
                            player: player,
                            value: valueText
                        });
                    }
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
                stats = [],
                i;

            view.collection.forEach(function (mark) {
                if (mark.get(player) < 3) {
                    // guilty ... of not winning ... yet!
                    isPlayerClosed = false;
                }
            });

            if (isPlayerClosed && view.state.scores['player' + player] >= _.max(view.state.scores)) {
                stats.push({ Name: 'Winner', Value: 'Player ' + player });
                stats.push({ Name: 'Rounds', Value: view.state.rounds['player' + player] });

                for (var i = 1; i <= view.state.players; i++) {
                    stats.push({ Name: 'MPR Player ' + i, Value: view.getMarksPerRound(i) });
                }

                view.options.Dispatcher.trigger('show-stats', {
                    header: 'Game Over',
                    endGame: true,
                    stats: stats
                });
            }
        }

        function undo(event) {
            var view = this,
                action = view.state.actions.pop(),
                currentPlayer = view.state.player,
                mark, score, value;

            if (!action) {
                return;
            }

            if (action.type === 'add') {
                mark = view.collection.get(action.value);
                score = mark.get(action.player);
                mark.set(action.player, --score);
            }

            if (action.type === 'points') {
                value = parseInt(action.value, 10) || 25;

                view.state.scores['player' + action.player] -= value;
            }

            if (action.type === 'end-turn') {
                view.state.player = action.player;
                
                view.state.rounds['player' + action.nextPlayer]--;
            }

            view.render();
        }

        return {
            events: events,

            initialize: initialize,
            attachEvents: attachEvents,
            render: render,
            checkState: checkState,
            getMarks: getMarks,
            getMarksPerRound: getMarksPerRound
        };

    }());

}(window));