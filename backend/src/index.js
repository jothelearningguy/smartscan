require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const logger = require('./utils/logger');
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const photoRoutes = require('./routes/photoRoutes');
const imageRoutes = require('./routes/imageRoutes');
const smartScanRoutes = require('./routes/smartScan.routes');
const studyRoutes = require('./routes/study.routes');
const studyPathRoutes = require('./routes/studyPath.routes');
const scanRoutes = require('./routes/scan.routes');

const app = express();

// Configure server for larger request headers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  points: 10, // Number of points
  duration: 1 // Per second
});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (error) {
    res.status(429).json({
      status: 'error',
      message: 'Too many requests, please try again later.'
    });
  }
});

// Basic middleware
app.use(morgan('dev'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/smartscan', smartScanRoutes);
app.use('/api/studies', studyRoutes);
app.use('/api/study-paths', studyPathRoutes);
app.use('/api/scans', scanRoutes);

// Serve static files from the frontend build directory
const frontendPath = path.join(__dirname, '../../../frontend/build');
app.use(express.static(frontendPath));

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error:', err);

  // Handle multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      status: 'error',
      message: err.errors.map(e => e.message)
    });
  }

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      status: 'error',
      message: 'A record with this value already exists'
    });
  }

  // Default error
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error'
  });
});

// Initialize database
const initDatabase = async () => {
  try {
    // Test the connection
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');

    // Sync all models
    await sequelize.sync({ alter: true });
    logger.info('Database models have been synchronized.');

    // Create a test user if none exists
    const { User } = require('./models');
    const userCount = await User.count();
    
    if (userCount === 0) {
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      logger.info('Test user has been created.');
    }

    // Start server after database is initialized
    const PORT = process.env.PORT || 3002;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

initDatabase();

module.exports = app; 