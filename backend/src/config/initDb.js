const sequelize = require('./database');
const models = require('../models');

const initDatabase = async () => {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('Database models have been synchronized.');

    // Create a test user if none exists
    const { User } = models;
    const userCount = await User.count();
    
    if (userCount === 0) {
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('Test user has been created.');
    }

  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = initDatabase; 