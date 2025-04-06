const logger = require('../second-utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error:', err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'File Upload Error',
      details: err.message
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

module.exports = errorHandler; 