const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Uses the middleware above
const Task = require('../models/Task');
const { recordTaskCompleted, recordTaskDeleted } = require('../utils/analyticsStore');
const { addArchiveExpiry, runArchiveCleanup } = require('../utils/archiveRetention');

const PRIORITIES = ['High', 'Medium', 'Low'];

function resolvePriority(body) {
  if (PRIORITIES.includes(body.priority)) return body.priority;
  if (PRIORITIES.includes(body.tag)) return body.tag;
  return null;
}

function resolveCategoryTag(body, priority) {
  const raw = (body.categoryTag ?? body.tag ?? '').trim();
  if (!raw || PRIORITIES.includes(raw) || raw === priority) return '';
  return raw;
}

// @route   GET /api/tasks
// @desc    Get all active tasks for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const legacyCompletedAt = new Date();
    await Task.updateMany(
      { user: req.user.id, done: true, archived: false },
      {
        $set: {
          archived: true,
          completedAt: legacyCompletedAt,
          archiveExpiryDate: addArchiveExpiry(legacyCompletedAt),
        },
      }
    );
    const tasks = await Task.find({ user: req.user.id, archived: false, done: false }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/tasks/archive
// @desc    Get archived tasks
router.get('/archive', auth, async (req, res) => {
  try {
    await runArchiveCleanup(req.user.id);

    const now = new Date();
    const tasks = await Task.find({
      user: req.user.id,
      archived: true,
      deleted: { $ne: true },
      $or: [
        { done: false },
        { archiveExpiryDate: { $gt: now } },
      ],
    }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/tasks
// @desc    Create a task
router.post('/', auth, async (req, res) => {
  try {
    const title = req.body.title?.trim();
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const priority = resolvePriority(req.body);
    if (!priority) return res.status(400).json({ message: 'Priority is required' });

    const dueAt = req.body.dueAt ? new Date(req.body.dueAt) : undefined;
    const newTask = new Task({
      title,
      sub: req.body.sub || '',
      tag: resolveCategoryTag(req.body, priority),
      priority,
      dueAt: dueAt && !Number.isNaN(dueAt.getTime()) ? dueAt : undefined,
      user: req.user.id,
    });
    const task = await newTask.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PATCH /api/tasks/:id
// @desc    Update/Archive/Complete task
// Update/Archive/Complete task
router.patch('/:id', auth, async (req, res) => {
  try {
    // 1. Find the task first
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // 2. Ensure user owns the task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const wasDone = task.done === true;

    // 3. Apply updates (completing a task moves it to archive)
    const updates = { ...req.body };
    if (updates.done === true) {
      const completedAt = updates.completedAt ? new Date(updates.completedAt) : new Date();
      updates.archived = true;
      updates.done = true;
      updates.completedAt = completedAt;
      updates.archiveExpiryDate = addArchiveExpiry(completedAt);
    }
    if (updates.archived === false) {
      updates.done = false;
      updates.archiveExpiryDate = null;
      updates.completedAt = null;
    }
    if (updates.archived === true && updates.done !== true) {
      updates.done = false;
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    if (!wasDone && task.done === true) {
      await recordTaskCompleted(req.user.id, task.completedAt);
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Permanent delete (archive UI only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const deletedAt = new Date();
    await Task.findByIdAndUpdate(req.params.id, {
      $set: { deleted: true, deletedAt },
    });

    if (task.done !== true) {
      await recordTaskDeleted(req.user.id, deletedAt);
    }

    res.json({ message: 'Task removed from archive' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;