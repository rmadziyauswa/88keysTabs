(function (){

	var app = angular.module("keyTabs", ['ngRoute']);


	app.factory("SongsLocalStorage",["$http","$window",function($http,$window){

		var theSongs = [];

		function setInitialSongsList(){

			// $window.localStorage.removeItem("songs");

			if ($window.localStorage.getItem("songs") === null){
				
				$http.get('data.json').success(function (response) {

					$window.localStorage.setItem("songs",JSON.stringify(response)); //set an initial list of 10 songs
					$window.location.reload();

				});

			}

			theSongs = JSON.parse($window.localStorage.getItem("songs"));

			return theSongs;

			
		}


		function getSong(id){
			
			theSongs = JSON.parse($window.localStorage.getItem("songs"));

			var songs = theSongs;

			var song = {}

			songs.forEach(function(item){				


				if( item.id === id)
				{
					song = item;
				}
			});

			return song;

		}

		function getNextId(){
			var high_id = 0;

			theSongs.forEach(function(val){

				if(parseInt(val.id) > high_id){
					high_id = parseInt(val.id);
				}
			});

			var high_id_string = high_id + 1;
			return high_id_string.toString(); //add one to the highest id available to make it the next id

		}

		function saveSong(song){

			if(song){
				theSongs.push(song);
				$window.localStorage.setItem("songs",JSON.stringify(theSongs));
			}
		}

		function deleteSong(song){
			

			if(song){
				theSongs.splice(theSongs.indexOf(song),1);

				$window.localStorage.setItem("songs",JSON.stringify(theSongs));
			}
		}

		function deleteProgression(song,prog){

			if (song && prog){
				console.log(prog);
				console.log(song.numeric_progression);

				song.numeric_progression.splice(song.numeric_progression.indexOf(prog),1);
			}

			return song;
		}

		function cleanUpProg(prog){ //clean a progression , removing $$haskey and Object data


			var cleaned_prog = prog.filter(function(item){
				if (typeof(parseInt(item)) === 'number'){

					return true;
				}

			});

			return cleaned_prog;

		}

		function editSong(song){			

			if(song){

				var og_song_arr = theSongs.filter(function(element){

					if(element.id === song.id){
						return true;
					}
				});

				var og_song = og_song_arr[0];

				theSongs.splice(theSongs.indexOf(og_song),1,song);

				$window.localStorage.setItem("songs",JSON.stringify(theSongs));
			}
		}

		return {
			setInitialSongsList : setInitialSongsList,
			getSong : getSong,
			saveSong : saveSong,
			getNextId : getNextId,
			deleteSong : deleteSong,
			editSong : editSong,
			deleteProgression : deleteProgression,
			cleanUpProg : cleanUpProg
		};


	}]);
	
	
		app.factory("ChordMaker",function(){

		var notes = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
		var scale_form = [0,2,4,5,7,9,11];

		function getNotes(){
			return notes;
		}

		function getChordNotes(scale,chord_nums){
			var chords = [];
			
			chord_nums.forEach(function(val){
				chords.push(scale[val-1]);
			});


			return chords;
		}

		function getScale(key){
			var start_pos = notes.indexOf(key);
			var notesOnKey = [];
			var scale = [];

			if (start_pos > 0){

				var first_arr = notes.slice(start_pos);
				var last_arr = notes.slice(0,start_pos);
				notesOnKey = first_arr.concat(last_arr);
				
			}else{
				notesOnKey = notes;

			}

			scale_form.forEach(function(val,index){
				scale.push(notesOnKey[val]);
			});


			return scale;


		}


		 function getActualProgressions(numeric_progression,key){
				
				var self = this;

				var progArr = [];

				numeric_progression.forEach(function(val){		


					progArr.push(self.getChordNotes(self.getScale(key),val));	
					
				});

				return progArr;


		}


		return {
			getScale : getScale,
			getChordNotes : getChordNotes,
			getNotes : getNotes,
			getActualProgressions : getActualProgressions
		};


	}); //end of ChordMaker factory

	

	
	app.config(['$routeProvider',function($routeProvider){
		$routeProvider.when(
			"/home",
			{
				templateUrl : "templates/home.html",
				controller : "songsCtrl"
			}
		)
		.when("/add",{
			templateUrl : "templates/add.html",
			controller : "addSongCtrl"
		})
		.when("/edit/:id",{
			templateUrl : "templates/add.html",
			controller : "editSongCtrl"
		})
		.when("/view/:id",
		{
			templateUrl : "templates/view.html",
			controller : "singleSongCtrl"
		}
		)
		.otherwise({redirectTo : "/home"});
		
		
	}]);


	app.controller("songsCtrl", ["$scope","SongsLocalStorage", function ($scope,SongsLocalStorage) {


		$scope.songs = SongsLocalStorage.setInitialSongsList();

	
		$scope.clearSearchTabs = function(){
			$scope.searchtabs = "";
		};


	}]);


	app.controller("singleSongCtrl", ["$scope","$location","$routeParams","ChordMaker","SongsLocalStorage", function ($scope,$location,$routeParams,ChordMaker,SongsLocalStorage) {

		

		$scope.song = SongsLocalStorage.getSong($routeParams.id);	

	

		$scope.delete = false;

		
		$scope.progressions = ChordMaker.getActualProgressions($scope.song.numeric_progression,$scope.song.key);						


		$scope.deleteSong = function(song){
			SongsLocalStorage.deleteSong(song);
			$location.path("/home");
		}



	}]);

	app.controller("addSongCtrl",["$scope","$location","SongsLocalStorage","ChordMaker",function($scope,$location,SongsLocalStorage,ChordMaker){

		$scope.song = {};
		$scope.song.numeric_progression = [];
		$scope.song.key = "C";
		$scope.song.id = 0;
		$scope.current_progression = "";

		$scope.notes = ChordMaker.getNotes();


		$scope.addSong = function(song){
			song.id = SongsLocalStorage.getNextId();
			SongsLocalStorage.saveSong(song);
			$location.path("/home");
		}

		$scope.addProgression = function(prog){
			var arr_prog = prog.split(",");
			$scope.song.numeric_progression.push(arr_prog);
			$scope.current_progression = "";
			$scope.progressions = ChordMaker.getActualProgressions($scope.song.numeric_progression,$scope.song.key);
		}

		$scope.deleteProgression = function(song,prog){
			
			prog = SongsLocalStorage.cleanUpProg(prog);


			$scope.song.numeric_progression = [];
			$scope.progressions = [];


		}

		

	}]);

	app.controller("editSongCtrl",["$scope","$location","SongsLocalStorage","ChordMaker","$routeParams",function($scope,$location,SongsLocalStorage,ChordMaker,$routeParams){

		$scope.song = SongsLocalStorage.getSong($routeParams.id);
		$scope.isEdit = true;
		$scope.current_progression = "";

		$scope.notes = ChordMaker.getNotes();
		$scope.progressions = ChordMaker.getActualProgressions($scope.song.numeric_progression,$scope.song.key);

		$scope.editSong = function(song){
			SongsLocalStorage.editSong(song);
			$location.path("/view/" + $scope.song.id );
		}

		$scope.addProgression = function(prog){
			var arr_prog = prog.split(",");
			$scope.song.numeric_progression.push(arr_prog);
			$scope.current_progression = "";
			$scope.progressions = ChordMaker.getActualProgressions($scope.song.numeric_progression,$scope.song.key);
		}

		
		$scope.deleteProgression = function(song,prog){
			
			prog = SongsLocalStorage.cleanUpProg(prog);


			$scope.song.numeric_progression = [];
			$scope.progressions = [];


		}

		

	}]);

})();