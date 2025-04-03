const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const Photo = require('../models/Photo');
const AIService = require('./aiService');
const logger = require('../utils/logger');

class PhotoService {
  static async uploadPhoto(file, userId) {
    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../../uploads');
      await fs.mkdir(uploadsDir, { recursive: true });

      // Generate unique filename
      const timestamp = Date.now();
      const originalFilename = `${timestamp}-${file.originalname}`;
      const processedFilename = `${timestamp}-processed-${file.originalname}`;

      // Save original file
      const originalPath = path.join(uploadsDir, originalFilename);
      await fs.writeFile(originalPath, file.buffer);

      // Get image metadata
      const metadata = await sharp(file.buffer).metadata();

      // Create photo document
      const photo = new Photo({
        userId,
        originalUrl: `/uploads/${originalFilename}`,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          size: file.size,
          format: metadata.format
        }
      });

      await photo.save();

      // Process image in background
      this.processPhoto(photo._id);

      return photo;
    } catch (error) {
      logger.error('Error uploading photo:', error);
      throw new Error('Failed to upload photo');
    }
  }

  static async processPhoto(photoId) {
    try {
      const photo = await Photo.findById(photoId);
      if (!photo) throw new Error('Photo not found');

      // Read original file
      const originalPath = path.join(__dirname, '../../', photo.originalUrl);
      const buffer = await fs.readFile(originalPath);

      // Process image with Sharp
      const processedBuffer = await sharp(buffer)
        .resize(1200, null, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Save processed file
      const processedPath = path.join(__dirname, '../../', photo.originalUrl.replace('-', '-processed-'));
      await fs.writeFile(processedPath, processedBuffer);

      // Update photo with processed URL
      photo.processedUrl = photo.originalUrl.replace('-', '-processed-');
      photo.status = 'ready';
      await photo.save();

      // Trigger AI categorization
      await this.categorizePhoto(photoId);

    } catch (error) {
      logger.error('Error processing photo:', error);
      await Photo.findByIdAndUpdate(photoId, {
        status: 'error',
        error: error.message
      });
    }
  }

  static async categorizePhoto(photoId) {
    try {
      const photo = await Photo.findById(photoId);
      if (!photo) throw new Error('Photo not found');

      // Analyze image with mock AI service
      const analysis = await AIService.analyzeImage(photo.originalUrl);

      // Update photo with categories and analysis results
      photo.categories = analysis.categories;
      photo.aiAnalysis = {
        labels: analysis.labels,
        objects: analysis.objects,
        text: analysis.text,
        safeSearch: analysis.safeSearch
      };

      await photo.save();
      logger.info(`Photo ${photoId} categorized successfully`);
    } catch (error) {
      logger.error('Error categorizing photo:', error);
      throw error;
    }
  }

  static async addAnnotation(photoId, annotation) {
    try {
      const photo = await Photo.findById(photoId);
      if (!photo) throw new Error('Photo not found');

      await photo.addAnnotation(annotation);
      return photo;
    } catch (error) {
      logger.error('Error adding annotation:', error);
      throw error;
    }
  }

  static async removeAnnotation(photoId, annotationId) {
    try {
      const photo = await Photo.findById(photoId);
      if (!photo) throw new Error('Photo not found');

      await photo.removeAnnotation(annotationId);
      return photo;
    } catch (error) {
      logger.error('Error removing annotation:', error);
      throw error;
    }
  }

  static async getPhoto(photoId) {
    try {
      const photo = await Photo.findById(photoId);
      if (!photo) throw new Error('Photo not found');
      return photo;
    } catch (error) {
      logger.error('Error getting photo:', error);
      throw error;
    }
  }

  static async getUserPhotos(userId, page = 1, limit = 10) {
    try {
      const photos = await Photo.find({ userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      
      const total = await Photo.countDocuments({ userId });
      
      return {
        photos,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error getting user photos:', error);
      throw error;
    }
  }
}

module.exports = PhotoService; 