const express = require('express');
const multer = require('multer');
const path = require('path');
const PhotoController = require('../controllers/photoController');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Photo routes
router.post('/upload', upload.single('photo'), PhotoController.uploadPhoto);
router.get('/', PhotoController.getPhotos);
router.get('/:id', PhotoController.getPhoto);
router.post('/:id/process', PhotoController.processPhoto);
router.post('/:id/categorize', PhotoController.categorizePhoto);
router.delete('/:id', PhotoController.deletePhoto);

module.exports = router; 