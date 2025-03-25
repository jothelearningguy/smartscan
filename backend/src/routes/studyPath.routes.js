const express = require('express');
const router = express.Router();
const studyPathController = require('../controllers/studyPath.controller');
const auth = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(auth);

// Study path CRUD operations
router.post('/', studyPathController.createStudyPath);
router.get('/class/:classId', studyPathController.getClassStudyPaths);
router.get('/:pathId', studyPathController.getStudyPath);

// Timeline management
router.put('/:pathId/timeline', studyPathController.updateTimeline);
router.post('/:pathId/sessions', studyPathController.addSession);
router.put('/:pathId/sessions/:sessionId/status', studyPathController.updateSessionStatus);
router.get('/:pathId/sessions/:sessionId/suggestions', studyPathController.getSessionSuggestions);

// Learning objectives
router.put('/:pathId/objectives', studyPathController.updateObjectives);

// Progress tracking
router.get('/:pathId/progress', studyPathController.getProgress);

module.exports = router; 