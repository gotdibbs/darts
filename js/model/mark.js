var Mark,
    Marks;

Mark = Backbone.Model.extend(function () {

    var defaults = {
        value: 0,
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
        });

        model.on('change:player2', function () {
            model.set('player2Text', model.getText(model.get('player2')));
        });

        model.on('change:player3', function () {
            model.set('player3Text', model.getText(model.get('player3')));
        });

        model.on('change:player4', function () {
            model.set('player4Text', model.getText(model.get('player4')));
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

    function isClosed(player) {
        // TODO: configurable number of players
        var model = this,
            leftToClose = 3,
            players = ['player1', 'player2', 'player3', 'player4'];

        players = _.without(players, player);

        _.each(players, function (p) {
            if (model.get(p) > 2) {
                leftToClose--;
            }
        });

        return (leftToClose === 0);
    }

    return {
        defaults: defaults,

        initialize: initialize,

        getText: getText,
        hasMarks: hasMarks,
        isClosed: isClosed
    };

}());

Marks = Backbone.Collection.extend({
    model: Mark
});