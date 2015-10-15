/**
 * @module mesosphere
 */

modules.define(
    'mesosphere',
    ['i-bem__dom', 'jquery', 'events__channels'],
    function(provide, BEMDOM, $, channels) {

/**
 * @exports
 * @class mesosphere
 * @bem
 */
provide(BEMDOM.decl({ block: this.name }, /** @lends mesosphere.prototype */{
    onSetMod: {
        js: {
            inited: function() {
                var servers = this.params.servers,
                    apps = 0;

                servers.forEach(function(server) {
                    apps = apps + server.apps.length;
                });

                this.MAX_APPS_PER_SERVER = 2;

                this.__self.stat = this._stat = {
                    servers: servers.length,
                    apps: apps
                };

                this.__self.availableAps = this._stat.apps / this.MAX_APPS_PER_SERVER - this._stat.servers - 1;
                this.__self.notEmpty = true;
                this.__self.runnedApps = this.params.runnedApps;

                channels('mesosphere').on('server', this._serverChange, this);
                channels('mesosphere').on('app', this._appChange, this);
            }
        }
    },

    _serverChange: function(e, data) {

        switch(data.type) {

            case 'added':
                this._stat.servers++;
                this._setServersStatus();
                break;

            case 'destroyed':
                this._stat.servers--;
                this._setServersStatus();
                break;
        }
    },

    _appChange: function(e, data) {
        var app = data.id,
            runnedApps = this.__self.runnedApps;

        switch(data.type) {

            case 'runned':
                this._stat.apps++;
                runnedApps[app] = runnedApps[app] ? runnedApps[app] + 1 : 1;
                this._setAppsStatus();
                this._setCurrentAppStatus(data.id);
                break;

            case 'killed':
                this._stat.apps--;
                runnedApps[app] = runnedApps[app] - 1;
                this._setAppsStatus();
                this._setCurrentAppStatus(data.id);
                break;
        }
    },

    _setAppsStatus: function() {
        var currentStatus,
            prevStatus = Boolean(this.__self.availableAps);

        this.__self.availableAps = this._stat.servers *
                                    this.MAX_APPS_PER_SERVER -
                                        this._stat.apps;

        if (this.__self.availableAps < 0) this.__self.availableAps = 0;

        currentStatus = Boolean(this.__self.availableAps);

        if (!currentStatus && prevStatus) {

            channels('mesosphere').emit('status', { type: 'full' });

        } else if (!prevStatus && currentStatus) {

            channels('mesosphere').emit('status', { type: 'released' });

        }
    },

    _setServersStatus: function() {
        var currentStatus,
            prevStatus = this.__self.notEmpty;

        this.__self.notEmpty = Boolean(this._stat.servers);
        currentStatus = this.__self.notEmpty;

        if (!currentStatus && prevStatus) {

            this.__self.availableAps = 0;
            channels('mesosphere').emit('status', { type: 'empty' });

        } else if (!prevStatus && currentStatus) {

            this.__self.availableAps = this.__self.availableAps + this.MAX_APPS_PER_SERVER;
            channels('mesosphere').emit('status', { type: 'released' });
        } else {
            this._setAppsStatus();
        }
    },

    _setCurrentAppStatus: function(app) {

        channels('mesosphere')
            .emit('status', {
                type: 'app-' + this.__self.runnedApps[app] == 0 ? 'disable' : 'enable',
                app: app
            });
    }

}));

});
