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

    onStat(total, accept, dropped) {
        total |= 0;
        accept |= 0;
        dropped |= 0;
        io.sockets.emit('stat', {
            total,
            accept,
            dropped
        });
    }
}

app.use(require('express').static(__dirname + '/public'));

http.listen(3000, function () {
    console.log('listen on 3000');
});

module.exports = Socket;
