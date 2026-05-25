export function parseDueDate(dueDate) {
  if (!dueDate) return null;
  const d = dueDate instanceof Date ? dueDate : new Date(dueDate);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isDueToday(dueDate, now = new Date()) {
  const d = parseDueDate(dueDate);
  if (!d) return false;
  return sameDay(d, now);
}

export function isDueTomorrow(dueDate, now = new Date()) {
  const d = parseDueDate(dueDate);
  if (!d) return false;
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return sameDay(d, tomorrow);
}

export function isOverdue(dueDate, now = new Date()) {
  const d = parseDueDate(dueDate);
  if (!d) return false;
  return d.getTime() < now.getTime();
}

export function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** Tasks list / modal: "Today 5:00 PM", "Tomorrow 5:00 PM", etc. */
export function formatDueDisplay(date) {
  const d = parseDueDate(date);
  if (!d) return '';
  const now = new Date();
  const time = formatTime(d);
  if (isOverdue(d, now)) return `Overdue · ${time}`;
  if (isDueToday(d, now)) return `Today ${time}`;
  if (isDueTomorrow(d, now)) return `Tomorrow ${time}`;
  const day = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${day} • ${time}`;
}

/** Dashboard / compact labels: "Due Today", "Due Tomorrow", "Overdue", etc. */
export function formatDueDate(dueDate) {
  const d = parseDueDate(dueDate);
  if (!d) return 'No due date';
  const now = new Date();
  if (isOverdue(d, now)) return 'Overdue';
  if (isDueToday(d, now)) return 'Due Today';
  if (isDueTomorrow(d, now)) return 'Due Tomorrow';

  const daysAhead = Math.round((startOfDay(d) - startOfDay(now)) / 86400000);
  if (daysAhead >= 2 && daysAhead < 7) {
    const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
    return `Due ${weekday}`;
  }
  const formatted = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `Due ${formatted}`;
}

export function isTaskInTodaysSection(task) {
  if (task.done || task.archived) return false;
  if (!task.dueAt) return true;
  return isDueToday(task.dueAt);
}
