(function (){

	var app = angular.module("keyTabs", ['ngRoute']);

	
	app.config(['$routeProvider',function($routeProvider){
		$routeProvider.when(
			"/home",
			{
				templateUrl : "templates/home.html",
				controller : "songsCtrl"
			}
		)
		.when("/view/:id",
		{
			templateUrl : "templates/view.html",
			controller : "singleSongCtrl"
		}
		)
		.otherwise({redirectTo : "/home"});
		
		
	}]);


	app.controller("songsCtrl", ["$scope", "$http", function ($scope, $http) {


		$http.get('data.json').success(function (response) {
			$scope.songs = response;
		});

		$scope.clearSearchTabs = function(){
			$scope.searchtabs = "";
		};

	}]);


	app.controller("singleSongCtrl", ["$scope", "$http","$routeParams", function ($scope, $http,$routeParams) {

		
		$http.get('data.json').success(function (response) {
			$scope.songs = response;

			$scope.songs.forEach(function(item){
				

				if( item.id === $routeParams.id)
				{
					$scope.song = item;

				}
			});
		});


	}]);




})();