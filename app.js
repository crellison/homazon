var express = require('express');
var session = require('express-session')
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var passport = require('passport');
var LocalStrategy = require('passport-local');
var FacebookStrategy = require('passport-facebook');
var MongoStore = require('connect-mongo/es5')(session);
var mongoose = require('mongoose');

var fId = process.env.FACEBOOK_ID;
var fSecret = process.env.FACEBOOK_SECRET;


var routes = require('./routes/index');
var auth = require('./routes/auth');
var users = require('./routes/users');

var app = express();
var models = require('./models/models')

// ----------------------------------------------
// PUG > JADE > HBS but < EJS
// ----------------------------------------------
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname, 'public')));

// ----------------------------------------------
// Import models
// ----------------------------------------------
var User = require('./models/models').User;

// ----------------------------------------------
// PaSsPoRT gOodNEsS
// ----------------------------------------------
app.use(session({
    secret: process.env.PASSPORT_SECRET,
    name: process.env.PASSPORT_NAME,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    proxy: true,
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// ----------------------------------------------
// pAsSPOrt sTRaTEGy
// ----------------------------------------------
passport.use(new LocalStrategy(function(username, password, done) {
    // Find the user with the given username
    User.findOne({ email: username }, function (err, user) {
      // if there's an error, finish trying to authenticate (auth failed)
      if (err) {
        console.error(err);
        return done(err);
      }
      // if no user present, auth failed
      if (!user) {
        console.log(user);
        return done(null, false, { message: 'Incorrect username.' });
      }
      // if passwords do not match, auth failed
      var validPassword = user.comparePassword(password);
      if (!validPassword) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      // auth has has succeeded
      return done(null, user);
    });
  }
));

// ----------------------------------------------
// pAsSPOrt fACEBooK sTRaTEGy
// ----------------------------------------------
passport.use(new FacebookStrategy({
    clientID: fId,
    clientSecret: fSecret,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    passReqToCallback: true,
    profileFields:['id', 'email', 'name']
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log("PROFILE!" + " " + profile.id);
    User.findOne({ facebookId: profile.id }).exec(function (err, user) {
      if(user){
        return cb(err, user);
      }

      if(!user){

        var user1 = new User();
        user1.name = profile.displayName;
        user1.facebookId = profile.id;
        user1.email = profile.email;

        user1.save(function(err) {
          if (err) {
            // duplicate entry
            console.log(err);
            return cb(err, user1);
          }

          // return a message
          return cb(err, user1);
        });
      }
    });
  }
));

// ----------------------------------------------
// ROUTES - PRETTY OBVIOUS EH? :D
// ----------------------------------------------
app.use('/', auth(passport));
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// ----------------------------------------------
// ERR HNDLRS FOR EXPRESS - NO NEED TO COME DOWN!
// ----------------------------------------------

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
