/**
 * @module control-pane
 */

modules.define(
    'control-pane',
    ['i-bem', 'i-bem__dom', 'jquery', 'events__channels'],
    function(provide, BEM, BEMDOM, $, channels) {

/**
 * @exports
 * @class control-pane
 * @bem
 */
provide(BEMDOM.decl({ block: this.name }, /** @lends control-pane.prototype */{


    onSetMod: {
        js: function() {

            BEM.blocks['button'].on('click', this._onChange, this);

            channels('mesosphere').on('status', this._onAppStatus, this);
        }
    },


    _onAppStatus: function(e, data) {

        var toggler = !Boolean(BEM.blocks['mesosphere'].notEmpty);

        if (!this._destroyBtn) {
            this._destroyBtn = this.findBlockInside({ block: 'button', modName: 'type', modVal: 'destroy' });
        }

        this._destroyBtn.toggleMod('disabled', 'yes', '', toggler)
    },

    _onChange: function(e) {

        var button = e.target;

        if (button.hasMod('for', 'control-pane')) {

            channels('mesosphere').emit('servers', { type: button.getMod('type') });

        }
    },


}));

});
