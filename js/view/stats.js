var Stats;

Stats = Backbone.View.extend(function () {

    var events = {
        'click .js-modal-dialog': remove
    },

    overlayTemplate = [
        '<div class="js-modal-background modal-background">',
        '</div>'
    ].join(''),

    template = [
        '<div class="js-modal-dialog score-modal">',
            '<div class="modal-header"><h3><%= header %></h3></div>',
            '<div class="modal-description row">',
                // Loops over the statistics included to render each by name, two columns per row
                '<% _.each(stats, function (stat, index) { %>',
                    '<div class="small-6 columns end drop-left-padding">',
                        '<label><%= stat.Name %></label>',
                        '<h2><%= stat.Value %></h2>',
                    '</div>',
                '<% }); %>',
            '</div>',
            '<div class="modal-hint">',
                '<sub>(Tap to close)</sub>',
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

        view.options = options;

        $('body')
            .append(view.templates.overlay({}))
            .find('.js-modal-background')
            .fadeIn(100);

        view.$el
            .append(view.templates.modal(view.options))
            .find('.js-modal-dialog')
            .fadeIn(100)
            .css({ right: $(document).outerWidth() / 2 - 560, top: 0, bottom: 0});

        view.$('.js-game .button')
            .first()
            .removeClass('secondary');
    }

    function remove(event) {
        var view = this,
            $dialog = $('.js-modal-dialog'),
            $background = $('.js-modal-background');

        if (event) { event.preventDefault(); }

        $dialog
            .css({ right: $(document).outerWidth() + 560, top: 0, bottom: 0 });

        $background
            .fadeOut(300, function onComplete() {
                $background.remove();
                $dialog.remove();

                if (!view.options.endGame) {
                    view.options.Dispatcher.trigger('next-round', {
                        currentPlayer: view.options.currentPlayer,
                        nextPlayer: view.options.nextPlayer
                    });
                }
                else {
                    view.options.Dispatcher.trigger('new');
                }
            });
    }
   
    return {
        events: events,
        template: template,

        initialize: initialize,
        render: render,
        remove: remove
    }; 

}());