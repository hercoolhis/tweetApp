

var app = angular.module('NodeApp', ['ngRoute', 'ngCookies']).controller('TweetController', function($interval, $filter, $timeout, $location, $rootScope, $scope, $http, $cookies, $cookieStore) {

	var now = $filter('date')(new Date());
	console.log(now);

	$scope.loading = false;
	
	

	$scope.newTweet = '';
	getTweet();

	function getTweet() {
		$scope.loading = true;
		$http.get('/tweets').then(function(response) {

		$scope.tweets = response.data;

		for (var i = $scope.tweets.length - 1; i >= 0; i--) {
			if ($scope.tweets[i].username === $rootScope.currentUser) {
				$scope.tweets[i].canDelete = true;
				console.log($scope.tweets[i].username);
			}  else {
				$scope.tweets[i].canDelete = false;
			};
		};
		$scope.loading = false;

		}); 

	}

	$interval(function () {
    			getTweet();    			
				}, 30000);


	

	$scope.addtweet = function() {

		created_at = $filter('date')(new Date(), "MMM d, y 'at' h:mm a");

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

	$scope.refreshTweets = function() {		

	    getTweet();

	    console.log('test');
 
	}; 	


	$scope.signOut = function() {

		$cookieStore.remove("token");
		$cookieStore.remove("currentUser");
		$rootScope.currentUser = null;
		$rootScope.token = null;
		$scope.username = '';
		$scope.password = '';

		$location.path("/");
        $timeout(function () {
    			$scope.$apply();
				}, 300);
		

	}; 



	$scope.liketweet = function(tweet) {

		tweet.likes += 1;

		$http.put('/tweet/like', {tweet : tweet})
			.then(function() {				
			

			}, function() {				

				
			});

	}

});


app.config(function($routeProvider, $locationProvider){

	$routeProvider.when('/home', {
		templateUrl :  'home.html',
		controller :   'TweetController',
	}).when('/signup', {
		templateUrl : 'signup.html',
		controller :   'signUpController',

	}).when('/', {
		templateUrl : 'signIn.html',
		controller :   'signInController',

	});

	$locationProvider.html5Mode({
  		enabled: true,
  		requireBase: false
	});

});



app.controller('signUpController', function($scope, $timeout, $location, $http, $cookies, $cookieStore, $rootScope) {

	$scope.submitSignup = function() {

		var newUser = {

			username : $scope.username,
			password : $scope.password,
			handle : $scope.handle

		};

		$http.post('/users', newUser).then(function(){

			$http.put('/users/signin', newUser).then(function(res){
			
			$cookies['token'] = res.data.token;
			$cookies['currentUser'] = $scope.username;

			$rootScope.token =  res.data.token;
			$rootScope.currentUser  = $scope.username;

			$location.path("/home").replace();

			$timeout(function () {
    			$scope.$apply();
				}, 300);

            
			
			
			
			

		});


			
			//$("#loginModal").modal()			

		});

	};

	

	$("#loginModal").on("hidden.bs.modal", function () {

    	window.location = "/";

	});
	
});


app.controller('signInController', function($scope, $location, $timeout, $http, $cookies, $cookieStore, $rootScope) {

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

			
			$location.path("/home");
			$timeout(function () {
    			$scope.$apply();
				}, 300);
            //$scope.$apply();
            
			
			
			
			

		});

	}; 

	
	
});


	

app.run(function($rootScope, $cookies) {
	if ($cookies['token'] && $cookies['currentUser']) {
		$rootScope.token = $cookies['token'];
		$rootScope.currentUser = $cookies['currentUser'];
		
	};

});