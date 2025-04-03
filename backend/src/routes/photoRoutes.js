const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body, param, query } = require('express-validator');
const PhotoService = require('../services/photoService');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { ImageService } = require('../services/imageService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, JPG, PNG and GIF are allowed.'));
    }
  }
});

// Upload multiple photos with AI enhancement
router.post('/upload', auth, upload.array('photos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const imageService = new ImageService();
    const enhancedPhotos = [];

    for (const file of req.files) {
      const enhancedPhoto = await imageService.enhanceImage(file.path);
      enhancedPhotos.push({
        originalName: file.originalname,
        filename: file.filename,
        path: enhancedPhoto.path,
        thumbnail: enhancedPhoto.thumbnail,
        size: file.size,
        mimetype: file.mimetype
      });
    }

    res.status(200).json({
      message: 'Photos uploaded and enhanced successfully',
      photos: enhancedPhotos
    });
  } catch (error) {
    console.error('Error processing photos:', error);
    res.status(500).json({ message: 'Error processing photos' });
  }
});

// Get all photos for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const imageService = new ImageService();
    const photos = await imageService.getUserPhotos(req.user.id);
    res.json(photos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ message: 'Error fetching photos' });
  }
});

// Delete a photo
router.delete('/:id', auth, async (req, res) => {
  try {
    const imageService = new ImageService();
    await imageService.deletePhoto(req.params.id, req.user.id);
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ message: 'Error deleting photo' });
  }
});

// Get user's photos with pagination
router.get('/',
  auth,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt()
  ],
  validate,
  async (req, res, next) => {
    try {
      const result = await PhotoService.getUserPhotos(
        req.user.id,
        req.query.page || 1,
        req.query.limit || 10
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Get single photo
router.get('/:id',
  auth,
  [param('id').isMongoId()],
  validate,
  async (req, res, next) => {
    try {
      const photo = await PhotoService.getPhoto(req.params.id);
      res.json(photo);
    } catch (error) {
      next(error);
    }
  }
);

// Add annotation to photo
router.post('/:id/annotations',
  auth,
  [
    param('id').isMongoId(),
    body('type').isIn(['text', 'box', 'circle', 'arrow']),
    body('coordinates').isObject(),
    body('coordinates.x').isFloat(),
    body('coordinates.y').isFloat(),
    body('coordinates.width').isFloat(),
    body('coordinates.height').isFloat(),
    body('text').optional().isString(),
    body('color').optional().isString()
  ],
  validate,
  async (req, res, next) => {
    try {
      const photo = await PhotoService.addAnnotation(req.params.id, req.body);
      res.json(photo);
    } catch (error) {
      next(error);
    }
  }
);

// Remove annotation from photo
router.delete('/:id/annotations/:annotationId',
  auth,
  [
    param('id').isMongoId(),
    param('annotationId').isMongoId()
  ],
  validate,
  async (req, res, next) => {
    try {
      const photo = await PhotoService.removeAnnotation(
        req.params.id,
        req.params.annotationId
      );
      res.json(photo);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router; 