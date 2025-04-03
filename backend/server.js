const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const sequelize = require('./src/config/database');
const setupDatabase = require('./src/config/setupDatabase');
const logger = require('./src/utils/logger');
const authRoutes = require('./src/routes/authRoutes');

const app = express();

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 3001;

// Setup database and start server
setupDatabase()
  .then(() => sequelize.authenticate())
  .then(() => {
    logger.info('Database connection established successfully.');
    // Force sync in development mode
    return sequelize.sync({ force: process.env.NODE_ENV === 'development' });
  })
  .then(() => {
    logger.info('Database synced successfully.');
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    logger.error('Unable to start server:', err);
    process.exit(1);
  }); 