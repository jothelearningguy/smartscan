const mysql = require('mysql2/promise');
const logger = require('../utils/logger');
require('dotenv').config();

const setupDatabase = async () => {
  try {
    // Create connection without database selected
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    logger.info('Database created or already exists');

    // Close the connection
    await connection.end();
  } catch (error) {
    logger.error('Error setting up database:', error);
    process.exit(1);
  }
};

module.exports = setupDatabase; 