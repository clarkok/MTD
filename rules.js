'use strict';

function getIP(req) {
    var forwardedIpsStr = req.headers['x-forwarded-for'];
    var ipAddress;
    if (forwardedIpsStr) {
        var forwardedIps = forwardedIpsStr.split(',');
        ipAddress = forwardedIps[0];
    }
    if (!ipAddress) {
        ipAddress = req.connection.remoteAddress;
    }
    return ipAddress;
}

class FrequencyDetecter {
    constructor(maxFreq) {
        let _this = this;

        this._max_freq = maxFreq;
        this._counter = 0;
        this._last_counter = 0;
        this._total_counter = 0;
        this._counter_counter = 0;
        this._interval = setInterval(
                function () {
                    _this._last_counter = _this._counter;
                    _this._total_counter += _this._counter;
                    _this._counter_counter ++;
                    _this._counter = 0; 
                },
                1000
            );
    }

    onRequest() {
        return ++this._counter >= this._max_freq;
    }

    get freq() {
        return this._last_counter;
    }

    get averageFreq() {
        return (this._total_counter / this._counter_counter) || 0;
    }

    get status() {
        return this._last_counter < this._max_freq;
    }
};

let load_controller = new FrequencyDetecter(30);

let LinsJudger = require('./judger.js');
let lin_judger = new LinsJudger();
let Socket = require('./socks.js');
let socket = new Socket();

let dropped_counter = 0;

module.exports = {
    shouldInterceptHttpsReq : function (req) {
        return false;
    },
    shouldUseLocalResponse : function (req, reqBody) {
        if (!req.headers['host'].match(/zhihu/)) {
            return false;
        }
        let ip = getIP(req);
        let dropped = !lin_judger.judge(ip);
        if (dropped) ++dropped_counter;
        console.log(dropped);
        socket.onRequest(ip, req.headers['host'], dropped);
        if (dropped) {
            return true;
        }
        else {
            let server_status = load_controller.onRequest();
            return server_status;
        }
    },
    dealLocalResponse : function (req, reqBody, callback) {
        return callback(500, {}, 'Unable to open');
    },
};

setInterval(
        function () {
            console.log('Current Frequency: ', load_controller.freq);
            console.log('Average Frequency: ', load_controller.averageFreq);
            console.log('Server status: ', load_controller.status ? 'OK' : 'DOWN');
            console.log('');
            let all = load_controller.freq;
            socket.onStat(all + dropped_counter, all, dropped_counter);
            dropped_counter = 0;
        },
        1000
    );
