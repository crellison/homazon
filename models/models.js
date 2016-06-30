var mongoose = require('mongoose');

var connect = process.env.MONGODB_URI
mongoose.connect(connect);

var userSchema = mongoose.Schema({});