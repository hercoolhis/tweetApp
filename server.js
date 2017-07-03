
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jwt-simple');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var mongojs = require('mongojs');
var db = mongojs('mongodb://hercoolhis:larrydon007@ds139352.mlab.com:39352/mytweets', ['tweets', 'users']);

var JWT_SECRET = 'larrydon007';

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());


app.get('/tweets', function(req, res, next) {

	db.tweets.find(function(err, tweets) {
		if(err) {
			res.send(err);
		} 
		res.json(tweets);
	});
	 
});


app.post('/tweets', function(req, res, next) {

	var tweet = req.body;
	var token = req.headers.authorization;
	var user = jwt.decode(token, JWT_SECRET);
	

	var newTweet = {

		body : req.body.text,
		likes : req.body.likes,
		username : user.username,
		user_id : user._id,
		handle : user.handle, 
		created_at : req.body.created_at
	};

	
	db.tweets.save(newTweet, function(err, tweet) {

		if(err) {

			res.send(err);
		} 

		console.log(newTweet);
		res.json(tweet);
	}); 
});


app.put('/tweet/delete', function(req, res, next) {

	var tweetId = req.body.tweet._id;
	var token = req.headers.authorization;
	var user = jwt.decode(token, JWT_SECRET);

	
	
	db.tweets.remove({_id : mongojs.ObjectId(tweetId), username : user.username}, function(err, result){
		if (err) {

			console.log('Not working');

		} else {

			return res.send();
		};


	});	

});


app.put('/tweet/like', function(req, res, next){    

	var tweetLikes = req.body.tweet.likes;
	var tweetId = req.body.tweet._id;
	var tweet = req.body.tweet;	

	console.log(tweet)

	
	db.tweets.findAndModify({  query: { _id : mongojs.ObjectId(tweetId) }, update: { $set: { likes: tweetLikes } },  new: true},
	 function (err, doc, lastErrorObject) {
   		
	});

});


app.post('/users', function(req, res, next) {

	var username = req.body.username;
	var password = req.body.password;
	var handle = req.body.handle;
	
	

	bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {

    	var newUser = {
    		username : username,
    		password : hash,
    		handle : handle
    	};

    	db.users.save(newUser, function(err, user) {

		if(err) {

			res.send(err);
		} 

		return res.send();
		

		});

         
    });
		});

	 
});


app.put('/users/signin', function(req, res, next) {

	var username = req.body.username;
	var password = req.body.password;	

	console.log(username);
	db.users.findOne({username : username}, function(err,user){
		if(err) {
			console.log('User not found');
		} else {
		console.log(user);	
		bcrypt.compare(password, user.password, function(err,result) {

			if(err) {
				res.status(400).send();
			} else {

				var mytoken = jwt.encode(user, JWT_SECRET);	

				return	res.json({token  : mytoken} );
				
			}
		});

		}

	});	

});


app.listen(3000, function() {

	console.log('Server running at http://localhost:3000/');
});
