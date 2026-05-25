import { formatDueDisplay } from './dateHelpers';

export { formatDueDisplay };

export const PRIORITIES = ['High', 'Medium', 'Low'];

export const PRIORITY_CFG = {
  High:   { bg: '#FEF2F2', text: '#DC2626' },
  Medium: { bg: '#FFFBEB', text: '#D97706' },
  Low:    { bg: '#F0FDF4', text: '#16A34A' },
};

export const SUGGESTED_TAGS = ['College', 'Personal', 'Work'];

const isPriority = (value) => PRIORITIES.includes(value);

export function normalizeTask(task) {
  let priority = task.priority;
  let categoryTag = task.tag || '';

  if (!priority && isPriority(categoryTag)) {
    priority = categoryTag;
    categoryTag = '';
  }
  if (!priority) priority = 'Medium';
  if (isPriority(categoryTag)) categoryTag = '';

  const dueAt = task.dueAt ? new Date(task.dueAt) : null;
  const dueLabel = dueAt
    ? formatDueDisplay(dueAt)
    : (task.sub && task.sub !== 'No due date' ? task.sub : '');

  return {
    ...task,
    id: task._id || task.id,
    priority,
    categoryTag,
    dueAt,
    dueLabel,
  };
}

export function mergeDateKeepTime(existing, nextDate) {
  const base = existing ? new Date(existing) : new Date();
  base.setFullYear(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
  return base;
}

export function mergeTimeKeepDate(existing, nextTime) {
  const base = existing ? new Date(existing) : new Date();
  base.setHours(nextTime.getHours(), nextTime.getMinutes(), 0, 0);
  return base;
}

export function getTaskDueLine(task) {
  const parts = [];
  if (task.categoryTag) parts.push(task.categoryTag);
  if (task.dueLabel) parts.push(task.dueLabel);
  return parts.length ? parts.join(' · ') : 'No due date';
}
