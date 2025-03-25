const express = require('express');
const router = express.Router();
const multer = require('multer');
const smartScanController = require('../controllers/smartScan.controller');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
    }
  }
});

// Apply authentication middleware to all routes
router.use(auth);

// Upload and process a new document
router.post('/upload/:classId', upload.single('file'), smartScanController.uploadDocument);

// Get all materials for a class
router.get('/materials/:classId', smartScanController.getClassMaterials);

// Get AI-generated study path
router.get('/study-path/:classId', smartScanController.getStudyPath);

// Update material organization
router.put('/organization/:classId', smartScanController.updateOrganization);

// Get AI insights for a class
router.get('/insights/:classId', smartScanController.getAIInsights);

module.exports = router; 