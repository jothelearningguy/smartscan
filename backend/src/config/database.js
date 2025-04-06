const { Sequelize } = require('sequelize');
const logger = require('../../../frontend/src/second-utils/logger');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

// Test the connection
sequelize.authenticate()
  .then(() => {
    logger.info('Database connection established successfully.');
  })
  .catch(err => {
    logger.error('Unable to connect to the database:', err);
  });

module.exports = sequelize; 