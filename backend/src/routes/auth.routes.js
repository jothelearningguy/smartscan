const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', auth, authController.getProfile);
router.put('/me', auth, authController.updateProfile);
router.post('/logout', auth, authController.logout);

module.exports = router; 