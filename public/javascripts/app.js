var taskApp = angular.module('task-app',[]);

taskApp.filter('task_status',function(){
    return function(src){
        switch(src){
            case 1:return 'Normal'
            case 99:return 'Pending'
        }
        return 'Unknown'
    }
});
taskApp.controller('taskCtrl',function(taskFactory,$scope,$interval){

    var timer = $interval(function(){ },5 * 60 * 1000);
    timer.then(function(){
        $scope.reload();
    })
    $scope.lastRefreshTime = new Date().getTime();
    $scope.reload = function(){
        taskFactory.getTask().then(function(tasks){
            $scope.tasks = tasks;
            $scope.lastRefreshTime = new Date().getTime();
        });
    };

    $scope.reload();
    $scope.action = function(action,index){
        var ids = [];
        if(_.isUndefined(index)){
            ids = _.map($scope.tasks,function(t){
                return t.id;
            });
        }else if(_.isNumber(index)){
            ids = [$scope.tasks[index].id];
        }else{
            alert('Task Required~');
        }
        var status = action=='start'?1:0;
        taskFactory.action(action,ids).then(function(){
            if(_.isUndefined(index)){
                for (var i in $scope.tasks) {
                    $scope.tasks[i].autorun = status;
                }
            }else if(_.isNumber(index)){
                $scope.tasks[index].autorun = status;
            }
        }).catch(function(err){
            console.log(err);
        });
    };
    $scope.reset = function(task){
        if(!confirm('Are you sure REST the Job?')){
            return;
        }
        taskFactory.reset(task.id).then(function(){
            task.status = 1;
        })
            .catch(function(err){
                console.log(err);
            })
    }

    $scope.event = {};
    //创建一个新的job event
    $scope.save = function(){
        taskFactory.create($scope.event).then(function(data){
            $scope.tasks.push(data);
        }) .catch(function(err){
            alert(err.message);
        }).finally(function(){
            $('#modal-create').modal('hide');
            $scope.event = {};
        })
    }
});

taskApp.factory('taskFactory',function($http,$q){
    return {
        getTask:function(){
            var q = $q.defer();
            $http.get('/jobs').then(function(data){
                q.resolve(_.values(data.data));
            }).catch(function(err){
                q.reject(err);
            })
            return q.promise;
        },
        create:function(event){
            var q = $q.defer();
            event.autorun = event.autorun?1:0;
            $http.post('/create',event).then(function(data){
                q.resolve(data.data);
            }).catch(function(err){
                q.reject(err);
            });
            return q.promise;
        },
        action:function(action,taskid){
            var taskid = taskid.join(',');
            var q = $q.defer();
            $http.get('/'+action+'/'+taskid).then(function(){
                q.resolve(1);
            }).catch(function(err){
                q.reject(err);
            });
            return q.promise;
        },
        reset:function(id){
            var q = $q.defer();
            $http.get('/reset/'+id).then(function(){
                q.resolve(1);
            }).catch(function(err){
                q.reject(err);
            });
            return q.promise;
        }
    }
});