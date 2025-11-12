const mongoose = require('mongoose');
const { Schema } = mongoose;

const TimelineEventSchema = new Schema({
  title: String,
  description: String,
  date: String,
  type: { type: String, enum: ['milestone', 'meeting', 'ceremony', 'memory'] },
  status: { type: String, enum: ['completed', 'upcoming', 'planned'] },
  photos: [String],
  location: String,
  participants: [String],
  isPrivate: Boolean
});

module.exports = mongoose.model('TimelineEvent', TimelineEventSchema); 