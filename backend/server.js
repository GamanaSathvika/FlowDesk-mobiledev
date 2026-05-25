const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth')); // FIXED: Added /api prefix to eliminate the 404
app.use('/api/users', require('./routes/user'));
app.use('/api/user', require('./routes/user'));
app.use('/api/tasks', require('./routes/tasks')); 
app.use('/api/focus', require('./routes/focus'));
app.use('/api/analytics', require('./routes/analytics'));

// Basic Route for testing
app.get('/', (req, res) => res.send('Flowdesk API is running...'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    require('./jobs/archiveCleanup').startArchiveCleanupJob();
  })
  .catch(err => console.error('❌ Connection Error:', err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server spinning on port ${PORT}`));