var _ = require('underscore');
var schedule = require('node-schedule');
var Q = require('q');
var async = require('async');
//TODO:ÇÐ»»appkey ºÍ masterkey ºÍ mode
var AE = require('apiengine')({mode:'DEV',scope:'api',appkey:'45883198abcdc106',masterKey:'1b7e5703602b6fce1cae7364ac0f2220'});

var jobs = undefined;
var getStatus = function(ids){
    var q = Q.defer();
    var query = new AE.Query('api_webevent');
    if(ids){
        if(_.isArray(ids)){
            ids = ids.join(',');
        }
        query.condition('id in (' + ids + ')')
    }
    query.find().then(function(list){
        var events = list._d;
        if(jobs){
            for(var i in events){
                var e = events[i];
                if(_.has(jobs, e.id)){
                    e.job = jobs[e.id];
                }
            }
        }
        q.resolve(events);
    }).catch(function(err){
        q.reject(err);
    });
    return q.promise;
};

var createJob = function(event){
    return schedule.scheduleJob(event.cron, function(){
        console.log('run ');
        var func = new AE.Function('job.run');
        func.invoke({eventId: event.id});
    });
};

var resetJobs = function(_events){
    jobs = {};
    for(var i in _events){
        var e = _events[i];
        if(e.job){
            e.job.cancel();
            e.job == null;
            delete e.job;
        }
        if(!e.autorun){
            continue;
        }
        jobs[e.id] = e.job = createJob(e);
    }
};
var startJob = function(_event){
    var job = jobs[_event.id];
    if(job){
        job.cancel();
    }
    job = createJob(_event);
    jobs[_event.id] = job;
    return job
};

var stopJob = function(_event){
    var job = jobs[_event.id];
    if(job){
        job.cancel();
        delete jobs[event.id];
    }
};

var resetEvent = function(_event){
    var modifyer = new AE.Function('api.update');
    return modifyer.invoke({table:'api_webevent',condition:'id in ('+_event.id+')',row:{status:1}});
}

module.exports = {
    getStatus:getStatus,
    resetJobs:resetJobs,
    startJob:startJob,
    stopJob:stopJob,
    resetEvent:resetEvent
};