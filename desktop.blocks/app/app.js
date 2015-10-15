/**
 * @module app
 */

modules.define(
    'app',
    ['i-bem', 'i-bem__dom', 'jquery', 'events__channels'],
    function(provide, BEM, BEMDOM, $, channels) {

/**
 * @exports
 * @class app
 * @bem
 */
provide(BEMDOM.decl({ block: this.name }, /** @lends app.prototype */{

    onSetMod: {
        js: function() {

            this._runButton = this.findBlockInside('control', {
                block: 'button',
                modName: 'action',
                modVal: 'run'
            });

            this._killButton = this.findBlockInside('control', {
                block: 'button',
                modName: 'action',
                modVal: 'kill'
            });

            [this._runButton, this._killButton].forEach(function(btn) {
                btn.on('click', this._onAction, this);
            }, this);


            channels('mesosphere').on('status', this._onAppStatus, this);
        }
    },

    _onAppStatus: function(e, data) {

        var mesosphere = BEM.blocks['mesosphere'],
            runToggler = !Boolean(mesosphere.availableAps),
            killToggler = !Boolean(mesosphere.runnedApps[this.getMod('id')]);

        this._runButton.toggleMod('disabled', 'yes', '', runToggler);
        this._killButton.toggleMod('disabled', 'yes', '', killToggler);
    },

    _onAction: function(e) {

        var button = e.target;

        if (button.hasMod('for', 'app')) {

            channels('mesosphere')
                .emit('servers', {
                    type: button.getMod('action') + '-app',
                    app: this.getMod('id')
                });
        }
    }


}));

});
