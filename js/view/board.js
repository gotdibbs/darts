var Board;

Board = Backbone.View.extend(function () {

    var isWildCard = false,

    events = {
        'click .js-mark': updateScore,
        'click .js-undo': undo,
        'mousedown .columns': preventTextSelection,
        'click .player': nextRound,
        'click .game-mode': switchMode
    },

    headerTemplate = [
        '<div class="row board-header">',
            '<div class="small-1 columns">&nbsp;</div>',
            '<div class="small-2 columns player player1<%= player1 ? " board-header-active" : "" %>">P1</div>',
            '<div class="small-2 columns player player3<%= player3 ? " board-header-active" : "" %>">P3</div>',
            '<div class="small-2 columns board-divider game-mode">',
                '<%= isWildCard ? "Wildcard" : "Cricket" %>',
            '</div>',
            '<div class="small-2 columns player player2<%= player2 ? " board-header-active" : "" %>" data-step="3" data-intro="Tap here to advance to player 2\'s turn.">P2</div>',
            '<div class="small-2 columns player player4<%= player4 ? " board-header-active" : "" %>">P4</div>',
            '<div class="small-1 columns">&nbsp;</div>',
        '</div>'
    ].join(''),

    scoreTemplate = [
        '<% _.each(marks, function (mark) { %>',
            '<div class="row board-score">',
                '<div class="small-1 columns">&nbsp;</div>',
                '<div class="small-2 columns player player1 js-value-<%= mark.value %>"><%= mark.player1Text %></div>',
                '<div class="small-2 columns player player3 js-value-<%= mark.value %>"><%= mark.player3Text %></div>',
                '<div class="small-2 columns label board-divider js-mark">',
                    '<%= mark.value %>',
                '</div>',
                '<div class="small-2 columns player player2 js-value-<%= mark.value %>"><%= mark.player2Text %></div>',
                '<div class="small-2 columns player player4 js-value-<%= mark.value %>"><%= mark.player4Text %></div>',
                '<div class="small-1 columns">&nbsp;</div>',
            '</div>',
        '<% }); %>'
    ].join(''),

    footerTemplate = [
        '<div class="row board-footer">',
            '<div class="small-1 columns">&nbsp;</div>',
            '<div class="small-2 columns player player1"><%= player1 %></div>',
            '<div class="small-2 columns player player3"><%= player3 %></div>',
            '<div class="small-2 columns">',
                '<a href="javascript:void(0)" class="alert button js-undo">Undo</a>',
            '</div>',
            '<div class="small-2 columns player player2"><%= player2 %></div>',
            '<div class="small-2 columns player player4"><%= player4 %></div>',
            '<div class="small-1 columns">&nbsp;</div>',
        '</div>'
    ].join('');

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
            player1: 1,
            player2: 0,
            player3: 0,
            player4: 0,
            isWildCard: view.isWildCard,
            actions: []
        };

        view.rounds = 0;
        view.wildCardNumbers = [
            '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'
        ];

        if (view.isWildCard) {
            validNumbers = _.clone(view.wildCardNumbers);

            view.collection = new Marks([]);

            for (var i = 0; i < 6; i++) {
                nextNumber = validNumbers[Math.floor(Math.random() * validNumbers.length)]

                view.collection.add({ 
                    value: nextNumber
                });

                validNumbers = _.without(validNumbers, nextNumber)
            }

            view.collection.add({ value: 'BULL' });
        }
        else {
            view.collection = new Marks([
                { value: '20' },
                { value: '19' },
                { value: '18' },
                { value: '17' },
                { value: '16' },
                { value: '15' },
                { value: 'BULL' }
            ]);
        }

        view.model = {
            player1: 0,
            player2: 0,
            player3: 0,
            player4: 0
        };
    }

    function render() {
        var view = this,
            $header = $(view.templates.header(view.state)),
            $score = $(view.templates.score({
                marks: view.collection.toJSON()
            })),
            $footer = $(view.templates.footer(view.model));

        view.$el.empty();
        view.$el.append($header)
            .append($score)
            .append($footer);
    }

    function getCurrentPlayer() {
        var view = this;

        return view.state.player1 ? 'player1' :
            view.state.player2 ? 'player2' :
            view.state.player3 ? 'player3' : 'player4';
    }

    function updateScore(event) {
        var view = this,
            $target = $(event.currentTarget),
            player = view.getCurrentPlayer(),
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
                .animate({backgroundColor: '#fff'}, 1500);
        }, 100);

        view.collection.forEach(function (mark) {
            var modelValue = mark.get('value');

            if (modelValue === valueText) {
                currentMark = mark;
            }
        });

        if (currentMarks === '(X)') {
            if (!currentMark.isClosed(player)) {
                view.model[player] += value;
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

        view.collection.forEach(function (mark) {
            var modelValue = mark.get('value'),
                currentScore;

            if (modelValue === valueText) {
                currentScore = mark.get(player);
                mark.set(player, ++currentScore);
            }
        });

        view.render();
    }

    function _interpretPlayer($elem) {
        return $elem.hasClass('player1') ? 'player1' :
            $elem.hasClass('player2') ? 'player2' :
            $elem.hasClass('player3') ? 'player3' : 'player4';
    }

    function _increaseScore(player, vlaue) {
        // TODO: validate player's score is no more than 200 past closest player
    }

    function preventTextSelection(event) {
        event.preventDefault();
        return false;
    }

    function nextRound(event) {
        var view = this,
            $target = $(event.currentTarget),
            previousPlayer = _interpretPlayer(view.$('.board-header-active')),
            player = _interpretPlayer($target),
            validNumbers,
            currentNumbers = [];

        view.$('.board-header .player').removeClass('board-header-active');
        $('.board-header .' + player).addClass('board-header-active');

        view.state[previousPlayer] = 0;
        view.state[player] = 1;

        view.rounds++;

        if (!view.isWildCard) {
            return;
        }

        view.collection.forEach(function (mark) {
            if (mark.hasMarks()) {
                currentNumbers.push(mark.get('value'));
            }
        });

        validNumbers = _.difference(view.wildCardNumbers, currentNumbers);

        view.collection.forEach(function (mark) {
            var nextNumber = validNumbers[Math.floor(Math.random() * validNumbers.length)];

            if (mark.get('value') !== 'BULL' && !mark.hasMarks()) {
                mark.set('value', nextNumber);

                validNumbers = _.without(validNumbers, nextNumber);
            }
        });

        view.render();
    }

    function switchMode(event) {
        var view = this;

        if (!window.confirm('Switching game modes will erase the current game. Continue?')) {
            return;
        }

        view.isWildCard = !view.isWildCard;

        if (view.isWildCard) {
            view.$('.js-mode').text('Wildcard');
        }
        else {
            view.$('.js-mode').text('Cricket');
        }

        view.initialize();
        view.render();
    }

    function undo(event) {
        var view = this,
            action = view.state.actions.pop(),
            currentPlayer = _interpretPlayer(view.$('.board-header-active')),
            type,
            player,
            valueText,
            value;

        if (!action) {
            return;
        }

        type = action.type,
        player = action.player,
        valueText = action.value,
        value = parseInt(valueText, 10) || 25;

        if (action.type === 'points') {
            view.model[player] -= value;
            view.$('.board-footer .' + player).text(view.model[player]);
        }

        if (currentPlayer !== player) {
            view.$('.board-header .player').removeClass('board-header-active');
            view.$('.board-header .' + player).addClass('board-header-active');

            view.state[currentPlayer] = 0;
            view.state[player] = 1;
        }
        
        view.collection.forEach(function (mark) {
            var modelValue = mark.get('value'),
                currentScore;

            if (modelValue === valueText) {
                currentScore = mark.get(player);
                mark.set(player, --currentScore);
            }
        });

        view.render();
    }

    return {
        isWildCard: isWildCard,
        events: events,

        initialize: initialize,
        render: render,

        updateScore: updateScore,
        preventTextSelection: preventTextSelection,
        getCurrentPlayer: getCurrentPlayer
    };

}());