const mongoose = require('mongoose');
const { Schema } = mongoose;

const ServiceSchema = new Schema({
  name: String,
  category: String,
  description: String,
  rating: Number,
  reviews: Number,
  priceRange: String,
  location: String,
  image: String,
  verified: Boolean,
  featured: Boolean,
  contact: {
    phone: String,
    email: String
  },
  services: [String]
});

module.exports = mongoose.model('Service', ServiceSchema); 