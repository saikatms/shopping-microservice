const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const WishlistSchema = new Schema({
  customerId: { type: String },
  products: [
    {
      _id: { type: String, require: true },
    },
  ],
},{
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model("wishlist", WishlistSchema);