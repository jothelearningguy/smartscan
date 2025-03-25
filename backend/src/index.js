require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database connection
mongoose.connect('mongodb://127.0.0.1:27017/heallyhub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  retryReads: true
})
.then(() => {
  logger.info('Connected to MongoDB');
})
.catch(err => {
  logger.error('MongoDB connection error:', err);
  // Don't exit process, just log the error
  logger.error('Failed to connect to MongoDB. Server will continue running without database functionality.');
});

// Serve static files from the frontend build directory
const frontendPath = path.join(__dirname, '../../../frontend/build');
app.use(express.static(frontendPath));

// API routes
const apiRouter = express.Router();

apiRouter.get('/test', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'API is working!',
    time: new Date().toISOString()
  });
});

// Mount API routes under /api
app.use('/api', apiRouter);

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app; 