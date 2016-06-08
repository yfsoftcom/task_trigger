var express = require('express');
var router = express.Router();
var eventsM = require('../model/events.js');

//lunch the events
var events = undefined;
eventsM.getStatus().then(function(list){
  events = list;
  //eventsM.resetJobs(events);
  console.log(events);
});


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

router.get('/jobs', function(req, res) {
  eventsM.getStatus().then(function(list){
    var datas ={};
    console.log('-------------------------------');
    _.each(list,function(i) {
      console.log(i);
      datas[i.id] = i;
    });
    //console.log(events);
    //_.each(_.values(events),function(e){
    //  e = _.extend(e,data[i]);
    //});
    //console.log(events);
    res.json(datas);
  }).catch(function(err){
    res.status(500).error(err);
  });
});

module.exports = router;
