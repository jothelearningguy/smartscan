const mongoose = require('mongoose');
const logger = require('../second-utils/logger.js');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartscan');
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 