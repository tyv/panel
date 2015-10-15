/**
 * @module server-canvas
 */

modules.define(
    'server-canvas',
    ['i-bem', 'i-bem__dom', 'BEMHTML', 'jquery', 'events__channels'],
    function(provide, BEM, BEMDOM, BEMHTML, $, channels) {

/**
 * @exports
 * @class server-canvas
 * @bem
 */
provide(BEMDOM.decl({ block: this.name }, /** @lends server-canvas.prototype */{

    onSetMod: {
        js: {
            inited: function() {
                this._servers = this.findBlocksInside('server');
                channels('mesosphere').on('servers', this._serverChange, this);
            }
        }
    },

    _serverChange: function(e, data) {
        switch(data.type) {

            case 'add':
                this._addServer();
                break;

            case 'destroy':
                this._destroyServer();
                break;

            case 'run-app':
                this._onAppRun(data);
                break;

            case 'kill-app':
                this._onAppKill(data);
                break;

            case 'kill-app-quiet':
                this._onAppQuietKill(data);
                break;
        }
    },

    _addServer: function() {
        var that = this;

        this._servers.push(
            BEMDOM.append(
                this.elem('list'),
                BEMHTML.apply(this._getServerBEMJSON())
            ).bem('server')
        );

        this._servers[this._servers.length - 1].setMod('state', 'loading');

        setTimeout(function() {
            that._servers[that._servers.length - 1].delMod('state');
            channels('mesosphere').emit('server', { type: 'added' });
        }, 1500);
    },

    _destroyServer: function() {
        var server = this._servers.pop(),
            mesosphere = BEM.blocks['mesosphere'];

        BEMDOM.destruct(server.domElem);

        channels('mesosphere').emit('server', { type: 'destroyed' });

        server.params.apps.forEach(function(app) {
            channels('mesosphere')
                .emit('servers', {
                    type: 'kill-app-quiet',
                    app: app.id
                });
        });

        server.params.apps.forEach(function(app) {
            if (mesosphere.availableAps) {
                channels('mesosphere')
                    .emit('servers', {
                        type: 'run-app',
                        app: app.id
                    });
            }
        });


    },

    _onAppRun: function(data) {
        var that = this,
            server = this._getAvailableServer(),
            apps = server.block.params.apps,
            timestamp = Date.now();


        apps.push({
            id: data.app,
            timestamp: timestamp
        });

        server.block.setMod('state', 'loading');

        setTimeout(function() {

            that._servers[server.index] = BEMDOM.replace(
                server.block.domElem,
                BEMHTML.apply(that._getServerBEMJSON(apps))
            ).bem('server');

            channels('mesosphere').emit('app', { type: 'runned', id: data.app });
        }, 1500);

    },

    _onAppKill: function(data) {
        var that = this,
            updatedApps = [],
            appRemoved = false,
            server = this._getNewestAppInstance(data.app),
            apps = server.block.params.apps;

        apps
            .sort(function(a, b) { return a.timestamp - b.timestamp })
            .reverse(); // news

        for (var i = 0; i < apps.length; i++) {

            if (apps[i].id !== data.app || appRemoved) {
                updatedApps.push(apps[i]);
            } else if (!appRemoved) {
                appRemoved = true;
            }
        };

        server.block.setMod('state', 'loading');

        setTimeout(function() {

            that._servers[server.index] = BEMDOM.replace(
                server.block.domElem,
                BEMHTML.apply(that._getServerBEMJSON(updatedApps))
            ).bem('server');

            channels('mesosphere').emit('app', { type: 'killed', id: data.app});
        }, 1500);


    },

    _onAppQuietKill: function(data) {
        channels('mesosphere').emit('app', { type: 'killed', id: data.app });
    },

    _getNewestAppInstance: function(app) {

        var serversWithApp = [];

        this._servers.forEach(function(server, index) {

            var mod = server.getMod(app);

            if (mod) {
                serversWithApp.push({
                    block: server,
                    index: index,
                    timestamp: parseInt(mod)
                });
            }

        });

        return serversWithApp.length &&
                serversWithApp
                    .sort(function(a, b) { return a.timestamp - b.timestamp })
                    .reverse()[0];
    },

    _getAvailableServer: function() {

        var server,
            i = 0,
            justOneApp = [];

        for (i = 0; i < this._servers.length; i++) {

            switch(this._servers[i].getMod('apps')) {
                case '0':
                    server = { block: this._servers[i], index: i };
                    break;

                case '1':
                    justOneApp.push({ block: this._servers[i], index: i });
                    break;
            }

            if (server) break;

        };

        if (!server) server = justOneApp[0];

        return server;
    },

    _getServerBEMJSON: function(update) {

        update = update || [];

        return {
            block: 'server',
            mods: { apps: update.length },
            apps: update
        };
    }

}));

});
