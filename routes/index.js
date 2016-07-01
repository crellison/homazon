var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator'); 
router.use(expressValidator());
// PUG
var pug = require('pug')
// Models
var models = require('../models/models')
var user = models.User

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
// ROUTES
// ----------------------------------------------
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Homazon' });
});
router.get('/register', function(req,res,next) {
	res.render('signup')
})
router.post('/register', function(req,res,next) {
	validateLogin(req);
	if (req.validationErrors()) {
		res.render('signup', {errors: req.validationErrors()});
		return
	}
	console.log('no validation errors')
	var newUser = new user({username:req.body.username, password:req.body.password})
	user.find({username:newUser.username}, function(error,cats) {
		if (error) {			
			console.log('ERROR: ',Error)
			res.render('error',{error:error})
			return
		} else {
			if (cats.length===0) {
				newUser.save(function(error) {
					if (error) {
						console.log('ERROR: ',Error)
						res.render('error',{error:error})
						return
					} else {
						console.log('redirecting to login')
						res.redirect('/login')
						return
					}
				})
			} else  {
				console.log('username in use')
				res.render('signup',{message:'username already taken'})
				return
			}
		}
	})
})

// ----------------------------------------------
// AUTHENTICATION REQUIRED
// ----------------------------------------------
router.use(function(req,res,next) {
	if (!req.user) {
		res.redirect('/signup')
	} else {
		return next()
	}
})

module.exports = router;
