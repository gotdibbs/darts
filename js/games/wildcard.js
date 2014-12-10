(function (global) {

    var displayName = 'Wildcard';

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
        ].join(''),

        wildCardNumbers = [
            '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'
        ];;

        function initialize() {
            var view = this,
                validNumbers,
                nextNumber;

            view.templates ={
                header: _.template(headerTemplate),
                score: _.template(scoreTemplate),
                footer: _.template(footerTemplate),
            };

            view.state = {
                player: 1,
                players: view.options.players,
                rounds: {
                    player1: 0,
                    player2: 0,
                    player3: 0,
                    player4: 0
                },
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

            validNumbers = _.clone(wildCardNumbers);

            view.collection = new Marks([]);

            for (var i = 0; i < 6; i++) {
                nextNumber = validNumbers[Math.floor(Math.random() * validNumbers.length)]

                view.collection.add({ 
                    value: nextNumber,
                    players: view.options.players
                });

                validNumbers = _.without(validNumbers, nextNumber)
            }

            view.collection.add({ 
                value: 'BULL',
                players: view.options.players
            });

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
                $footer = $(view.templates.footer(view.state));

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
                    { Name: 'Rounds', Value: view.state.rounds['player' + currentPlayer] },
                    { Name: 'Marks per Round', Value: getMarksPerRound() }
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
            var view = this,
                currentNumbers = [];

            view.state.player = event.nextPlayer;

            view.state.rounds['player' + event.currentPlayer]++;

            view.state.actions.push({
                type: 'end-turn',
                player: event.currentPlayer
            });

            view.collection.forEach(function (mark) {
                if (mark.hasMarks()) {
                    currentNumbers.push(mark.get('value'));
                }
            });

            validNumbers = _.difference(wildCardNumbers, currentNumbers);

            view.collection.forEach(function (mark) {
                var nextNumber = validNumbers[Math.floor(Math.random() * validNumbers.length)];

                if (mark.get('value') !== 'BULL' && !mark.hasMarks()) {
                    mark.set('value', nextNumber);

                    validNumbers = _.without(validNumbers, nextNumber);
                }
            });

            view.render();
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

                view.state.rounds['player' + player]--;
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