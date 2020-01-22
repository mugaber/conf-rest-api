const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// to construct a nested schema

const commentSchema = new Schema(
  {
    rate: {
      type: Number,
      min: 1,
      max: 5,
      require: true
    },
    comment: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// we are going to make use of this schema for the dishes
// to have a comments that follow commentSchema

const dishSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    comments: [ commentSchema ]
  },
  {
    timestamps: true
  }
);

const Dishes = mongoose.model("Dish", dishSchema);

module.exports = Dishes;
