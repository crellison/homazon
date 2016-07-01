// ----------------------------------------------
// import dependencies
// ----------------------------------------------
var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator'); 
// router.use(expressValidator());

// ----------------------------------------------
// PUG
// ----------------------------------------------
var pug = require('pug')

// ----------------------------------------------
// Models
// ----------------------------------------------
var models = require('../models/models')
var User = models.User
var Product = models.Product

// ----------------------------------------------
// ROUTES - ROOT
// ----------------------------------------------
router.get('/', function(req, res, next) {
  res.redirect('/index');
});

// ----------------------------------------------
// ROUTES - authentication layer
// ----------------------------------------------

router.use(function(req,res,next) {
	if (!req.user) {
		res.redirect('/login')
	} else {
		return next()
	}
})

//============================================
// _|___|___|___|___|___|___|___|___|___|___|
// ___|___|___|___|___|___|___|___|___|___|__
// _|___|___|___|___|___|___|___|___|___|___|
// ___|___|___|___|___|___|___|___|___|___|__
// _|___|___|___|___|___|___|___|___|___|___|
// ___|___|___|___|___|___|___|___|___|___|__
// _|___|___|___|___|___|___|___|___|___|___|
// ___|___|___|___|___|___|___|___|___|___|__
// _|___|___|___|___|___|___|___|___|___|___|
// ___|___|___|___|___|___|___|___|___|___|__
//          WALLLLLLL STARTS HERE!          |
// _|___|___|___|___|___|___|___|___|___|___|
// ___|___|___|___|___|___|___|___|___|___|__
// _|___|___|___|___|___|___|___|___|___|___|
// ___|___|___|___|___|___|___|___|___|___|__
// _|___|___|___|___|___|___|___|___|___|___|
// ___|___|___|___|___|___|___|___|___|___|__
// _|___|___|___|___|___|___|___|___|___|___|
// ___|___|___|___|___|___|___|___|___|___|__
//============================================

router.get('/index', function(req, res, next) {
	res.render('index');
});

router.get('/cart', function(req, res, next) {
	req.session.cart = req.session.cart || [];
	next();
}

// router.get('/cart/add/:pid', function(req, res, next) {
// 	req.session.cart.push
// }

// router.get('/cart/delete/:pid', function(req, res, next) {
//   // Insert code that takes a product id (pid), finds that product
//   // and removes it from the cart array. Remember that you need to use
//   // the .equals method to compare Mongoose ObjectIDs.
// }

router.get('/cart/delete', function(req, res, next) {
  // Empty the cart array
  req.session.cart = [];
  res.redirect('/index');
});

router.get('/products', function(req, res, next) {
	Product.find().exec(function(err, products){
		res.render('products', {products: products});
	})
});

router.get('/product/:id', function(req, res, next) {
	console.log(req.params.id);
	Product.findById(req.params.id).exec(function(err, product){
		console.log(product);
		res.render('product', {product: product});
	})
});

module.exports = router;
