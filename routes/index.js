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

router.get('/cart', function(req, res, next) {
	req.session.cart = req.session.cart || [];
	next();
});

// not sure if it works yet
router.get('/cart/add/:pid', function(req, res, next) {
	Product.findById(req.params.pid).exec(function(err, product){
		if(product){
			req.session.cart.push(product);
		}
	})
});

// not sure if it works yet either
router.get('/cart/delete/:pid', function(req, res, next) {
  var deleteItem = function(val, i) {
    if (req.params.pid.equals(val.product._id)) {
      req.session.cart.splice(i, 1);
      // Stops iteration
      return true;
    }
    return false;
  };
  res.redirect('/index');
});

router.get('/cart/delete', function(req, res, next) {
  // Empty the cart array
  req.session.cart = [];
  res.redirect('/index');
});

// ----------------------------------------------
// ROUTES - Shipping Information
// ----------------------------------------------
router.get('/shippingInfo', function(req,res,next) {
	res.render('shippingInfo')
})
router.post('/shippingInfo', function(req,res) {
	console.log(req.user)
	var address = new Shipping()
	address.name=req.body.name
	address.address1=req.body.address1
	address.address2=req.body.address2
	address.city=req.body.city
	address.state=req.body.state
	address.zip=req.body.zipcode
	address.phone=req.user.phone
	address.status=req.body.status
	address.user=req.user._id
	console.log('\npost called')
	address.save(function(err,obj) {
		console.log('save attempted')
		if (err) {
			console.log(err);
			res.render('shippingInfo', {error: err})
		} else {
			// return a message
			console.log('saved!')
			if (address.status===1) {
				User.update({_id:req.user._id}, {defaultShipping:obj._id}, function(err) {
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
