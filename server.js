// Import required dependencies
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

/**
 * Middleware Configuration
 * - CORS: Enables Cross-Origin Resource Sharing for frontend requests
 * - express.json(): Parses incoming JSON payloads
 */
app.use(cors());
app.use(express.json());

/**
 * Simulated Database
 * This is a temporary in-memory storage solution.
 * In production, replace with a proper database (e.g., MongoDB, PostgreSQL)
 */
let smartCanData = {
  fullness: 75,
  lastEmptied: new Date().toISOString(),
  nextPickup: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  location: 'Building A, Floor 2',
  temperature: 22,
  humidity: 45
};

/**
 * API Routes
 */

/**
 * GET /api/smartcan/status
 * Returns the current status of the SmartCan
 * Simulates real-time updates by generating random values within acceptable ranges
 */
app.get('/api/smartcan/status', (req, res) => {
  // Simulate real-time updates with random values
  smartCanData = {
    ...smartCanData,
    fullness: Math.floor(Math.random() * 30) + 50, // Random value between 50-80
    temperature: Math.floor(Math.random() * 5) + 20, // Random value between 20-25
    humidity: Math.floor(Math.random() * 20) + 40, // Random value between 40-60
  };
  
  res.json(smartCanData);
});

/**
 * POST /api/smartcan/update
 * Updates the SmartCan status with new values
 * @param {Object} req.body - The updates to apply to the SmartCan status
 */
app.post('/api/smartcan/update', (req, res) => {
  const updates = req.body;
  smartCanData = { ...smartCanData, ...updates };
  res.json(smartCanData);
});

/**
 * Error Handling Middleware
 * Catches and handles any errors that occur during request processing
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

/**
 * Start the server
 * Listens on the specified port and logs the server status
 */
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 