var app = angular.module('DictionaryApi', []);

	app.directive('cyDictionary', ['DictionaryService','DictionaryHelper', function(Feed,Helper){
		// Runs during compile
		return {
			// name: '',
			// priority: 1,
			// terminal: true,
			 scope: {options:'=',defaultWord:'@searchFor',goSearch:'&' }, // {} = isolate, true = child, false/undefined = no change
			controller: function($scope, $element, $attrs, $transclude) {
			/*		$scope.$watch('searchWord', function(newValue, oldValue, scope) {
					console.log('searchWord== ' +  $scope.searchWord);
				});*/
			},
			// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
			 restrict: 'AEC', // E = Element, A = Attribute, C = Class, M = Comment
			 //template: '<div > </div>',
			 templateUrl: 'views/Dictionary.html',
			 //replace: true,
			 transclude: true,
			// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
			link: function($scope, iElm, iAttrs, controller,transclude) {

				var url = Helper.hasOwnProperty($scope.options,'api') ?   $scope.options.api : "http://www.dictionaryapi.com/api/v1/references/collegiate/xml/";
		        var key = Helper.hasOwnProperty($scope.options, 'key') ?  $scope.options.key : "cb44f493-8a21-4b78-b06d-f3bc7928c989";
		        $scope.hasSearchBox = Helper.hasOwnProperty($scope.options, 'hasSearchBox') ?  $scope.options.hasSearchBox : true;
		        $scope.hasHistory = Helper.hasOwnProperty($scope.options,'hasHistory') ? $scope.options.hasHistory : false;
		        $scope.hasClose = Helper.hasOwnProperty($scope.options,'hasClose') ? $scope.options.hasClose : false;
		        var autoLoad = Helper.hasOwnProperty($scope.options,'autoLoad') ? $scope.options.autoLoad : false;
		        var entries = [];
		       	
		        // console.log("get text = " + iElm.find('ng-transclude').text() );
		        var transcludeText = "";
				transclude(function(clone) {					        
				        if(!Helper.isNullUndefined(clone.text()) ){
				        	transcludeText = clone.text();		
				        }
				});				

				$scope.searchWord = Helper.isNullUndefined($scope.defaultWord) ? "" : $scope.defaultWord;	
				///console.log('$scope.searchWord=' + $scope.searchWord)
		        $scope.loadFeed=function(e){ 
		        	console.log('loadFeed = ' + $scope.searchWord );
		        	if(!Helper.isNullUndefined(e)){
		        		$scope.searchWord = e;
		        	}
		            $scope.searchFound = false;
		            $scope.feedStatus = 'loading';
		            Feed.get(url,$scope.searchWord,key,function(result){
		                $scope.entries = Helper.createList(result);
		                $scope.suggestions = Helper.getSuggestions(result);
		                $scope.searchFound = true;
		                if($scope.hasHistory && $scope.histories && $scope.histories.indexOf($scope.searchWord)<0){
		                    $scope.histories.push($scope.searchWord);
		                }
		                 $scope.feedStatus = 'complete';
		            }).then(function(res){});
		        }			       

		        $scope.close = function(){
		        	$scope.$destroy();
		        	iElm.remove();
		        }
		        $scope.suggest = function(v){
		            console.log('suggest ' + v);
		            $scope.searchWord = v;
		             $scope.loadFeed();
		        }
			    
			    $scope.reset = function(){
			        $scope.entries = [];
			        $scope.searchWord = "";
			        $scope.suggestions = [];
			        $scope.searchFound = false;
			        $scope.histories = [];
			        $scope.feedStatus = 'none';			    	
			    }
			    $scope.clearHistory =function(){
					$scope.histories = [];
				}

				$scope.goSearch=function(v){
					  $scope.loadFeed(v);
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
	.directive('cyDictionaryAttrib', ['DictionaryService','DictionaryHelper','$compile', function(Feed,Helper,$compile){
		// Runs during compile
		return {
			// name: '',
			// priority: 1,
			// terminal: true,
			 scope: {options:'=',defaultWord:'@word'}, // {} = isolate, true = child, false/undefined = no change
			 controller: function($scope, $element, $attrs, $transclude) {

			 },
			// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
			 restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
			//template: '<div > xx {{searchWord}} xxx</div>',
			//templateUrl: 'views/Dictionary.html',
			 replace: false,
			 transclude: false,
			// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
			link: function($scope, iElm, iAttrs, controller) {						
				var hasPopup =  Helper.hasOwnProperty($scope.options, 'hasPopup') ?  $scope.options.hasPopup : false;

			    iElm.bind('click', function () {
		       			console.log('value=' + iElm.text())
		       			var t = "<cy-dictionary word='"+iElm.text() ;
		       			t += "' options='{hasSearchBox:false,hasClose:true,autoLoad:true}' style='margin-left:20px;' > </cy-dictionary>"
		       			iElm.after(t);
		       			$compile(iElm.next())($scope);
		       			 //$compile(iElm.contents())($scope)
		       });
			}
		};
	}])


	.factory('DictionaryService',['$http', function($http){
        return {
            get:
               function(url,searchWord,key,success){
               		console.log("url= " + url + " searchWord=" + searchWord + " key=" +key);
                    return $http({
                        method  : 'GET',
                        url     : (url +  searchWord + "?key=" + key).trim() ,                        
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
    }])

	.factory('DictionaryHelper',[ function(){
	   return {
			createList: 
        		function(data){			               
		                var entry_list  = data.entry_list.entry;
		                var newAr = [];			                
		                console.log("entry_list " +  (entry_list instanceof Array))
		                if( entry_list instanceof Array ) {
		                	var _entry;
							for (_entry in entry_list){
			                    var v1 = entry_list[_entry];
			                    var v2 = this.createItem(v1);
			                    if(v2) newAr.push(v2);	
			                }
						}else{
							if(entry_list){
								newAr.push(this.createItem(entry_list));	
							} 
						}
		                
		               return newAr;
			               
			        },
			 getSuggestions : 
			 		function(data){
			 			return data.entry_list['suggestion']!='undefined' ? data.entry_list.suggestion : [];
			 		},


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

	        createItem :
		        	function(v){
						var newItem ;
	                	newItem =  {ew:"",fl:"",pr:"",def:[]};
	                    newItem.ew = v["ew"];
	                    newItem.fl = v["fl"];
	                    newItem.pr = v["pr"];
	                    if(v["def"]!='undefined' && v["def"] && v["def"]["dt"]!='undefined' ){
	                        var definitions = this.getDefinitions(v["def"]["dt"]);
	                        newItem.def = definitions;
	                    }
		                return newItem;
			        },

	        getText : 
	        	function (v){            
	            	return ( v["__text"]!='undefined' && v["__text"] &&  v["__text"].length>1)  ? v["__text"] : "";
	        	},

	        getDefinitions :
	        	function (v){            
		            var r = [];            
		            if(this.getText(v)!=""){
		                r.push({prop:"",label:this.getText(v)})
		            }else{
		                var v1;    
		                for( v1 in v){
		                    if(v1!="" && this.getText(v[v1])!=""){
		                        r.push({prop:v1,label:this.getText(v[v1])});
		                    }
		                }
		            }
	            	return r;
	        	}
        }
		
    }])
