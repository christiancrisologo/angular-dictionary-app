'use strict';
 var app = angular.module('myApp', ['DictionaryApi'])
	.directive('cySearchKey', ['SearchHelper','$compile','$document', function(Helper,$compile,$document){
 		// Runs during compile
 		return {
 			// name: '',
 			// priority: 1,
 			// terminal: true,
 			 scope: {keyWord:'@',customHighlight:'@',options:'=',customDialogBox:'@'}, // {} = isolate, true = child, false/undefined = no change
 			// controller: function($scope, $element, $attrs, $transclude) {},
 			// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
 			 restrict: 'AE', // E = Element, A = Attribute, C = Class, M = Comment
 			//template: ''
 			 templateUrl: 'views/SearchHighlight.html',
 			 replace: false,
 			transclude: true,
 			// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
 			link: function($scope, elem, iAttrs, controller,transclude) {
				 				 
			 	$scope.searchCount = 0;
			 	$scope.searchComplete = false;
			 	var transcludeText = "";
			 	var dialogBox ;

			 	var rxDic = {};
			 	rxDic.regular = "(\\b{value}\\b)";
			 	rxDic.anychar = "({value})";
			 	rxDic.specialchar = "(({value})\$)";
			 	rxDic.anyspecialchar = "([{value}])";
			 	$scope.hasFilter = Helper.hasOwnProperty($scope.options, 'hasFilter') ?  $scope.options.hasFilter : true;
			 	var hasDictionary = Helper.hasOwnProperty($scope.options, 'hasDictionary') ?  $scope.options.hasDictionary : false;
			 	$scope.writable = Helper.hasOwnProperty($scope.options, 'writable') ?  $scope.options.writable : false;
			 	var hasPopup =  Helper.hasOwnProperty($scope.options, 'hasPopup') ?  $scope.options.hasPopup : false;
			 	var highlightColor = Helper.hasOwnProperty($scope.options, 'color') ?  $scope.options.color : 'yellow';			 	
			 	var customHighlight = $scope.customHighlight || "";
			 	var customDialogBox = $scope.customDialogBox || "";
		        var _transcludeText = "";		        
		        var container = angular.element(elem[0].querySelector('#searchContainer'));
		       
		       	transclude(function(clone) {						
			        if(!Helper.isNullUndefined(clone.text()) ){
			        	_transcludeText = clone.text();
			        	transcludeText = _transcludeText;
			        }
				});



				$scope.clear=function(){					
					transcludeText = _transcludeText;
					if($scope.writable){
						var tempContentText = container.text();
						tempContentText.replace(lastHighlighter,'');
						tempContentText.replace('</span>','');
						container.html(tempContentText);
					}else{
						container.html(transcludeText);
					}
					
					$scope.keyWord="";
					$scope.searchComplete = false;
					if(dialogBox) dialogBox.remove();
				}
				$scope.searchText = function(v){	 
					if($scope.writable) transcludeText = container.text();
					$scope.searchComplete = false;
					if(Helper.isNullUndefined($scope.keyWord)){return;}
					
					var isSpecialchar = /[^a-zA-Z\d\s:']/.test($scope.keyWord);
					var s =  String($scope.transcludeText);
					var regexString = rxDic.regular.replace('{value}',$scope.keyWord);
					if(isSpecialchar) regexString = rxDic.specialchar.replace('{value}',$scope.keyWord);
					var query = null;
					var regMod = "gim";					
					if($scope.filter && $scope.filter.anychar){
						regexString = rxDic.anychar.replace('{value}',$scope.keyWord);	
						if(isSpecialchar) regexString = rxDic.anyspecialchar.replace('{value}',$scope.keyWord);
						 regMod= regMod.replace(/m/,"");
					}
					if($scope.filter &&  $scope.filter.casesensitive){
						 regMod= regMod.replace(/i/,"");
					}					
					query = new RegExp(regexString, regMod); 					
					$scope.searchCount = transcludeText.match(query) ? transcludeText.match(query).length : 0;
					//create element string for highlights
					var highlightElementStr =  createHighlighterElement();					
					// render the search 
					transcludeText  =  transcludeText.replace(query, highlightElementStr);
					container.html(transcludeText);
					$compile(container)($scope);
					$scope.searchComplete = true;
				}

				var lastHighlighter = "";
				var createHighlighterElement = function(){					
					var st = '<span style="background:'+ highlightColor +'" >$1</span>';
					lastHighlighter = '<span style="background:'+ highlightColor +'" >';
					if(hasPopup && customHighlight=="" ){
						st =  '<span style="background:'+ highlightColor +'" ><a href="#" ng-click="showDialog(\'$1\')">$1</a></span>';	
						lastHighlighter = '<span style="background:'+ highlightColor +'" ><a href="#" ng-click="showDialog(\'$1\')">';
					}else if(customHighlight!=""){
						st = customHighlight;
					}
					return st;
				}

				
				$scope.showDialog = function(v){
					var dialogBoxStr = '<div cy-popup title="Search Word for (' + v + ')" '
					dialogBoxStr	+= ' onClose="dialogBoxClose" > ' + v 
					dialogBoxStr	+= ' </div >';					
					if(customDialogBox!=""){
						dialogBoxStr = customDialogBox.replace('{value}',v);
					}					
					elem.after(dialogBoxStr);
			       	dialogBox= $compile(elem.next())($scope);
				}

 			}
 		}
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
				 restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
				 //template: ''
				 templateUrl: 'views/PopupDictionary.html',
				 replace: true,
				 transclude: true,
				// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
				link: function($scope, elem, iAttrs, controller,transclude) {
					$scope.hasDictionary = Helper.hasOwnProperty($scope.options, 'hasDictionary') ?  $scope.options.hasDictionary : false;
					transclude(function(clone) {					        
				        if(!Helper.isNullUndefined(clone.data()) ){
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
	 		}]);
