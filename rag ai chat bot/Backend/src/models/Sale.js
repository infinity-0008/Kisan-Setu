const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  farmerId: {
    type: String,
    required: true,
    trim: true
  },
  productId: {
    type: String,
    required: true,
    trim: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  buyerName: {
    type: String,
    trim: true
  },
  saleDate: {
    type: Date,
    default: Date.now
  }
});

const saleModel = mongoose.model('Sale', saleSchema);

module.exports = saleModel;