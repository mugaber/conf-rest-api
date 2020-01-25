const express = require("express");
const bodyParser = require("body-parser");

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
      // to populate the dishes comments author before rendering
      .populate("comments.author")
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

  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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

  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation is not supported on /dishes/");
  })

  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.deleteMany({})
        .then(
          resp => {
            console.log("Deleted all the dishes");
            res.stausCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(resp);
          },
          err => next(err)
        )
        .catch(err => next(err));
    }
  );

// dish router handler
dishRouter
  .route("/:dishId")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate("comments.author")
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

  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.end("POST operation is not supported on /dishes/" + req.params.dishId);
  })

  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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

  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
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
    }
  );

// dish comments router handler
dishRouter
  .route("/:dishId/comments")
  .get((req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate("comments.author")
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
            // to add the comment author id to the body of the req
            // that have been added to req  from the authorization
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save().then(
              dish => {
                // to populate the dish comment author before sending
                Dishes.findById(dish._id)
                  .populate("comments.author")
                  .then(dish => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(dish);
                  });
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

  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
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
    }
  );

// dish comment router handler
dishRouter
  .route("/:dishId/comments/:commentId")
  .get((req, res, next) => {
    const dishId = req.params.dishId;
    const commentId = req.params.commentId;

    Dishes.findById(dishId)
      .populate("comments.author")
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
          if (
            dish &&
            dish.comments.id(commentId) &&
            // allow only the author of the comment to modify it
            dish.comments.id(commentId).author.equals(req.user._id)
          ) {
            const rating = req.body.rating;
            if (rating) {
              dish.comments.id(commentId).rating = rating;
            }
            const comment = req.body.comment;
            if (comment) {
              dish.comments.id(commentId).comment = comment;
            }

            dish.save().then(dish => {
              Dishes.findById(dish._id)
                .populate("comments.author")
                .then(dish => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(dish);
                });
            });
          } else if (dish == null) {
            const err = new Error(`Dish ${dishId} not found`);
            res.statusCode = 404;
            return next(err);
            // if the dish comment does not exist
          } else if (dish.comments.id(req.params.commentId)) {
            const err = new Error(`Comment ${commentId} not found`);
            res.statusCode = 404;
            return next(err);
          } else {
            const err = new Error(
              `you are not authorized to update this comment`
            );
            res.statusCode = 403;
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
          if (
            dish &&
            dish.comments.id(commentId) &&
            dish.comments.id(commentId).author.equals(req.user._id)
          ) {
            dish.comments.id(commentId).remove();
            dish.save().then(dish => {
              Dishes.findById(dish._id)
                .populate("comments.author")
                .then(dish => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(dish);
                });
            });
          } else if (dish == null) {
            const err = new Error(`Dish ${dishId} not found`);
            res.statusCode = 404;
            return next(err);
          } else if (dish.comments.id(commentId) == null) {
            const err = new Error(`Comment ${commentId} not found`);
            res.statusCode = 404;
            return next(err);
          } else {
            const err = new Error(
              "you are not authorized to delete this comment"
            );
            res.statusCode = 403;
            return next(err);
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  });

module.exports = dishRouter;
