const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ImageService = require('../services/imageService');
const auth = require('../middleware/auth');

// Initialize image service
const imageService = new ImageService();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
    }
  },
});

// Upload and process image
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Process and save the image
    const enhancedImage = await imageService.enhanceImage(req.file.buffer);
    const thumbnail = await imageService.createThumbnail(req.file.buffer);
    const savedImage = await imageService.saveImage(enhancedImage, req.file.originalname);
    const savedThumbnail = await imageService.saveImage(thumbnail, `thumb_${req.file.originalname}`);

    res.json({
      success: true,
      image: savedImage,
      thumbnail: savedThumbnail
    });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Error processing image' });
  }
});

// Get image by filename
router.get('/:filename', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../../uploads', req.params.filename);
    res.sendFile(filePath);
  } catch (error) {
    res.status(404).json({ error: 'Image not found' });
  }
});

// Delete image
router.delete('/:filename', auth, async (req, res) => {
  try {
    await imageService.deleteImage(req.params.filename);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router; 