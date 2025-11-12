const mongoose = require('mongoose');
const { Schema } = mongoose;

const TaskSchema = new Schema({
  title: String,
  category: String,
  dueDate: String,
  completed: Boolean,
  priority: { type: String, enum: ['high', 'medium', 'low'] },
  assignedTo: String,
  notes: String
});

module.exports = mongoose.model('Task', TaskSchema); 