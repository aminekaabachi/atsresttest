const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var Product = new Schema({
  productName: String,
  basePrice: String,
  category: String,
  brand: String,
  imageUrl: String,
  productMaterial: String,
  delivery: String,
  reviews: [{
    rating: String,
    content: String
  }]
})


module.exports = mongoose.model('Product', Product)
