const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const AIService = require('./aiService');
const Photo = require('../models/Photo');
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
      const originalPath = path.join(uploadsDir, originalFilename);
      const processedPath = path.join(uploadsDir, processedFilename);

      // Save original file
      await fs.writeFile(originalPath, file.buffer);

      // Get image metadata
      const metadata = await sharp(file.buffer).metadata();
      const fileStats = await fs.stat(originalPath);

      // Create photo document
      const photo = new Photo({
        userId,
        originalUrl: `/uploads/${originalFilename}`,
        processedUrl: `/uploads/${processedFilename}`,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: fileStats.size
        }
      });

      await photo.save();

      // Process photo asynchronously
      this.processPhoto(photo._id).catch(error => {
        logger.error('Error processing photo:', error);
        Photo.findByIdAndUpdate(photo._id, {
          status: 'error',
          error: {
            message: error.message,
            code: error.code || 'PROCESSING_ERROR'
          }
        }).catch(err => logger.error('Error updating photo status:', err));
      });

      return photo;
    } catch (error) {
      logger.error('Error uploading photo:', error);
      throw new Error('Failed to upload photo');
    }
  }

  static async processPhoto(photoId) {
    try {
      const photo = await Photo.findById(photoId);
      if (!photo) {
        throw new Error('Photo not found');
      }

      // Update status to processing
      photo.status = 'processing';
      await photo.save();

      // Read original file
      const originalPath = path.join(__dirname, '../../', photo.originalUrl);
      const imageBuffer = await fs.readFile(originalPath);

      // Process image with sharp
      const processedBuffer = await sharp(imageBuffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Save processed file
      const processedPath = path.join(__dirname, '../../', photo.processedUrl);
      await fs.writeFile(processedPath, processedBuffer);

      // Update status to processed
      photo.status = 'processed';
      await photo.save();

      return photo;
    } catch (error) {
      logger.error('Error processing photo:', error);
      throw new Error('Failed to process photo');
    }
  }

  static async categorizePhoto(photoId) {
    try {
      const photo = await Photo.findById(photoId);
      if (!photo) {
        throw new Error('Photo not found');
      }

      // Update status to analyzing
      photo.status = 'analyzing';
      await photo.save();

      // Analyze image with AI
      const aiResults = await AIService.analyzeImage(photo.processedUrl);
      
      // Update photo with AI results
      photo.categories = AIService.processResults(
        aiResults.labels,
        aiResults.objects,
        aiResults.text,
        aiResults.safeSearch
      );
      photo.aiAnalysis = {
        labels: aiResults.labels,
        objects: aiResults.objects,
        text: aiResults.text,
        safeSearch: aiResults.safeSearch
      };
      photo.status = 'categorized';
      await photo.save();

      return photo;
    } catch (error) {
      logger.error('Error categorizing photo:', error);
      throw new Error('Failed to categorize photo');
    }
  }

  static async getPhotos(userId, filters = {}) {
    try {
      const query = { userId };
      
      // Apply filters
      if (filters.category) {
        query.categories = filters.category;
      }
      if (filters.status) {
        query.status = filters.status;
      }

      const photos = await Photo.find(query).sort({ createdAt: -1 });
      return photos;
    } catch (error) {
      logger.error('Error getting photos:', error);
      throw new Error('Failed to get photos');
    }
  }

  static async getPhoto(photoId, userId) {
    try {
      const photo = await Photo.findOne({ _id: photoId, userId });
      return photo;
    } catch (error) {
      logger.error('Error getting photo:', error);
      throw new Error('Failed to get photo');
    }
  }

  static async deletePhoto(photoId, userId) {
    try {
      const photo = await Photo.findOne({ _id: photoId, userId });
      if (!photo) {
        return null;
      }

      // Delete files
      const originalPath = path.join(__dirname, '../../', photo.originalUrl);
      const processedPath = path.join(__dirname, '../../', photo.processedUrl);
      
      await Promise.all([
        fs.unlink(originalPath).catch(err => logger.error('Error deleting original file:', err)),
        fs.unlink(processedPath).catch(err => logger.error('Error deleting processed file:', err))
      ]);

      // Delete from database
      await photo.deleteOne();
      return photo;
    } catch (error) {
      logger.error('Error deleting photo:', error);
      throw new Error('Failed to delete photo');
    }
  }
}

module.exports = PhotoService; 