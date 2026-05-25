const mongoose = require('mongoose');

const FocusSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }, 
  taskTitle: { type: String }, // ADDED: To store the title sent from frontend
  duration: { type: Number, required: true }, // duration in seconds
  date: { type: Date, default: Date.now },    // ADDED: For easier daily stats
  completed: { type: Boolean, default: false }
});

module.exports = mongoose.model('FocusSession', FocusSessionSchema);