const Analytics = require('../models/Analytics');
const Task = require('../models/Task');
const { getWeekStart, startOfDay } = require('./archiveRetention');

function ensureAnalyticsDefaults(analytics) {
  if (!analytics.dailyCompletedStats) analytics.dailyCompletedStats = [];
  if (!analytics.weeklyCompletedStats) analytics.weeklyCompletedStats = [];
  if (!analytics.dailyStats) analytics.dailyStats = [];

  analytics.totalCompletedCount =
    analytics.totalCompletedCount ?? analytics.completedTasksCount ?? 0;
  analytics.completedTasksCount =
    analytics.completedTasksCount ?? analytics.totalCompletedCount ?? 0;
  analytics.deletedTasksCount = analytics.deletedTasksCount ?? 0;
  analytics.totalCompletedHistory =
    analytics.totalCompletedHistory ?? analytics.totalCompletedCount ?? 0;

  return analytics;
}

function normalizeAnalyticsDoc(analytics) {
  ensureAnalyticsDefaults(analytics);

  if (!analytics.totalCompletedCount && analytics.completedTasksCount) {
    analytics.totalCompletedCount = analytics.completedTasksCount;
  }
  if (!analytics.completedTasksCount && analytics.totalCompletedCount) {
    analytics.completedTasksCount = analytics.totalCompletedCount;
  }
  analytics.totalCompletedHistory = analytics.totalCompletedCount;

  if (!analytics.dailyCompletedStats.length && analytics.dailyStats.length) {
    analytics.dailyCompletedStats = analytics.dailyStats;
  }
  if (!analytics.dailyStats.length && analytics.dailyCompletedStats.length) {
    analytics.dailyStats = analytics.dailyCompletedStats;
  }
  return analytics;
}

function upsertDailyStat(analytics, date, field) {
  ensureAnalyticsDefaults(analytics);
  const stats = analytics.dailyCompletedStats;
  const day = startOfDay(date).getTime();
  let entry = stats.find(s => startOfDay(s.date).getTime() === day);
  if (!entry) {
    entry = { date: startOfDay(date), completed: 0, deleted: 0 };
    stats.push(entry);
  }
  entry[field] = (entry[field] || 0) + 1;
  analytics.dailyStats = stats;
}

function upsertWeeklyStat(analytics, date) {
  ensureAnalyticsDefaults(analytics);
  const weekStart = getWeekStart(date);
  const weekKey = weekStart.getTime();
  let entry = analytics.weeklyCompletedStats.find(
    s => getWeekStart(s.weekStart).getTime() === weekKey
  );
  if (!entry) {
    entry = { weekStart, completed: 0 };
    analytics.weeklyCompletedStats.push(entry);
  }
  entry.completed = (entry.completed || 0) + 1;
}

async function seedFromExistingTasks(userId, analytics) {
  ensureAnalyticsDefaults(analytics);

  const completedTasks = await Task.find({ user: userId, done: true }).select('completedAt createdAt');
  const completedCount = completedTasks.length;

  analytics.totalCompletedCount = Math.max(analytics.totalCompletedCount || 0, completedCount);
  analytics.completedTasksCount = analytics.totalCompletedCount;
  analytics.totalCompletedHistory = analytics.totalCompletedCount;

  if (!analytics.dailyCompletedStats.length && completedCount > 0) {
    completedTasks.forEach(task => {
      upsertDailyStat(analytics, task.completedAt || task.createdAt, 'completed');
      upsertWeeklyStat(analytics, task.completedAt || task.createdAt);
    });
  }

  const deletedCount = await Task.countDocuments({ user: userId, deleted: true, done: { $ne: true } });
  analytics.deletedTasksCount = Math.max(analytics.deletedTasksCount || 0, deletedCount);

  return normalizeAnalyticsDoc(analytics);
}

async function getOrCreateAnalytics(userId) {
  let analytics = await Analytics.findOne({ user: userId });

  if (!analytics) {
    analytics = await Analytics.create({
      user: userId,
      totalCompletedCount: 0,
      completedTasksCount: 0,
      deletedTasksCount: 0,
      totalCompletedHistory: 0,
      dailyCompletedStats: [],
      weeklyCompletedStats: [],
      dailyStats: [],
    });
    await seedFromExistingTasks(userId, analytics);
    return normalizeAnalyticsDoc(analytics);
  }

  ensureAnalyticsDefaults(analytics);
  normalizeAnalyticsDoc(analytics);

  const legacyCompleted = await Task.countDocuments({ user: userId, done: true });
  if ((analytics.totalCompletedCount || 0) < legacyCompleted) {
    await seedFromExistingTasks(userId, analytics);
    await analytics.save();
  }

  return analytics;
}

async function recordTaskCompleted(userId, completedAt = new Date()) {
  const analytics = await getOrCreateAnalytics(userId);
  analytics.totalCompletedCount = (analytics.totalCompletedCount || 0) + 1;
  analytics.completedTasksCount = analytics.totalCompletedCount;
  analytics.totalCompletedHistory = analytics.totalCompletedCount;
  upsertDailyStat(analytics, completedAt, 'completed');
  upsertWeeklyStat(analytics, completedAt);
  await analytics.save();
  return analytics;
}

async function recordTaskDeleted(userId, deletedAt = new Date()) {
  const analytics = await getOrCreateAnalytics(userId);
  analytics.deletedTasksCount = (analytics.deletedTasksCount || 0) + 1;
  upsertDailyStat(analytics, deletedAt, 'deleted');
  await analytics.save();
  return analytics;
}

module.exports = {
  getOrCreateAnalytics,
  recordTaskCompleted,
  recordTaskDeleted,
  normalizeAnalyticsDoc,
  ensureAnalyticsDefaults,
};
