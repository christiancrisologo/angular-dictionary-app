
var app = angular.module('AngramApi', ['DictionaryApi'])

	.directive('cyAnagram', ['AnagramService','SearchHelper','$compile', function(Feed,Helper,$compile){
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
			 templateUrl: 'views/AnagramV2.html',
			 replace: true,
			// transclude: true,
			// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
			link: function($scope, elem, iAttrs, controller) {

				var bestUrl = "http://www.anagramica.com/best/"
				var allUrl = "http://www.anagramica.com/all/";
		        $scope.hasHistory = Helper.hasOwnProperty($scope.options,'hasHistory') ? $scope.options.hasHistory : false;
		        var autoLoad = Helper.hasOwnProperty($scope.options,'autoLoad') ? $scope.options.autoLoad : false;
		        $scope.hasSearchBox = Helper.hasOwnProperty($scope.options,'hasSearchBox') ? $scope.options.hasSearchBox : true;
		        console.log("hasSearchBox " + $scope.hasSearchBox);
		        $scope.searchFound = false;
		        $scope.histories = [];
		        $scope.feedStatus = 'none';
		        $scope.searchWord = $scope.defaultWord;
		        
		        $scope.loadFeed=function(v){
		        	if(!Helper.isNullUndefined(v)) {
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
		                		if(!Helper.isNullUndefined(all[v1] ) && besties.indexOf( all[v1])<0 ){
		                				newItems.push(all[v1]);
		                		}			                		
		                	}
			                $scope.suggestions = newItems;
		            	});
		            	$scope.searchFound = true;
		                $scope.feedStatus = 'complete';
		            });
		        }
  				var customDialogBox = "";
  				var dialogBox;
				$scope.showDialog = function(v){
					var dialogBoxStr = '<div cy-popup title="Search Word for (' + v + ')" '
					dialogBoxStr	+= '  > ' + v 
					dialogBoxStr	+= ' </div >';
					elem.after(dialogBoxStr);
			       	dialogBox= $compile(elem.next())($scope);
				}

				$scope.clearHistory =function(){
					$scope.histories = [];
				}

				$scope.reset=function(){
					$scope.besties = []
					$scope.suggestions = [];
					$scope.searchFound = false;
			        $scope.feedStatus = 'none';
			        $scope.searchWord = ""
				}

				$scope.$watch('defaultWord',function(newValue,oldValue){
					if(!Helper.isNullUndefined(newValue))
					{
						$scope.loadFeed(newValue);
					}
				});


			    if(autoLoad){
			    	$scope.loadFeed();
			    }else{
			    	$scope.reset();
			    }
			}
		};
	}])

	.directive('cyPopup', ['SearchHelper', function(Helper){
			// Runs during compile
			return {
				// name: '',
				// priority: 1,
				// terminal: true,
				 scope: {onClose:'&',title:'@',options:'='}, // {} = isolate, true = child, false/undefined = no change
				// controller: function($scope, $element, $attrs, $transclude) {},
				// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
				 restrict: 'AEC', // E = Element, A = Attribute, C = Class, M = Comment
				 //template: ''
				 templateUrl: 'views/PopupDictionary.html',
				 replace: true,
				 transclude: true,
				// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
				link: function($scope, elem, iAttrs, controller,transclude) {					
					transclude(function(clone) {					        
				        if(!Helper.isNullUndefined(clone.data()) ){
				        	console.log('popup = '  + clone.text())
				        	$scope.message = clone.text().trim();
				        }
				});
					$scope.onClose=function(){
						elem.remove();
					}
				}
			};
		}])

	.factory('SearchHelper',[ function(){
		   return {

		        isNullUndefined:
				        function (v){
				        		return v==null || v==undefined || v=="" ? true : false;
				        },

		        hasOwnProperty :
			        	function (obj,prop){
			        		if(this.isNullUndefined(obj)) return false;			        	
			        		if(obj[prop]==false || obj[prop]=='false') return true;
			        		return (obj[prop] && !this.isNullUndefined(obj[prop]))? true : false;
			        	},
	 				
	 			}
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