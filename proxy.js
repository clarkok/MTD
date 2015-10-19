var proxy = require('anyproxy');

var options = {
    type        : 'http',
    port        : 8001,
    hostname    : 'localhost',
    rule        : require('./rules.js'),
    dbFile      : null,
    webPort     : 8002,
    socketPort  : 8003,
    disableWebInterface : false,
    silent      : false
}

new proxy.proxyServer(options);
