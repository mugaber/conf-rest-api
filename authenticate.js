var passport = require("passport");
var localStrategy = require("passport-local").Strategy;
var User = require("./models/user");

var JwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;
var jwt = require("jsonwebtoken"); // used to create, sign and  verify tokens

var config = require("./config");

exports.local = passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// to generate a token using json web token
exports.getToken = user => {
  return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
};

var ops = {};

ops.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
ops.secretOrKey = config.secretKey;

// passport with JWT strategy

exports.jwtPassport = passport.use(
  new JwtStrategy(ops, (jwt_payload, done) => {
    console.log("JWT payload: ", jwt_payload);
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
      if (err) {
        return done(err, false);
      } else if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  })
);

exports.verifyUser = passport.authenticate("jwt", { session: false });

// a function to be used in the API endpoints to verify
// if a user have the admin flag turned true

exports.verifyAdmin = (req, res, next) => {
  User.findById(req.user._id)
    .then(
      user => {
        if (user.admin) {
          next();
        } else {
          err = new Error("You are not authorized to perform this operation!");
          err.status = 403;
          return next(err);
        }
      },
      err => next(err)
    )
    .catch(err => next(err));
};
