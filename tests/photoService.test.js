const PhotoService = require('../src/services/photoService');
const mongoose = require('mongoose');

describe('PhotoService', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect('mongodb://127.0.0.1:27017/smartscan-test');
  });

  afterAll(async () => {
    // Clean up and disconnect
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('uploadPhoto', () => {
    it('should upload a photo successfully', async () => {
      const mockFile = {
        buffer: Buffer.from('test-image'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg'
      };

      const userId = 'test-user-id';
      const result = await PhotoService.uploadPhoto(mockFile, userId);

      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.originalUrl).toBeDefined();
      expect(result.processedUrl).toBeDefined();
    });
  });

  describe('getPhotos', () => {
    it('should return photos for a user', async () => {
      const userId = 'test-user-id';
      const photos = await PhotoService.getPhotos(userId);

      expect(Array.isArray(photos)).toBe(true);
    });
  });

  describe('getPhoto', () => {
    it('should return a specific photo', async () => {
      const userId = 'test-user-id';
      const photoId = 'test-photo-id'; // You'll need to create this first
      const photo = await PhotoService.getPhoto(photoId, userId);

      expect(photo).toBeDefined();
      expect(photo.userId).toBe(userId);
    });
  });

  describe('deletePhoto', () => {
    it('should delete a photo', async () => {
      const userId = 'test-user-id';
      const photoId = 'test-photo-id'; // You'll need to create this first
      const result = await PhotoService.deletePhoto(photoId, userId);

      expect(result).toBe(true);
    });
  });
}); 