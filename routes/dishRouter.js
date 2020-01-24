const express = require("express");
const bodyParser = require("body-parser");

// update the routes to account for authenticating users
const authenticate = require("../authenticate");

const mongoose = require("mongoose");
const Dishes = require("../models/dishes");

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());

// dishes router handler
dishRouter
  .route("/")

  .get((req, res, next) => {
    Dishes.find({})
      .then(
        dishes => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dishes);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })

  // to allow only authenticated users
  .post(authenticate.verifyUser, (req, res, next) => {
    Dishes.create(req.body)
      .then(
        dish => {
          console.log("Dish created", dish);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })

  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation is not supported on /dishes/");
  })

  .delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.deleteMany({})
      .then(
        resp => {
          console.log("Deleted all the dishes");
          rets.stausCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

// dish router handler
dishRouter
  .route("/:dishId")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })

  .post(authenticate.verifyUser, (req, res, next) => {
    res.end("POST operation is not supported on /dishes/" + req.params.dishId);
  })

  .put(authenticate.verifyUser, (req, res, next) => {
    Dishes.findByIdAndUpdate(
      req.params.dishId,
      { $set: req.body },
      { new: true }
    )
      .then(
        dish => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })

  .delete(authenticate.verifyUser, (req, res, next) => {
    Dishes.findByIdAndDelete(req.params.dishId)
      .then(
        dish => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(dish);
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

// dish comments router handler
dishRouter
  .route("/:dishId/comments")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        dish => {
          if (dish) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish.comments);
          } else {
            const err = new Error(`Dish ${req.params.dishId} not found`);
            res.statusCode = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })

  .post(authenticate.verifyUser, (req, res, next) => {
    const dishId = req.params.dishId;
    Dishes.findById(dishId)
      .then(
        dish => {
          if (dish) {
            dish.comments.push(req.body);
            dish.save().then(
              dish => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(dish);
              },
              err => next(err)
            );
          } else {
            const err = new Error(`Dish ${dishId} not found`);
            res.statusCode = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })

  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `Put operation is not supported on /dishes/${req.params.dishId}/comments`
    );
  })

  .delete(authenticate.verifyUser, (req, res, next) => {
    const dishId = req.params.dishId;
    Dishes.findById(dishId)
      .then(
        dish => {
          if (dish) {
            for (let i = dish.comments.length - 1; i >= 0; i--) {
              dish.comments.id(dish.comments[i]._id).remove();
            }
            dish.save().then(dish => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(dish);
            });
          } else {
            const err = new Error(`Dish ${dishId} not found`);
            res.statusCode = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

// dish comment router handler
dishRouter
  .route("/:dishId/comments/:commentId")
  .get((req, res, next) => {
    const dishId = req.params.dishId;
    const commentId = req.params.commentId;

    Dishes.findById(dishId)
      .then(
        dish => {
          if (dish && dish.comments.id(commentId)) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(dish.comments.id(commentId));
          } else if (dish == null) {
            const err = new Error(`Dish ${dishId} not found`);
            res.statusCode = 404;
            return next(err);
          } else {
            const err = new Error(`Comment ${commentId} not found`);
            res.statusCode = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })

  .post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      "Post operation is not supported on /dishes/" +
        req.params.dishId +
        "/comments/" +
        req.params.commentId
    );
  })

  .put(authenticate.verifyUser, (req, res, next) => {
    const dishId = req.params.dishId;
    const commentId = req.params.commentId;

    Dishes.findById(dishId)
      .then(
        dish => {
          if (dish && dish.comments.id(commentId)) {
            // allow only two prop to be updated on a comment
            const rating = req.body.rating;
            if (rating) {
              dish.comments.id(commentId).rating = rating;
            }
            const comment = req.body.comment;
            if (comment) {
              dish.comments.id(commentId).comment = comment;
            }

            dish.save().then(dish => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(dish);
            });
          } else if (dish == null) {
            const err = new Error(`Dish ${dishId} not found`);
            res.statusCode = 404;
            return next(err);
          } else {
            const err = new Error(`Comment ${commentId} not found`);
            res.statusCode = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })

  .delete(authenticate.verifyUser, (req, res, next) => {
    const dishId = req.params.dishId;
    const commentId = req.params.commentId;

    Dishes.findById(dishId)
      .then(
        dish => {
          if (dish && dish.comments.id(commentId)) {
            dish.comments.id(commentId).remove();
            dish.save().then(dish => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(dish);
            });
          } else if (dish == null) {
            const err = new Error(`Dish ${dishId} not found`);
            res.statusCode = 404;
            return next(err);
          } else {
            const err = new Error(`Comment ${commentId} not found`);
            res.statusCode = 404;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

module.exports = dishRouter;
