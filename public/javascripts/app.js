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
taskApp.controller('taskCtrl',function(taskFactory,$scope){
    taskFactory.getTask().then(function(tasks){
        $scope.tasks = tasks;
    });
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
            console.log($scope.tasks);
            if(_.isUndefined(index)){
                //$scope.$apply(function() {
                    for (var i in $scope.tasks) {
                        $scope.tasks[i].autorun = status;
                    }
                //});
            }else if(_.isNumber(index)){
                //$scope.$apply(function() {
                    $scope.tasks[index].autorun = status;
                //});
            }
            console.log($scope.tasks);
        }).catch(function(err){
            console.log(err);
            //location.reload();
        });
    };

    //
    $scope.reset = function(id){
        if(!confirm('Are you sure REST the Job?')){
            return;
        }
        alert(id);
        taskFactory.reset(id).then(function(){

        })
            .catch(function(err){
                console.log(err);
            })
    }
});

taskApp.factory('taskFactory',function($http,$q){
    return {
        getTask:function(){
            var q = $q.defer();
            $http.get('/job/jobs').then(function(data){
                q.resolve(_.values(data.data));
            }).catch(function(err){
                q.reject(err);
            })
            return q.promise;
        },
        action:function(action,taskid){
            var taskid = taskid.join(',');
            var q = $q.defer();
            $http.get('/job/'+action+'/'+taskid).then(function(){
                q.resolve(1);
            }).catch(function(err){
                q.reject(err);
            });
            return q.promise;
        },
        reset:function(id){
            var q = $q.defer();
            $http.get('/job/reset/'+id).then(function(){
                q.resolve(1);
            }).catch(function(err){
                q.reject(err);
            });
            return q.promise;
        }
    }
});