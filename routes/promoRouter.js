const express = require("express");
const bodyParser = require("body-parser");
const Promotions = require("../models/promotions");
const authenticate = require("../authenticate");

const promoRouter = express.Router();
promoRouter.use(bodyParser.json());

// promotions router handler
promoRouter
  .route("/")

  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })

  .get((req, res, next) => {
    Promotions.find({})
      .then(
        promotions => {
          res.json(promotions);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })

  .post(authenticate.verifyUser, (req, res, next) => {
    Promotions.create(req.body)
      .then(
        promotion => {
          res.json(promotion);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })

  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation is not supported on /promotions");
  })

  .delete(authenticate.verifyUser, (req, res, next) => {
    Promotions.deleteMany({})
      .then(
        resp => {
          res.json(resp);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

// promotion router handler
promoRouter
  .route("/:promoId")

  .all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    next();
  })

  .get((req, res, next) => {
    Promotions.findById(req.params.promoId)
      .then(
        promotion => {
          res.json(promotion);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })

  .post(authenticate.verifyUser, (req, res, next) => {
    res.end(
      "POST operation is not supported on /promotions/" + req.params.promoId
    );
  })

  .put(authenticate.verifyUser, (req, res, next) => {
    Promotions.findByIdAndUpdate(
      req.params.promoId,
      { $set: req.body },
      { new: true }
    )
      .then(
        promotion => {
          res.json(promotion);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })

  .delete(authenticate.verifyUser, (req, res, next) => {
    Promotions.findByIdAndDelete(req.params.promoId)
      .then(
        resp => {
          res.json(resp);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

module.exports = promoRouter;
