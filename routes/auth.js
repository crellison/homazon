var express = require('express');
var router = express.Router();
var accountSid = process.env.TWILIO_SID;
var authToken = process.env.TWILIO_TOKEN;
var twilio = require('twilio');
var client = new twilio.RestClient(accountSid, authToken);

// ----------------------------------------------
// PUG
// ----------------------------------------------
var pug = require('pug')

// ----------------------------------------------
// Models
// ----------------------------------------------
var models = require('../models/models')
var User = models.User


// ----------------------------------------------
// VALIDATION HELPER FUNCTIONS
// ----------------------------------------------
// var validation = {
// 	email : /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
// 	phone : /\b[0-9]{10,}\b/,
// 	dName : /\b[A-Za-z0-9._]{1,}\b/,
// 	password : /\b[A-Za-z0-9._%+-]{8,}\b/
// }
// function validate(x) {
// 	if (validation[x]) {
// 		if (!validation[x].test(document.getElementById(x).value)) {
// 			$('#'+x).css('border-color','#c23824')
// 			$('#'+x).css('color','#c23824')
// 			return false;
// 		} else {
// 			$('#'+x).css('border-color','rgb(11,153,140)')
// 			$('#'+x).css('color','rgb(11,153,140)')
// 		}
// 	} else {
// 		if ($('#password').val()!==$('#'+x).val()) {
// 			$('#'+x).css('border-color','#c23824')
// 			$('#'+x).css('color','#c23824')
// 			return false;
// 		} else {
// 			$('#'+x).css('border-color','rgb(11,153,140)')
// 			$('#'+x).css('color','rgb(11,153,140)')
// 		}
// 	}
// 	console.log('checking to see if form complete')
// 	var good = false
// 	$('form input').each(function() {
// 		console.log($(this).css('color'))
// 		if ($(this).css('color')!=='rgb(11, 153, 140)') {
// 			good = true
// 		}	
// 	})
// 	console.log('form incomplete? ',good)
// 	if (!good) {$('#reg').prop('disabled',good)}
// }

// ----------------------------------------------
// PASSPORT RELATED AUTH ROUTES
// ----------------------------------------------
module.exports = function(passport){
	router.get('/auth/facebook',
	  passport.authenticate('facebook', {scope: ['email']}));

	router.get('/auth/facebook/callback',
	  passport.authenticate('facebook', { failureRedirect: '/login' }),
	  function(req, res) {
	    // Successful authentication, redirect home.
	    res.redirect('/index');
	  });

	router.get('/index', function(req,res,next) {
		if (!req.user.phone) {
			res.redirect('/phone')
		} else {
			next()
		}
	})
	router.get('/phone', function(req,res) {
		res.render('phone')
	})
	router.post('/phone', function(req,res) {
		User.update({_id:req.user._id}, {phone:req.body.phone}, function(err) {
			if (err) {
				res.render('phone')
			} else {
				res.redirect('/')
			}
		})
	})
	// Register route
	router.get('/signup', function(req, res, next) {
	  // Your code here.
	  if (!req.user) {
	    res.render('signup');
	  } else {
	    res.redirect('/index');
	  }
	});

	// POST signup page
	router.post('/signup',function(req, res) {
		var min = 1000;
		var max = 9999;
		var code = Math.floor(Math.random() * (max - min + 1)) + min;
		var user = new User();		// create a new instance of the User model
		user.displayName = req.body.name;  // set the users name (comes from the request)
		user.email = req.body.email;  // set the users email (comes from the request)
		user.password = req.body.password;  // set the users password (comes from the request)
		user.phone = req.body.phone;
		user.registrationCode = code;

		user.save(function(err) {
			if (err) {
				// duplicate entry
				console.log(err);
				res.render('signup', {error: err});
			} else {
				client.messages.create({
					body: code,
					to: "+1" + req.body.phone,
					from: '+18442876556'
				}, function(err, message){
					if(err){
						console.log(err);
						return
					}
					console.log("success!")
					res.redirect('/login');
				});
			}
		});

	})

	// router.post('/signup', function(req,res,next) {
	// 	// validateLogin(req);
	// 	// if (req.validationErrors()) {
	// 	// 	res.render('signup', {errors: req.validationErrors()});
	// 	// 	return
	// 	// }
	// 	console.log('no validation errors')
	// 	var newUser = new user({username:req.body.username, password:req.body.password, displayName: req.body.displayName, phone: req.body.phone})
	// 	user.find({username:newUser.username}, function(error,cats) {
	// 		if (error) {			
	// 			console.log('ERROR: ',Error)
	// 			res.render('error',{error:error})
	// 			return
	// 		} else {
	// 			if (cats.length===0) {
	// 				newUser.save(function(error) {
	// 					if (error) {
	// 						console.log('ERROR: ',Error)
	// 						res.render('error',{error:error})
	// 						return
	// 					} else {
	// 						console.log('redirecting to login')
	// 						res.redirect('/login')
	// 						return
	// 					}
	// 				})
	// 			} else  {
	// 				console.log('username in use')
	// 				res.render('signup',{message:'username already taken'})
	// 				return
	// 			}
	// 		}
	// 	})
	// })

	router.get('/login', function(req, res, next) {
	  // Your code here.
	  res.render('login');
	});

	router.post('/login', passport.authenticate('local'), function(req, res) {
	  res.redirect('/index');
	});

	router.get('/logout', function(req, res) {
	  req.logout();
	  res.redirect('/login');
	});



	return router;
}