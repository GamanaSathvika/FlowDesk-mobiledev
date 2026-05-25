const FocusSession = require('../models/FocusSession');
const Task = require('../models/Task');
const { getOrCreateAnalytics } = require('../utils/analyticsStore');

function emptyAnalyticsResponse() {
  const bars = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
    day,
    tasks: 0,
    focus: 0,
  }));

  return {
    summary: { tasks: 0, focus: '0s', score: 0 },
    trend: { tasks: '0%', focus: '0s', score: '0%' },
    bars,
    totalTasks: 0,
    bestDay: '-',
    avgPerDay: 0,
    focusStats: { total: '0s', avg: '0s', sessions: 0 },
    completion: { completed: 0, pending: 0, inProgress: 0, archived: 0 },
    deletedCount: 0,
    completedCount: 0,
    totalCompletedHistory: 0,
    streakDays: 0,
    insight: 'No analytics data yet. Complete a task or start a focus session.',
  };
}

function resolveUserId(req) {
  if (req.user?.user?.id) return req.user.user.id;
  if (req.user?.user?._id) return req.user.user._id;
  return req.user?.id || req.user?._id || null;
}

const getAnalyticsData = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authorization denied. No user data found.' });
    }

    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(400).json({ message: 'Invalid user token configuration profile structure.' });
    }

    const queryFilter = { user: userId };
    const sessions = await FocusSession.find(queryFilter).sort({ date: 1 }).lean() || [];
    const tasks = await Task.find({ ...queryFilter, deleted: { $ne: true } }).lean() || [];
    const analytics = await getOrCreateAnalytics(userId);

    const dayMap = {};
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayLabel = daysOfWeek[d.getDay()];
      dayMap[dayLabel] = { day: dayLabel, tasks: 0, focus: 0 };
    }

    let totalFocusSeconds = 0;

    const dailyStats =
      Array.isArray(analytics?.dailyCompletedStats) && analytics.dailyCompletedStats.length
        ? analytics.dailyCompletedStats
        : Array.isArray(analytics?.dailyStats)
          ? analytics.dailyStats
          : [];

    dailyStats.forEach(stat => {
      if (!stat?.date) return;
      const parsed = new Date(stat.date);
      if (Number.isNaN(parsed.getTime())) return;
      const dayLabel = daysOfWeek[parsed.getDay()];
      if (dayMap[dayLabel]) {
        dayMap[dayLabel].tasks += stat.completed || 0;
      }
    });

    sessions.forEach(s => {
      if (!s?.date) return;
      const parsed = new Date(s.date);
      if (Number.isNaN(parsed.getTime())) return;
      const dayLabel = daysOfWeek[parsed.getDay()];
      const duration = Number(s.duration) || 0;
      if (dayMap[dayLabel]) {
        dayMap[dayLabel].focus += duration;
      }
      totalFocusSeconds += duration;
    });

    const bars = Object.values(dayMap).reverse();

    let bestDay = '-';
    let maxFocus = 0;
    bars.forEach(b => {
      if (b.focus > maxFocus) {
        maxFocus = b.focus;
        bestDay = b.day;
      }
    });

    const completedTasks = analytics?.totalCompletedCount ?? analytics?.completedTasksCount ?? 0;
    const deletedTasks = analytics?.deletedTasksCount ?? 0;
    const totalCompletedHistory = completedTasks;
    const pendingTasks = tasks.filter(t => t && !t.done && !t.archived).length;
    const archivedTasks = tasks.filter(t => t && t.archived && !t.done).length;
    const historyDenominator = completedTasks + pendingTasks + archivedTasks;

    const productivityScore = historyDenominator > 0
      ? Math.round((completedTasks / historyDenominator) * 100)
      : 0;

    const uniqueActiveDays = new Set(
      sessions
        .map(s => (s?.date ? new Date(s.date).toDateString() : ''))
        .filter(Boolean)
    );

    let streakDays = 0;
    let traceDate = new Date();

    while (uniqueActiveDays.has(traceDate.toDateString())) {
      streakDays++;
      traceDate.setDate(traceDate.getDate() - 1);
    }

    if (streakDays === 0) {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      traceDate = yesterday;
      while (uniqueActiveDays.has(traceDate.toDateString())) {
        streakDays++;
        traceDate.setDate(traceDate.getDate() - 1);
      }
    }

    const avgSessionSeconds = sessions.length ? Math.floor(totalFocusSeconds / sessions.length) : 0;
    const pct = (n) => (historyDenominator > 0 ? Math.round((n / historyDenominator) * 100) : 0);

    return res.status(200).json({
      summary: {
        tasks: completedTasks,
        focus: `${totalFocusSeconds}s`,
        score: productivityScore,
      },
      trend: {
        tasks: completedTasks > 0 ? 'Active' : '0%',
        focus: totalFocusSeconds > 0 ? `+${totalFocusSeconds}s` : '0s',
        score: `${productivityScore}%`,
      },
      bars,
      totalTasks: totalCompletedHistory,
      bestDay,
      avgPerDay: Math.round(completedTasks / 7) || 0,
      focusStats: {
        total: `${totalFocusSeconds}s`,
        avg: `${avgSessionSeconds}s`,
        sessions: sessions.length,
      },
      completion: {
        completed: pct(completedTasks),
        pending: pct(pendingTasks),
        inProgress: pct(archivedTasks),
        archived: pct(archivedTasks),
      },
      deletedCount: deletedTasks,
      completedCount: completedTasks,
      totalCompletedHistory,
      streakDays,
      insight: totalFocusSeconds > 1800
        ? 'Excellent concentration today! Your deep work blocks are scaling effectively.'
        : 'Consistency beats intensity. Try starting a small focus session to build momentum.',
    });
  } catch (error) {
    console.error('Analytics Backend Error:', error);
    return res.status(200).json(emptyAnalyticsResponse());
  }
};

module.exports = { getAnalyticsData };
