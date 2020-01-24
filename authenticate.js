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

/*
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZTJiMWE3YTNmMzUyYTU1MWE2ZDZiYTQiLCJpYXQiOjE1Nzk4ODMxNTEsImV4cCI6MTU3OTg4Njc1MX0.zAYeX3aWXWvnDPIYhcuPSWjuccBmPo-t7YxeXaFV5F4 

5e2b1bf03f352a551a6d6ba5

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZTJiMWE3YTNmMzUyYTU1MWE2ZDZiYTQiLCJpYXQiOjE1Nzk4ODMzMjEsImV4cCI6MTU3OTg4NjkyMX0.SqwkQbj1tltQJHNj3GdW5iFSL0fRJpDgiYzDlgORThc*/
