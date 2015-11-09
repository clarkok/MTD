'use strict';

class Database {
    constructor() {
        this.visitInPeriod = {};
        this.visitInTotal = {};
        this.visitDays = {};
        this.lastVisitedDay = {};
        this.duration = 1000;  //default 1000ms;
        this.dayDuration = 1;
        this.totalVisit = 0;

        this.forbidenTable = {};
    }

    clearForbiddenTable() {
        this.forbidenTable = {};
    };

    isForbidden(ip){
        return this.forbidenTable[ip] != undefined;
    };

    forbidIp(ip){
        this.forbidenTable[ip] = 1;
    };

    setMonitorDuration(duration){
        this.duration = duration;
    };

    incVisitsInPeriod(ip){
        var dateObj = new Date();
        var prefix = String(Math.floor(dateObj.getTime() / this.duration));
        if (prefix != this.oldPrefix) {
            this.oldPrefix = prefix;
            this.visitInPeriod = {};
            this.totalVisit = 0;
        }
        this.totalVisit += 1;
        var tmp = this.visitInPeriod[prefix + ip];
        if (tmp == undefined) tmp = 0;
        else tmp += 1;
        return this.visitInPeriod[prefix + ip] = tmp;
    };

    incVisitedDayInTotal(ip){
        var dateObj = new Date();
        var prefix = String(Math.floor(dateObj.getTime() / this.dayDuration));
        if (this.lastVisitedDay[ip] != prefix){
            this.lastVisitedDay[ip] = prefix;
            var tmp = this.visitDays[ip];
            if (tmp == undefined) tmp = 0;
            tmp += 1;
            this.visitDays[ip] = tmp;
        }
        return this.visitDays[ip];
    };

    incVisitsInTotal(ip){
        var tmp = this.visitInTotal[ip];
        if (tmp == undefined) tmp = 0;
        tmp++;
        return this.visitInTotal[ip] = tmp;
    };

    getClientTotalVisit() {
        return this.totalVisit;
    };
}

class Judger {
    constructor () {
        this.database = new Database();
        this.isOpen = true;
        this.MAX_FLOW_IN_ALL = 15;
        this.MAX_FLOW_PER_IP = 8;
        this.MIN_VALID_DAY_PER_IP = 1;
        this.MIN_VALID_VISIT_PER_IP = 1;

        this.ddosCloseDelay = 10*1000; //10s
        this.previousDDosTime;
    }

    judge(ip) {
        var visitedDayInTotal = this.database.incVisitedDayInTotal(ip);
        var visitsInPeriod = this.database.incVisitsInPeriod(ip);
        var visitsInTotal = this.database.incVisitsInTotal(ip);

        if (!this.isDDos()) return true;
        else {
            if (this.database.isForbidden(ip) ||
                visitsInPeriod > this.MAX_FLOW_PER_IP ||
                visitsInTotal-1 < this.MIN_VALID_VISIT_PER_IP ||
                visitedDayInTotal-1 < this.MIN_VALID_DAY_PER_IP ) {
                this.database.forbidIp(ip);
                return false;
            }
        }
        return true;
    }

    isDDos(){
        var isDDosHappenNow = (this.database.getClientTotalVisit() > this.MAX_FLOW_IN_ALL);
        var dateObj = new Date();
        if (isDDosHappenNow) {
            this.previousDDosTime = dateObj.getTime();
            return true;
        }
        else{
            if (dateObj.getTime() - this.previousDDosTime < this.ddosCloseDelay) return true;
            else {this.database.clearForbiddenTable(); return false;}
        }
    }
}

module.exports = Judger;
