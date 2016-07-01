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
var Shipping = models.Shipping

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
	if (!req.user.defaultShipping) {
		res.redirect('/shippingInfo')
	} else {
		res.redirect('/products')
	}
});

// ----------------------------------------------
// ROUTES - Shipping Information
// ----------------------------------------------
router.get('/shippingInfo', function(req,res,next) {
	res.render('shippingInfo')
})
router.post('/shippingInfo', function(req,res,next) {
	var address = new Shipping()
	name=req.body.name
	address1=req.body.address1
	address2=req.body.address2
	city=req.body.city
	state=req.body.state
	zip=req.body.zip
	phone=req.user.phone
	status=req.body.status
	user=req.user._id

	address.save(function(err,obj) {
		if (err) {
			console.log(err);
			res.render('shippingInfo', {error: err})
		} else {
			// return a message
			if (address.status===1) {
				User.update({id:req.user._id}, {defaultShipping:obj._id}, function(err) {
					if (err) {
						res.render('shippingInfo', {error:err})
					} else {
						res.redirect('/products')
					}
				})
			} else {
				res.redirect('/products')
			}
		}
	})
})

// ----------------------------------------------
// SEND TO PRODUCTS AS DEFAULT
// ----------------------------------------------
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
