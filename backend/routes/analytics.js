const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// 🔒 Import your auth middleware (Make sure the path matches where your project stores it)
const auth = require('../middleware/auth'); 

// 🎯 Insert 'auth' right here between the path string and the controller function!
router.get('/data', auth, analyticsController.getAnalyticsData);

module.exports = router;