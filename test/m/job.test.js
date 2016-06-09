var assert = require('chai').assert;
var expect = require('chai').expect;
var eventM = require('../../model/events.js');
var events = undefined;
describe('JOB', function() {
    describe('#getStatus()', function () {
        it('getStatus return 2 events', function (done) {
            eventM.getStatus().then(function(list){
                expect(list).to.have.length(2);
                events = list;
                done()
            }).catch(function(err){
                done(err);
            });
        });
    });

    describe('#resetEvent()', function () {
        it('resetEvent events', function (done) {
            eventM.resetEvent({id:2}).then(function(data){
                expect(data.affectedRows).to.equal(1);
                done()
            }).catch(function(err){
                done(err);
            });
        });
    });

    describe('#resetJobs()',function(){
        it('resetJobs ',function(done){
            var jobs = eventM.resetJobs(events);
            done();
        })
    });
    describe('#startJob()',function(){
        it('startJob ',function(done){
            var job = eventM.startJob(events[0]);
            events[0].sjob = job;
            done();
        })
    });

    describe('#stopJob()',function(){
        it('stopJob ',function(done){
            eventM.stopJob(events[0]);
            done();
        })
    });


});
