const mongoose = require('mongoose');
const { Schema } = mongoose;

const SuccessStorySchema = new Schema({
  couple: {
    name1: String,
    name2: String,
    photo1: String,
    photo2: String
  },
  story: String,
  weddingDate: String,
  location: String,
  photos: [String]
});

module.exports = mongoose.model('SuccessStory', SuccessStorySchema); 