

var app = angular.module('NodeApp', ['ngRoute', 'ngCookies']).controller('TweetController', function($filter, $rootScope, $scope, $http, $cookies, $cookieStore) {

	$scope.date = new Date().toLocaleFormat("%A, %B %e, %Y");
	
	console.log($scope.hhmmsstt);

	$scope.newTweet = '';
	getTweet();

	function getTweet() {

		$http.get('/tweets').then(function(response) {

		$scope.tweets = response.data;

		}); 

	}
	

	$scope.addtweet = function() {

		created_at = $filter('date')(new Date(), 'hh:mm a');

		$http.post('/tweets', {text : $scope.newTweet, likes : 0, created_at : created_at }, {headers : {'authorization' : $rootScope.token}}).then(function(){

			getTweet();
			$scope.newTweet = '';

		});

		
	};


	$scope.removeTweet = function(tweet) {
			

	    $http.put('/tweet/delete', {tweet : tweet}, {headers : {'authorization' : $rootScope.token}})
	    	.then(function() {

				getTweet();

			}, function() {	

				console.log('error');
				
			}); 
 
	}; 



	$scope.signIn = function() {

		var signedInUser = {
			username : $scope.username,
			password : $scope.password,
		};

		$http.put('/users/signin', signedInUser).then(function(res){
			
			$cookies['token'] = res.data.token;
			$cookies['currentUser'] = $scope.username;
			
			
			$rootScope.token =  res.data.token;
			$rootScope.currentUser  = $scope.username;
			

		});

	}; 


	$scope.signOut = function() {

		$cookieStore.remove("token");
		$cookieStore.remove("currentUser");
		$rootScope.currentUser = null;
		$rootScope.token = null;
		$scope.username = '';
		$scope.password = '';

	}; 



	$scope.liketweet = function(tweet) {

		tweet.likes += 1;

		$http.put('/tweet/like', {tweet : tweet})
			.then(function() {				
			

			}, function() {				

				
			});

	}

});



app.controller('signUpController', function($scope, $location, $http, $cookies, $cookieStore, $rootScope) {

	$scope.submitSignup = function() {

		var newUser = {

			username : $scope.username,
			password : $scope.password,
			handle : $scope.handle

		};

		$http.post('/users', newUser).then(function(){
			
			$("#loginModal").modal()			

		});

	};

	

	$("#loginModal").on("hidden.bs.modal", function () {

    	window.location = "/";

	});
	
});


app.config(function($routeProvider, $locationProvider){

	$routeProvider.when('/', {
		templateUrl :  'home.html',
		controller :   'TweetController',
	}).when('/signup', {
		templateUrl : 'signup.html',
		controller :   'signUpController',

	});
});	

app.run(function($rootScope, $cookies) {
	if ($cookies['token'] && $cookies['currentUser']) {
		$rootScope.token = $cookies['token'];
		$rootScope.currentUser = $cookies['currentUser'];
		
	};

});