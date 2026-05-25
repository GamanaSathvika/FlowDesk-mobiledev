const Task = require('../models/Task');

const ARCHIVE_RETENTION_DAYS = 7;

function addArchiveExpiry(fromDate = new Date()) {
  const expiry = new Date(fromDate);
  expiry.setDate(expiry.getDate() + ARCHIVE_RETENTION_DAYS);
  return expiry;
}

function getWeekStart(date = new Date()) {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function backfillArchiveExpiry(userId) {
  const legacy = await Task.find({
    user: userId,
    archived: true,
    done: true,
    $or: [{ archiveExpiryDate: { $exists: false } }, { archiveExpiryDate: null }],
  });

  await Promise.all(
    legacy.map(task => {
      const base = task.completedAt || task.createdAt || new Date();
      task.archiveExpiryDate = addArchiveExpiry(base);
      return task.save();
    })
  );
}

async function purgeExpiredArchivedTasks(userFilter = {}) {
  const now = new Date();
  const result = await Task.deleteMany({
    ...userFilter,
    archived: true,
    done: true,
    archiveExpiryDate: { $lte: now },
  });
  return result.deletedCount;
}

async function runArchiveCleanup(userId) {
  if (userId) {
    await backfillArchiveExpiry(userId);
    return purgeExpiredArchivedTasks({ user: userId });
  }
  const users = await Task.distinct('user', { archived: true, done: true });
  let removed = 0;
  for (const id of users) {
    await backfillArchiveExpiry(id);
    removed += await purgeExpiredArchivedTasks({ user: id });
  }
  return removed;
}

module.exports = {
  ARCHIVE_RETENTION_DAYS,
  addArchiveExpiry,
  getWeekStart,
  startOfDay,
  runArchiveCleanup,
  purgeExpiredArchivedTasks,
  backfillArchiveExpiry,
};
