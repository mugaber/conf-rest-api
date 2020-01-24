var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

var User = new Schema({
  admin: {
    type: Boolean,
    default: false
  }
});

// now the Use Schema will use the functionality provided
// from this plugin which includes username and password

User.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", User);
