const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class StorageService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
  }

  async uploadToStorage(file) {
    try {
      // Create uploads directory if it doesn't exist
      await fs.mkdir(this.uploadDir, { recursive: true });

      // Generate unique filename
      const filename = `${Date.now()}-${file.originalname}`;
      const filepath = path.join(this.uploadDir, filename);

      // Save file
      await fs.writeFile(filepath, file.buffer);

      // Return file URL
      return `/uploads/${filename}`;
    } catch (error) {
      logger.error('Error uploading file:', error);
      throw error;
    }
  }

  async deleteFromStorage(fileUrl) {
    try {
      const filename = path.basename(fileUrl);
      const filepath = path.join(this.uploadDir, filename);

      await fs.unlink(filepath);
    } catch (error) {
      logger.error('Error deleting file:', error);
      throw error;
    }
  }
}

module.exports = new StorageService(); 