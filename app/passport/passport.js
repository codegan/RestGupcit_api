var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy  = require('passport-twitter').Strategy;
var GoogleStrategy   = require('passport-google-oauth20').Strategy;
var User 			 = require('../models/user'); 
var session 		 = require('express-session')
var jwt 			 = require('jsonwebtoken');
var secret    		 = 'harrypotter';

module.exports = function(app, passport){


  	app.use(passport.initialize());
  	app.use(passport.session());
	app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true, cookie: { secure: false } }));


    passport.serializeUser(function (user, done) {

        if (user.active) {
            token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '24h' });
        } else {
            token = 'inactive/error';
        }

		
	  	done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
	  User.findById(id, function(err, user) {
	    done(err, user);
	  });
	}); 	



	passport.use(new FacebookStrategy({
	    clientID: '116573002221122',
	    clientSecret: '4860a360870f2281629e6c34464e5b5d',
	    callbackURL: "http://localhost:8080/auth/facebook/callback",
	    profileFields: ['id', 'displayName', 'photos', 'email']
  	},
  	function(accessToken, refreshToken, profile, done) {
    	User.findOne({ email: profile._json.email}).select('username active password email').exec(function(err, user){
    		if(err) done(err);
    		if(user && user != null){
    			done(null, user);
    		}else{
    			done(err);
    		}
    	});
  	}
	));

	passport.use(new TwitterStrategy({
	    consumerKey: 'nn50Br8zjUCdTHiyumOUpky37',
	    consumerSecret: 'iavPCY70ofmCmJ3gfvH4Ld3Q0xh35AGnPFjUSF2sNXJbzfXRpq',
	    callbackURL: "http://localhost:8080/auth/twitter/callback",
	    userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true"
	  },
	  function(token, tokenSecret, profile, done) {
	    
	    console.log(profile.emails[0].value); 

        User.findOne({ email: profile.emails[0].value }).select('username active password email').exec(function(err, user){
    		if(err) done(err);
    		if(user && user != null){
    			done(null, user);
    		}else{
    			done(err);
    		}
    	});
	  }
	));


	passport.use(new GoogleStrategy({
	    clientID: '495973389328-telmb1bchumr8vsji3b2srl3rjr22jdb.apps.googleusercontent.com',
	    clientSecret: 'k__Aw_5qoPCFK5fxL_eDi9_2',
	    callbackURL: "http://localhost:8080/auth/google/callback"
	  },
	  function(token, tokenSecret, profile, done) {
          User.findOne({ email: profile.emails[0].value }).select('username active password email').exec(function(err, user){
    		if(err) done(err);
    		if(user && user != null){
    			done(null, user);
    		}else{
    			done(err);
    		}
    	});
	  }
	));



	app.get('/auth/google', passport.authenticate('google', { scope: [ 'https://www.googleapis.com/auth/plus.login', 'profile', 'email' ]}));

	app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/googleerror' }), function(req, res) {
	    res.redirect('/google/' + token);
	  });


	app.get('/auth/twitter', passport.authenticate('twitter'));
	app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/twittererror' }), function(req, res){
		res.redirect('/twitter/' + token);
	});



	app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/facebookerror' }), function(req, res){
		res.redirect('/facebook/'  + token);
	});

	app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email ' }));

	return passport;
}