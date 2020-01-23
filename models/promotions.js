const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("mongoose-currency").loadType(mongoose);
const Currency = mongoose.Types.Currency;

const promoSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    price: {
      type: Currency,
      required: true,
      min: 0
    },
    label: {
      type: String,
      default: ""
    },
    description: {
      type: String,
      required: true
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Promotions = mongoose.model("Promotion", promoSchema);

module.exports = Promotions;
