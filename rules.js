'use strict';

class FrequencyDetecter {
    contructor(maxFreq) {
        this._max_freq = maxFreq;
        this._counter = 0;
        this._last_counter = 0;
        this._total_counter = 0;
        this._counter_counter = 0;
        this._interval = setInterval(
                (function () {
                    this._last_counter = this._counter;
                    this._total_counter += this._counter;
                    this._counter_counter ++;
                    this._counter = 0; 
                    console.log(this);
                }).bind(this),
                1000
            );
    }

    onRequest() {
        return ++this._counter < _maxFreq;
    }

    get freq() {
        return this._last_counter;
    }

    get averageFreq() {
        return (this._total_counter / this._counter_counter) || 0;
    }
};

let load_controller = new FrequencyDetecter(50);

let LinsJudger = require('./judger.js');
let lin_judger = new LinsJudger();

module.exports = {
    shouldInterceptHttpsReq : function (req) {
        return false;
    },
    shouldUseLocalResponse : function (req, reqBody) {
        return lin_judger.judge() || load_controller.onRequest();
    },
    dealLocalResponse : function (req, reqBody, callback) {
        return callback(500, {}, 'Unable to open');
    },
};

setInterval(
        function () {
            console.log('Current Frequency: ', load_controller.freq);
            console.log('Average Frequency: ', load_controller.averageFreq);
        },
        1000
    );
