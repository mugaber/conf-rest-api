// the requires
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var passport = require("passport");
var authenticate = require("./authenticate");

var session = require("express-session");
var FileStore = require("session-file-store")(session);

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
// app.use(cookieParser("12345-67890-09876-54321"));

// use express session
app.use(
  session({
    name: "session-id",
    secret: "12345-67890-09876-54321",
    saveUninitialized: false,
    resave: false,
    store: new FileStore()
  })
);

// for user authetication using passport
app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);
app.use("/users", usersRouter);

// app now uses passport for authentication

function auth(req, res, next) {
  if (!req.user) {
    var err = new Error("You are not authenticated!");
    err.status = 403;
    return next(err);
  } else {
    next();
  }
}

app.use(auth);

app.use(express.static(path.join(__dirname, "public")));

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
