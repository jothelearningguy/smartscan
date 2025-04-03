require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./src/config/db');
const photoRoutes = require('./src/routes/photoRoutes');
const errorHandler = require('./src/middleware/errorHandler');
const logger = require('./src/utils/logger');

const app = express();
const port = process.env.PORT || 3001;

// Ensure required directories exist
const dirs = ['uploads', 'logs'];
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    logger.info(`Created directory: ${dirPath}`);
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to SmartScan API',
    version: '1.0.0',
    endpoints: {
      photos: '/api/photos',
      upload: '/api/photos/upload',
      process: '/api/photos/:id/process',
      categorize: '/api/photos/:id/categorize'
    }
  });
});

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/photos', photoRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const server = app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    logger.error(`Port ${port} is already in use`);
    process.exit(1);
  } else {
    logger.error('Server error:', err);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
}); 