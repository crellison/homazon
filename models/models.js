// ----------------------------------------------
// homazon models & schemas
// ----------------------------------------------

// ----------------------------------------------
// Import dependencies
// ----------------------------------------------
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var connect = process.env.MONGODB_URI
mongoose.connect(connect);

// ----------------------------------------------
// bcrypt dependency & constant
// ----------------------------------------------
var bcrypt = require('bcrypt');
const saltRounds = 10;

// ----------------------------------------------
// Log successful db connection in console
// ----------------------------------------------
var db = mongoose.connection;
db.once('open', function callback () {
       console.log("DB Connected!");
});

// ----------------------------------------------
// userSchema
// ----------------------------------------------
var userSchema = Schema({
	displayName:{type: String},
	email:{type: String, index: { unique: true }},
	password:{type: String},
	phone: {type: String},
	facebookId: {type: String},
  defaultShipping:{type: Schema.Types.ObjectId, ref:'Shipping'},
  sessionId: String,
  registrationCode: String
});

// ----------------------------------------------
// Hashes password before saving it
// ----------------------------------------------
userSchema.pre('save', function(next) {
  var user = this;

  // hash the password only if the password has been changed or user is new
  if (!user.isModified('password')) return next();

  bcrypt.genSalt(saltRounds, function(err, salt) {
    if(err) return console.error(err);

    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);

      // change the password to the hashed version
      user.password = hash;
      next();
    });

  });
});

// ----------------------------------------------
// Compare password hash
// ----------------------------------------------
userSchema.methods.comparePassword = function(password) {
  var user = this;
  // ----------------------------------------------
  // SYNC CALL FOR NOW
  // ----------------------------------------------
  return bcrypt.compareSync(password, user.password);
};

// ----------------------------------------------
// shippingSchema
// ----------------------------------------------
var shippingSchema = Schema({
  name:{type: String, required:true},
  address1:{type: String, required:true},
  address2:{type: String},
  city:{type: String, required:true},
  state:{type: String, required:true},
  zip:{type: String, required:true},
  phone:{type: String, required:true},
  // status of 1 indicates default address
  // status of 0 indicates secondary address
  status:{type: Number, required:true},
  user:{type: Schema.Types.ObjectId, ref:'User'}
});

// ----------------------------------------------
// productSchema
// ----------------------------------------------
var productSchema = Schema({
  title: String,
  description: String,
  imageUri: String
});

// ----------------------------------------------
// ExPOrt - NEeD tO aSK moRE?
// ----------------------------------------------
module.exports = {
  User: mongoose.model('User', userSchema),
  Shipping: mongoose.model('Shipping', shippingSchema),
  Product: mongoose.model('Product', productSchema)
};