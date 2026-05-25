const mongoose = require('mongoose');

const DailyStatSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    completed: { type: Number, default: 0 },
    deleted: { type: Number, default: 0 },
  },
  { _id: false }
);

const WeeklyStatSchema = new mongoose.Schema(
  {
    weekStart: { type: Date, required: true },
    completed: { type: Number, default: 0 },
  },
  { _id: false }
);

const AnalyticsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  totalCompletedCount: { type: Number, default: 0 },
  deletedTasksCount: { type: Number, default: 0 },
  dailyCompletedStats: { type: [DailyStatSchema], default: [] },
  weeklyCompletedStats: { type: [WeeklyStatSchema], default: [] },
  // Legacy fields kept for backward compatibility with existing DB documents
  completedTasksCount: { type: Number, default: 0 },
  totalCompletedHistory: { type: Number, default: 0 },
  dailyStats: { type: [DailyStatSchema], default: [] },
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
