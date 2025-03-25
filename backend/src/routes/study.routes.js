const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const smartScanController = require('../controllers/smartScan.controller');

// Apply authentication middleware to all routes
router.use(auth);

// Study material routes
router.get('/materials/:classId', smartScanController.getClassMaterials);
router.get('/materials/search/:classId', smartScanController.searchMaterials);

// Study session routes
router.post('/sessions/start', smartScanController.startStudySession);
router.get('/sessions/:classId', smartScanController.getStudySessions);
router.get('/sessions/stats/:classId', smartScanController.getStudyStats);

// Flashcard routes
router.get('/flashcards/:classId', smartScanController.getClassFlashcards);
router.get('/flashcards/material/:materialId', smartScanController.getMaterialFlashcards);
router.post('/flashcards/material/:materialId', smartScanController.generateFlashcards);

// Material organization routes
router.get('/materials/organized/:classId', smartScanController.getOrganizedMaterials);
router.post('/materials/organize/:classId', smartScanController.organizeMaterials);
router.put('/materials/tags/:materialId', smartScanController.updateMaterialTags);

// Study path and recommendations
router.get('/recommendations/:classId', smartScanController.getStudyRecommendations);
router.post('/path/generate/:classId', smartScanController.generateStudyPath);
router.put('/path/customize/:classId', smartScanController.customizeStudyPath);

module.exports = router; 