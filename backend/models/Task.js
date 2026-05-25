const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  sub: { type: String, default: '' },
  tag: { type: String, default: '' },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  dueAt: { type: Date },
  done: { type: Boolean, default: false },
  archived: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  archiveExpiryDate: { type: Date },
  deletedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);