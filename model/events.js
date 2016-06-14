var _ = require('underscore');
var schedule = require('node-schedule');
var Q = require('q');
var async = require('async');
var C = require('../config.js');
var AE = require('apiengine')(C.ae);

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
        console.log(events);
        if(jobs){
            for(var i in events){
                var e = events[i];
                if(_.has(jobs, e.id)){
                    e.sjob = jobs[e.id];
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
        console.log('run job;ID:' + event.id );
        console.log('run job;JOB:' + event.job );
        var func = new AE.Function('job.run');
        func.invoke({eventId: event.id});
    });
};

var resetJobs = function(_events){
    jobs = {};
    for(var i in _events){
        var e = _events[i];
        if(e.sjob){
            e.sjob.cancel();
            e.sjob == null;
            delete e.sjob;
        }
        if(!e.autorun){
            continue;
        }
        jobs[e.id] = e.sjob = createJob(e);
    }
    return jobs;
};
var startJob = function(_event){
    var job = jobs[_event.id];
    if(job){
        job.cancel();
    }
    job = createJob(_event);
    jobs[_event.id] = job;
    var modifyer = new AE.Function('api.update');
    modifyer.invoke({table:'api_webevent',condition:'id in ('+_event.id+')',row:{autorun:1}});
    return job;
};

var stopJob = function(_event){
    var job = jobs[_event.id];
    if(job){
        job.cancel();
        delete jobs[_event.id];
    }
    var modifyer = new AE.Function('api.update');
    modifyer.invoke({table:'api_webevent',condition:'id in ('+_event.id+')',row:{autorun:0}});
};

var resetEvent = function(_event){
    var modifyer = new AE.Function('api.update');
    return modifyer.invoke({table:'api_webevent',condition:'id in ('+_event.id+')',row:{status:1}});
};

var createEvent = function(_event){
    var _o = new AE.Object('api_webevent');
    _o.set(_event);
    return _o.create();
}

module.exports = {
    createEvent:createEvent,
    getStatus:getStatus,
    resetJobs:resetJobs,
    startJob:startJob,
    stopJob:stopJob,
    resetEvent:resetEvent
};