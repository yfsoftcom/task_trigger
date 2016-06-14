var express = require('express');
var router = express.Router();
var eventsM = require('../model/events.js');
var _ = require('underscore');

//lunch the events
var events = undefined;
eventsM.getStatus().then(function(list){
  events = list;
  eventsM.resetJobs(events);
  _.each(events,function(e){
    events[e.id] = e;
  })
});


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

router.get('/jobs', function(req, res) {
  eventsM.getStatus().then(function(list){
    var datas ={};
    _.each(list,function(i) {
      datas[i.id] = i;
    });
    res.json(datas);
  }).catch(function(err){
    res.status(500).error(err);
  });
});

router.post('/create', function(req, res) {
  var _e = req.body;
  _e.status = 1;
  eventsM.createEvent(_e).then(function(data){
    var e = data._d;
    res.json(e);
    events[e.id] = e;
    eventsM.startJob(e);
  }).catch(function(err){
    res.status(500).error(err);
  });
});


router.get('/start/:ids', function(req, res) {
  var ids = req.params.ids;
  var ids = ids.split(',');
  _.each(ids,function(i){
    events[i].sjob = eventsM.startJob(events[i]);
  });
  res.json(1);
});

router.get('/stop/:ids', function(req, res) {
  var ids = req.params.ids;
  var ids = ids.split(',');
  _.each(ids,function(i){
    eventsM.stopJob(events[i]);
    delete events[i].sjob;
  });
  res.json(1);
});

router.get('/reset/:ids', function(req, res) {
  var ids = req.params.ids;
  var ids = ids.split(',');
  _.each(ids,function(i){
    eventsM.resetEvent(events[i]);
  });
  res.json(1);
});

module.exports = router;
