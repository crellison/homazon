var express = require('express');
var router = express.Router();

module.exports = function(passport) {
    router.get('/logout', function(req,res,next) {
    	req.logout()
    	res.redirect('/')
    })
    router.get('/auth/facebook',
	  passport.authenticate('facebook'));

	router.get('/auth/facebook/callback',
	  passport.authenticate('facebook', { failureRedirect: '/' }),
	  function(req, res) {
	    // Successful authentication, redirect home.
	    res.redirect('/');
	  });

	router.post('/',
	  passport.authenticate('local', { successRedirect: '/contacts',
                                   failureRedirect: '/',
                                   failureFlash: true })
	);
	return router
}