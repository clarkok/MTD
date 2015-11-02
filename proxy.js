var proxy = require('anyproxy');

var options = {
    type        : 'http',
    port        : 8001,
    hostname    : '0.0.0.0',
    rule        : require('./rules.js'),
    dbFile      : null,
    webPort     : 8002,
    socketPort  : 8003,
    disableWebInterface : false,
    silent      : true
}

new proxy.proxyServer(options);
