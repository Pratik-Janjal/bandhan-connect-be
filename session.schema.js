const mongoose = require('mongoose');
const { Schema } = mongoose;

const SessionSchema = new Schema({
  counselorId: { type: Schema.Types.ObjectId, ref: 'Counselor' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  date: String,
  time: String,
  type: { type: String, enum: ['video', 'audio', 'chat'] },
  status: { type: String, enum: ['upcoming', 'completed', 'cancelled'] },
  topic: String
});

module.exports = mongoose.model('Session', SessionSchema); 