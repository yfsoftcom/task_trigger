var express = require('express');
var router = express.Router();
var schedule = require('node-schedule');
var _ = require('underscore');
var Q = require('q');
var async = require('async');
//TODO:ÇÐ»»appkey ºÍ masterkey ºÍ mode
var AE = require('apiengine')({mode:'DEV',scope:'api',appkey:'45883198abcdc106',masterKey:'1b7e5703602b6fce1cae7364ac0f2220'});

// get the jobs
/**
 * {
 *  {id:2,job:{}}
 * }
 *
 */
var events = {};

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
        q.resolve(list._d);
    }).catch(function(err){
        q.reject(err);
    });
    return q.promise;
};
getStatus().then(function(list){
    events = list;
    resetJobs(events);
});

var createJob = function(event){
    return schedule.scheduleJob(event.cron, function(){
        console.log('run ');
        var func = new AE.Function('job.run');
        func.invoke({eventId: event.id});
    });
}

var resetJobs = function(_events){
    _.each(_.values(_events),function(e){
        if(e.job){
            e.job.cancel();
            e.job == null;
        }
        if(!i.autorun){
            return;
        }
        e.job = createJob(i);
    });
};
var startJob = function(id){
    var event = events[id];
    if(event.job){
        event.job.cancel();
    }
    event.job = createJob(event);
};
var stopJob = function(id){
    var event = event[id];
    if(event.job){
        event.job.cancel();
    }
}

router.get('/jobs', function(req, res) {
    getStatus().then(function(list){
        var datas ={};
        _.each(list,function(i) {
            datas[i.id] = i;
        });
        console.log(events);
        _.each(_.values(events),function(e){
            e = _.extend(e,data[i]);
        });
        console.log(events);
        res.json(datas);
    }).catch(function(err){
        res.status(500).error(err);
    });
});

router.get('/reset/:id', function(req, res) {
    var id = req.params.id;
    var modifyer = new AE.Function('api.update');
    modifyer.invoke({table:'api_webevent',condition:'id in ('+id+')',row:{status:1}})
        .then(function(){
            res.send(200);
        }).catch(function(err){
            res.status(500).error(err);
        });
});

router.get('/start/:ids', function(req, res) {
    var ids = req.params.ids;
    async.parallel([
            function(cb){
                var modifyer = new AE.Function('api.update');
                modifyer.invoke({table:'api_webevent',condition:'id in ('+ids+')',row:{autorun:1}})
                    .then(function(){
                        cb(null);
                    }).catch(function(err){
                        cb(err);
                    });
            },
            function(cb){
                //ids = ids.split(',');
                //get the remote data
                var query = new AE.Query('api_webevent');
                query.condition('id in (' + ids + ')');
                query.find().then(function(list){
                    _.each(list._d,function(i) {
                        var job = schedule.scheduleJob(i.cron, function(){
                            console.log('run ');
                            var func = new AE.Function('job.run');
                            func.invoke({eventId: e.id});
                        });
                        jobs[e.id] = job;
                    });
                    res.json(datas);
                });
                _.each(ids,function(i){
                    var e = events[i];
                    e.autorun = 1;
                    var job = schedule.scheduleJob(e.cron, function(){
                        console.log('run ');
                        var func = new AE.Function('job.run');
                        func.invoke({eventId: e.id});
                    });
                    jobs[e.id] = job;
                })
                cb(null);
            }
        ],
        function(err){
            if(err){
                res.status(500).error(err);
            }else{
                res.send(200);
            }
        }
    );
});


router.get('/stop/:ids', function(req, res) {
    var ids = req.params.ids;
    async.parallel([
            function(cb){
                var modifyer = new AE.Function('api.update');
                modifyer.invoke({table:'api_webevent',condition:'id in ('+ids+')',row:{autorun:0}})
                    .then(function(){
                        cb(null);
                    }).catch(function(err){
                        cb(err);
                    });
            },
            function(cb){
                ids = ids.split(',');
                _.each(ids,function(i){
                    if(!jobs[i]) return;
                    jobs[i].cancel();
                    delete jobs[i];
                });
                cb(null);
            }
        ],
        function(err){
            if(err){
                res.status(500).error(err);
            }else{
                res.send(200);
            }
        }
    );
});

module.exports = router;
