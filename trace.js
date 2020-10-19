var sampleApp = angular.module('sampleApp', []);

sampleApp.controller('TraceController', ['$scope', '$http','$q', function ($scope, $http) {
    $scope.traceData={};
    $scope.traceDataToShow={request:[], response:[]};
    $scope.allPoints = {};
    $scope.selectedStep=null;
    loadTrace=function() {
        $http.get("/json/trace-1602921486393.json").then(function(response){
            //console.log(response);
            $scope.traceData = response.data;
            //console.log($scope.traceData);
            $scope.$emit("doTranslateData",{"auditData":$scope.traceData.DebugSession.Messages.Message.Data});
        }, function(error){
            console.log(error);
        });
        
    };
    $scope.$on("doTranslateData", function(eventName, traceData){
        //console.log("doTranslateData", traceData, traceData.auditData);
        var request = true;
//        for(var i=0, len=traceData.auditData.Point.length; i<len;i++ ){
//            console.log(i);
//            var step = traceData.auditData.Point[i];
//            if (step.DebugInfo!=null) {
//                //console.log(step, key);
//                if (step.ResponseMessage!=null) {
//                    request = false;
//                }
//                if (request) {
//                    $scope.traceDataToShow.request.push(step);
//                }
//                else {
//                    $scope.traceDataToShow.response.push(step);
//                }
//            }
//        };
//        $(".traceElement").each(function(){
//            console.log(this);
//        });
        angular.forEach(traceData.auditData.Point, function(step, key) {
            if (!$scope.allPoints[step.id]) {
                //console.log("add to list", step.id);
                $scope.allPoints[step.id]={};
                $scope.allPoints[step.id].visible=true;
            }
            //console.log($scope.allPoints);
            if (step.DebugInfo!=null) {
                //console.log(step, key);
                if (step.ResponseMessage!=null) {
                    request = false;
                }
                if (request) {
                    $scope.traceDataToShow.request.push(step);
                }
                else {
                    $scope.traceDataToShow.response.push(step);
                }
            }
        });
    });
    function getProperty(properties, propertyName) {
        for(var i=0, len=properties.length; i<len;i++ ){
            //console.log(properties[i], propertyName);
            if(properties[i].name==propertyName) {
                return properties[i].text;
            }
        }
        return "";
    }
    $(document).keydown(function(e){
        if(e.which==39) {
            console.log("right");
            $(".teBorderColorSelected").each(function(element){
                console.log(this);
                console.log("parent",angular.element(this).parent(function(
                ){
                    console.log("parent", this.getAttribute("class"));
                }));
                $(".teBorderColorSelected").next(".traceElement").each(function(){
                    console.log(this);
                    angular.element(this).triggerHandler('click');
                });
            });
        }
        if(e.which==37) {
            console.log("left");
            $(".teBorderColorSelected").each(function(element){
                console.log(this);
                $(".teBorderColorSelected").prev(".traceElement").each(function(){
                    console.log(this);
//                    $scope.selectItem({target:this},null);
                    angular.element(this).triggerHandler('click');
                });
            });
        }
    });
    $scope.traceKeyPressed = function($event,$this,step) {
        console.log("traceKeyPressed");
        console.log("$event,$this,step",$event,$this,step);
    };
    $scope.getTextFromStep=function(step) {
        if (step.id=="Condition") {
//            console.log(step.DebugInfo.Properties.Property)
//            console.log(getProperty(step.DebugInfo.Properties.Property,"ExpressionResult"));
            return getProperty(step.DebugInfo.Properties.Property,"ExpressionResult").substring(0,1).toUpperCase();
        };
        return "";
    };
    $scope.showItem = function(step) {
//        if (step.id=="FlowInfo") {
//            return false;
//        }
//        if (step.id=="DebugMask") {
//            return false;
//        }
        if ($scope.allPoints[step.id]) {
            return $scope.allPoints[step.id].visible;
        }
        return true;
    };
    $scope.setClass=function(step) {
        var retClasses=[];
        //console.log(step);
        switch(step.id) {
            case "Error": {
                retClasses.push("teError");
                break;
            };
            case "DebugMask": {
                retClasses.push("teDebugMask");
                break;
            };
            case "StateChange": {
                retClasses.push("teStateChange");
                break;
            };
            case "FlowCallout":
            case "FlowReturn" : {
                retClasses.push("teFlowSmall");
                break;
            }
            case "FlowInfo": {
                if(step.DebugInfo.Properties && step.DebugInfo.Properties.Property) {
                    retClasses.push("teFlowInfo");
                }
                else {
                    retClasses.push("teFlowSmall");
                }
                break;
            };
            case "Execution": {
                //retClasses.push("traceElement");
                retClasses.push("tePolicy");
                if(step.DebugInfo.Properties && step.DebugInfo.Properties.Property) {
                    //console.log("stepType21",step.DebugInfo.Properties.Property);
                    var stepType = getProperty(step.DebugInfo.Properties.Property,"type");   
                    //console.log("stepType21", stepType, step.DebugInfo.Properties);
//                    console.log("stepType2", step.DebugInfo.Properties.Property);
                    if(stepType && stepType!="") {
                        retClasses.push("te_"+stepType);
                    }
                }
                var expressionResult = getProperty(step.DebugInfo.Properties.Property,"expressionResult");   
                var stepDefinitionEnabled = getProperty(step.DebugInfo.Properties.Property,"stepDefinition-enabled");   
                if(expressionResult=="false") {
                    retClasses.push("teNotProcessed");
                }
                if(stepDefinitionEnabled=="false") {
                    retClasses.push("teDisabled");
                }
//                retClasses.push("teFlowInfo");
                break;
            };
            case "Condition": {
                retClasses.push("teCondition");
                break;
            };
        };
        return retClasses;
    };
    $scope.selectItem = function(element,step) {
        $scope.selectedStep = step;
        //console.log(element.target);
        var stepType = "";
        if (step!=null) {
            if (step.DebugInfo.Properties && step.DebugInfo.Properties.Property) {
                stepType = getProperty(step.DebugInfo.Properties.Property,"stepDefinition-type");  
            }
        }
        //console.log("stepType", stepType);
        if ($(element.target).hasClass('traceElement')) {
            $(".traceElement").removeClass('teBorderColorSelected');
            $(element.target).addClass('teBorderColorSelected');
        }
    };
    init=function() {
        loadTrace();
    };
    init();
}]);