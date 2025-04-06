const PhotoService = require('../second-services/photoService');
const logger = require('../second-utils/logger');

class PhotoController {
  static async uploadPhoto(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // TODO: Replace with actual user ID from authentication
      const userId = 'mock-user-id';
      const photo = await PhotoService.uploadPhoto(req.file, userId);
      res.status(201).json(photo);
    } catch (error) {
      next(error);
    }
  }

  static async getPhotos(req, res, next) {
    try {
      // TODO: Replace with actual user ID from authentication
      const userId = 'mock-user-id';
      const photos = await PhotoService.getPhotos(userId, req.query);
      res.json(photos);
    } catch (error) {
      next(error);
    }
  }

  static async getPhoto(req, res, next) {
    try {
      // TODO: Replace with actual user ID from authentication
      const userId = 'mock-user-id';
      const photo = await PhotoService.getPhoto(req.params.id, userId);
      if (!photo) {
        return res.status(404).json({ error: 'Photo not found' });
      }
      res.json(photo);
    } catch (error) {
      next(error);
    }
  }

  static async processPhoto(req, res, next) {
    try {
      // TODO: Replace with actual user ID from authentication
      const userId = 'mock-user-id';
      const photo = await PhotoService.processPhoto(req.params.id, userId);
      if (!photo) {
        return res.status(404).json({ error: 'Photo not found' });
      }
      res.json(photo);
    } catch (error) {
      next(error);
    }
  }

  static async categorizePhoto(req, res, next) {
    try {
      // TODO: Replace with actual user ID from authentication
      const userId = 'mock-user-id';
      const photo = await PhotoService.categorizePhoto(req.params.id, userId);
      if (!photo) {
        return res.status(404).json({ error: 'Photo not found' });
      }
      res.json(photo);
    } catch (error) {
      next(error);
    }
  }

  static async deletePhoto(req, res, next) {
    try {
      // TODO: Replace with actual user ID from authentication
      const userId = 'mock-user-id';
      const photo = await PhotoService.deletePhoto(req.params.id, userId);
      if (!photo) {
        return res.status(404).json({ error: 'Photo not found' });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PhotoController; 