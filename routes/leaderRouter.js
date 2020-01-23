const express = require("express");
const bodyParser = require("body-parser");

// connect to the database using the model
const Leaders = require("../models/leaders");

const leaderRouter = express.Router();
leaderRouter.use(bodyParser.json());

// leaders router handler
leaderRouter
  .route("/")
  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    next(); // to execute the next handler that match
  })

  .get((req, res, next) => {
    Leaders.find({})
      .then(
        leaders => {
          res.json(leaders);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })

  .post((req, res, next) => {
    Leaders.create(req.body)
      .then(
        leader => {
          res.json(leader);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })

  .put((req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation is not supported on /leaders");
  })

  .delete((req, res, next) => {
    Leaders.deleteMany({})
      .then(
        resp => {
          res.json(resp);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

// leader router heandler
leaderRouter
  .route("/:leaderId")

  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    next();
  })

  .get((req, res, next) => {
    Leaders.findById(req.params.leaderId)
      .then(
        leader => {
          res.json(leader);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })

  .post((req, res, next) => {
    res.end(
      "POST operation is not supported on /leaders/" + req.params.leaderId
    );
  })

  .put((req, res, next) => {
    Leaders.findByIdAndUpdate(
      req.params.leaderId,
      { $set: req.body },
      { new: true }
    )
      .then(
        leader => {
          res.json(leader);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })

  .delete((req, res, next) => {
    Leaders.findByIdAndDelete(req.params.leaderId)
      .then(
        resp => {
          res.json(resp);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

module.exports = leaderRouter;
