var app = angular.module('AngramApi', []);

	app.directive('cyAnagram', ['AnagramService', function(Feed){
		// Runs during compile
		return {
			// name: '',
			// priority: 1,
			// terminal: true,
			 scope: {options:'=',defaultWord:'@searchFor'}, // {} = isolate, true = child, false/undefined = no change
			 controller: function($scope, $element, $attrs, $transclude) {

			 },
			// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
			 restrict: 'AEC', // E = Element, A = Attribute, C = Class, M = Comment
			 //template: '<div > </div>',
			 templateUrl: 'views/Anagram.html',
			 replace: true,
			// transclude: true,
			// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
			link: function($scope, iElm, iAttrs, controller) {

					var bestUrl = "http://www.anagramica.com/best/"
					var allUrl = "http://www.anagramica.com/all/";
			        $scope.hasHistory = hasOwnProperty($scope.options,'hasHistory') ? $scope.options.hasHistory : false;
			        $scope.searchFound = false;
			        $scope.histories = [];
			        //$scope.besties = [];
			        //$scope.suggestions = [];
			        $scope.feedStatus = 'none';
			        $scope.searchWord = $scope.defaultWord;
			        
			        $scope.loadFeed=function(v){
			        	if(!isNullUndefined(v)) {
			        		$scope.searchWord = v;
			        	}

			            $scope.searchFound = false;
			            $scope.feedStatus = 'loading';

			            Feed.get(bestUrl+$scope.searchWord ,function(result){
			                $scope.besties = result.best;			                
			                if($scope.hasHistory && $scope.histories.indexOf($scope.searchWord)<0){
			                    $scope.histories.push($scope.searchWord);
			                }
			                Feed.get(allUrl+$scope.searchWord ,function(result){
			                	var all = [].concat(result.all);
			                	var besties = [].concat($scope.besties);
			                	var v1;
			                	var newItems = [];
			                	
			                	for( v1 in all){
			                		if(!isNullUndefined(all[v1] ) && besties.indexOf( all[v1])<0 ){
			                				newItems.push(all[v1]);
			                		}			                		
			                	}
				                $scope.suggestions = newItems;
			            	});
			            	$scope.searchFound = true;
			                $scope.feedStatus = 'complete';
			            });
			        }
  
					function isNullUndefined(v){
			        		return v==null || v==undefined || v=="" ? true : false;
			        }
			        function hasOwnProperty(obj,prop){
			        	if(isNullUndefined(obj)) return false;			        	
			        	return (obj[prop] && !isNullUndefined(obj[prop]))? true : false;
			        }

			    $scope.clearHistory =function(){
					$scope.histories = [];
				}
			    
			     $scope.loadFeed();
			}
		};
	}])

	.factory('AnagramService',['$http', function($http){
        return {
            get:
               function(url,success){               		
                    return $http({
                        method  : 'GET',
                        url     : (url).trim() ,                        
                        params  : {}, 
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