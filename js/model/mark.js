var Mark,
    Marks;

Mark = Backbone.Model.extend(function () {

    var defaults = {
        value: 0,
        closed: false,
        players: 4,
        player1: 0,
        player1Text: '&nbsp;',
        player2: 0,
        player2Text: '&nbsp;',
        player3: 0,
        player3Text: '&nbsp;',
        player4: 0,
        player4Text: '&nbsp;'
    };

    function initialize() {
        var model = this;

        model.on('change:player1', function () {
            model.set('player1Text', model.getText(model.get('player1')));
            model.updateClosed();
        });

        model.on('change:player2', function () {
            model.set('player2Text', model.getText(model.get('player2')));
            model.updateClosed();
        });

        model.on('change:player3', function () {
            model.set('player3Text', model.getText(model.get('player3')));
            model.updateClosed();
        });

        model.on('change:player4', function () {
            model.set('player4Text', model.getText(model.get('player4')));
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

        return model.get('player1') ||
            model.get('player2') ||
            model.get('player3') ||
            model.get('player4');
    }

    function canScorePoints(player) {
        var model = this,
            players = model.get('players'),
            leftToClose = players - 1,
            playersList = [];

        for (i = 1; i <= players; i++) {
            playersList.push('player' + i);
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
            if (model.get('player' + i) > 2){
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