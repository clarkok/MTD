'use strict';

let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

io.on('connection', function (socket) {
    console.log('New connection');
});

class Socket {
    onRequest(source, dest, dropped) {
        source += '';
        dest += '';
        dropped = dropped || false;
        io.sockets.emit('request', {
            source,
            dest,
            dropped
        });
    }

    onStat(total, accepted, dropped) {
        total |= 0;
        accepted |= 0;
        dropped |= 0;
        io.sockets.emit('stat', {
            total,
            accepted,
            dropped
        });
    }
}

app.use(require('express').static(__dirname + '/public'));

http.listen(3000, function () {
    console.log('listen on 3000');
});

module.exports = Socket;
