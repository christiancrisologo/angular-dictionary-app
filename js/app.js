'use strict';

var App = angular.module('DictApp', [])

    .controller("MainCtrl", ['$scope','DictionaryService', function ($scope,Feed) {    
        $scope.url = "http://www.dictionaryapi.com/api/v1/references/collegiate/xml/";
        $scope.key = "cb44f493-8a21-4b78-b06d-f3bc7928c989";
         $scope.entries = [];
         $scope.suggestions = [];
         $scope.searchFound = false;
         $scope.histories = [];
        $scope.loadFeed=function(e){   
            $scope.searchFound = false;
            Feed.get($scope.url,$scope.searchWord,$scope.key,function(result){
                createList(result);
                $scope.searchFound = true;
                if($scope.histories.indexOf($scope.searchWord)<0){
                    $scope.histories.push($scope.searchWord);
                }
            }).then(function(res){});
        }

        var createList = function(data){
               
                var entry_list  = data.entry_list.entry;
                var newAr = [];
                var _entry;
                for (_entry in entry_list){
                    var v1 = entry_list[_entry];                    
                    var newItem = {ew:"",fl:"",pr:"",def:[]};
                    if(v1["def"]!='undefined' && v1["def"] && v1["def"]["dt"]!='undefined' ){
                        newItem.ew = v1["ew"];
                        newItem.fl = v1["fl"];
                        newItem.pr = v1["pr"];
                        var definitions = getDefinitions(v1["def"]["dt"]);
                        newItem.def = definitions;
                        newAr.push(newItem);
                    }
                }
               $scope.entries = newAr;
               $scope.suggestions = data.entry_list['suggestion']!='undefined' ? data.entry_list.suggestion : [];

        }


        var getText = function (v){            
            return ( v["__text"]!='undefined' && v["__text"] &&  v["__text"].length>1)  ? v["__text"] : "";
        }

        var getDefinitions = function (v){            
            var r = [];            
            if(getText(v)!=""){
                r.push({prop:"",label:getText(v)})
            }else{
                var v1;    
                for( v1 in v){
                    if(v1!="" && getText(v[v1])!=""){
                        r.push({prop:v1,label:getText(v[v1])});
                    }
                }
            }
            return r;
        }


        $scope.suggest = function(v){ 
            $scope.searchWord = v;
             $scope.loadFeed();
        }

        $scope.clear=function(){
         $scope.entries = [];
         $scope.suggestions = [];
         $scope.searchFound = false;
         $scope.histories = [];
         $scope.searchWord = "";
        }
    }])
    

    .factory('DictionaryService',['$http', '$window',function($http, $window){
        return {
            /*parseFeed : function(url){
                return $http.jsonp('//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(url));
            }*/
            get:
               function(url,searchWord,key,success){
                    return $http({
                        method  : 'GET',
                        url     : url + "" + searchWord + "?key=" + key ,                        
                        params  : {}, 
                        transformResponse: function (data) {
                            var x2js = new X2JS();
                            var aftCnv = x2js.xml_str2json(data);
                            return aftCnv;
                        }
                    }).success(function(data, status, headers, config) {
                        success(data);
                        console.dir(data);
                        console.log('SUCCESS!' );
                    }).error(function(data, status, headers, config) {
                        console.log('ERROR!');
                    });
                }

        }
    }]);