(function (global) {

    global.Games = global.Games || {};

    global.Games.Wildcard = (function () {

        var wildCardNumbers = [
            '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'
        ];

        function initialize(view) {
            var validNumbers,
                nextNumber;

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

            view.scores = {
                player1: 0,
                player2: 0,
                player3: 0,
                player4: 0,
                players: view.options.players
            };
        }

        function updateScore(event, view, cb) {
            var $target = $(event.currentTarget),
                player = view.state.player,
                $player = $('.' + player, $target.parent()),
                currentMarks = $player.text(),
                valueText = $target.text(),
                value = parseInt(valueText, 10) || 25,
                currentMark;

            // Delay the highlight so that it runs after re-render is complete.
            // 1337 hax, I know :( will fix later
            setTimeout(function () {
                $('.' + player + '.js-value-' + valueText)
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

            if (currentMarks === '(X)') {
                if (currentMark.canScorePoints(player)) {
                    view.scores[player] += value;
                    view.state.actions.push({ 
                        type: 'points',
                        player: player,
                        value: valueText
                    });
                }
            }
            else {
                view.state.actions.push({ 
                    type: 'add',
                    player: player,
                    value: valueText
                });
            }

            currentScore = currentMark.get(player);

            if (currentMark.canScorePoints(player) || currentScore < 3) {
                currentMark.set(player, ++currentScore);
            }

            cb();
        }

        function nextRound(event, view, cb) {
            var currentNumbers = [],
                validNumbers,
                nextNumber

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

            cb();
        }

        function undo(view, action, currentPlayer, cb) {
            var type = action.type,
                player = action.player,
                valueText = action.value,
                value = parseInt(valueText, 10) || 25;

            if (action.type === 'points') {
                view.scores[player] -= value;
                view.$('.board-footer .' + player).text(view.scores[player]);
            }

            if (currentPlayer !== player) {
                view.$('.board-header .player').removeClass('board-header-active');
                view.$('.board-header .' + player).addClass('board-header-active');

                view.state.player = player;
                view.state.rounds--;
            }
            
            view.collection.forEach(function (mark) {
                var modelValue = mark.get('value'),
                    currentScore;

                if (modelValue === valueText) {
                    currentScore = mark.get(player);
                    mark.set(player, --currentScore);
                }
            });

            cb();
        }

        return {
            initialize: initialize,

            updateScore: updateScore,
            nextRound: nextRound,
            undo: undo
        };
    }());

}(window));