var Mark,
    Marks;

Mark = Backbone.Model.extend(function () {

    var defaults = {
        value: 0,
        closed: false,
        players: 4,
        '1': 0,
        player1Text: '&nbsp;',
        '2': 0,
        player2Text: '&nbsp;',
        '3': 0,
        player3Text: '&nbsp;',
        '4': 0,
        player4Text: '&nbsp;'
    };

    function initialize() {
        var model = this;

        model.on('change:1', function () {
            model.set('player1Text', model.getText(model.get('1')));
            model.updateClosed();
        });

        model.on('change:2', function () {
            model.set('player2Text', model.getText(model.get('2')));
            model.updateClosed();
        });

        model.on('change:3', function () {
            model.set('player3Text', model.getText(model.get('3')));
            model.updateClosed();
        });

        model.on('change:4', function () {
            model.set('player4Text', model.getText(model.get('4')));
            model.updateClosed();
        });
    }

    function getText(value) {
        return value === 0 ? '&nbsp;' : 
            value === 1 ? '\\' :
            value === 2 ? 'X' : '(X)';
    }

    function hasMarks() {
        var model = this;

        return model.get('1') ||
            model.get('2') ||
            model.get('3') ||
            model.get('4');
    }

    function canScorePoints(player) {
        var model = this,
            players = model.get('players'),
            leftToClose = players - 1,
            playersList = [];

        for (i = 1; i <= players; i++) {
            playersList.push(i);
        }

        playersList = _.without(playersList, player);

        _.each(playersList, function (p) {
            if (model.get(p) > 2) {
                leftToClose--;
            }
        });

        return (leftToClose > 0);
    }

    function updateClosed() {
        var model = this,
            currentState = model.get('closed'),
            players = model.get('players'),
            leftToClose = players,
            i;

        for (i = 1; i <= players; i++) {
            if (model.get(i) > 2){
                leftToClose--;
            }
        }

        if (leftToClose === 0 && !currentState) {
            model.set('closed', true);
        }
        else if (currentState) {
            model.set('closed', false);
        }
    }

    return {
        defaults: defaults,

        initialize: initialize,

        getText: getText,
        hasMarks: hasMarks,
        canScorePoints: canScorePoints,
        updateClosed: updateClosed
    };

}());

Marks = Backbone.Collection.extend({
    model: Mark
});