// the requires
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// the routes
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const dishRouter = require("./routes/dishRouter");
const leaderRouter = require("./routes/leaderRouter");
const promoRouter = require("./routes/promoRouter");

// connection to the database
const mongoose = require("mongoose");
const url = "mongodb://localhost:27017/conFusion";
const connect = mongoose.connect(url);

connect.then(
  db => {
    console.log("Connected to the database");
  },
  err => {
    console.log(err);
  }
);

// express inistance
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// use a key to setup the cookies
app.use(cookieParser("12345-67890-09876-54321"));

// implementation of basic authentication
// make use of cookies
function auth(req, res, next) {
  console.log(req.headers);
  // if there is no user in the cookies
  if (!req.signedCookies.user) {
    var authHeader = req.headers.authorization;
    if (!authHeader) {
      var err = new Error("You are not authenticated!");
      res.setHeader("WWW-Authenticate", "Basic");
      err.status = 401;
      next(err);
      return;
    }

    var auth = new Buffer.from(authHeader.split(" ")[1], "base64")
      .toString()
      .split(":");
    var user = auth[0];
    var pass = auth[1];
    if (user == "admin" && pass == "password") {
      // to setup the cookie
      res.cookie("user", "admin", { signed: true });
      next(); // authorized
    } else {
      var err = new Error("You are not authenticated!");
      res.setHeader("WWW-Authenticate", "Basic");
      err.status = 401;
      next(err);
      return;
    }
  } else {
    // if the user exists in the signed cookies
    if (req.signedCookies.user == "admin") {
      next();
    } else {
      var err = new Error("You are not authenticated!");
      err.status = 401;
      next(err);
    }
  }
}

app.use(auth);

app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/dishes", dishRouter);
app.use("/leaders", leaderRouter);
app.use("/promotions", promoRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
