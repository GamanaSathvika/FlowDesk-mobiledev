const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const FocusSession = require('../models/FocusSession');

// This handles POST to /api/focus
router.post('/', auth, async (req, res) => {
  try {
    const { taskTitle, durationSeconds } = req.body;

    // Validate input before database operation
    if (!durationSeconds) {
      return res.status(400).json({ message: "Duration is required" });
    }

    const newSession = new FocusSession({
      user: req.user.id, // req.user is populated by your auth middleware
      taskTitle: taskTitle || "Untitled Session",
      duration: durationSeconds,
      completed: true,
      date: new Date()
    });

    await newSession.save();
    res.json(newSession);
  } catch (err) {
    console.error("Error saving focus session:", err.message);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
});

// This handles GET to /api/focus/stats
// routes/focus.js

router.get('/stats', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessions = await FocusSession.find({
      user: req.user.id,
      date: { $gte: today }
    });

    // Calculation logic remains, but console.log has been removed
    const totalSecondsToday = sessions.reduce((acc, sess) => acc + (Number(sess.duration) || 0), 0);
    
    res.json({
      totalSecondsToday,
      sessionCount: sessions.length
    });
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;