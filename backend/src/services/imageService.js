const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

class ImageService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.ensureUploadDir();
  }

  async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async enhanceImage(imageBuffer) {
    try {
      const enhancedImage = await sharp(imageBuffer)
        .resize(1200, null, { // Resize to max width of 1200px, maintain aspect ratio
          withoutEnlargement: true,
          fit: 'inside'
        })
        .sharpen() // Enhance image sharpness
        .normalize() // Normalize colors
        .modulate({ brightness: 1.1, saturation: 1.1 }) // Slightly enhance brightness and saturation
        .toBuffer();
      return enhancedImage;
    } catch (error) {
      console.error('Error enhancing image:', error);
      throw error;
    }
  }

  async createThumbnail(imageBuffer) {
    try {
      const thumbnail = await sharp(imageBuffer)
        .resize(200, 200, {
          fit: 'cover',
          position: 'center'
        })
        .toBuffer();
      return thumbnail;
    } catch (error) {
      console.error('Error creating thumbnail:', error);
      throw error;
    }
  }

  async saveImage(imageBuffer, filename) {
    try {
      const uniqueFilename = `${uuidv4()}-${filename}`;
      const filePath = path.join(this.uploadDir, uniqueFilename);
      await fs.writeFile(filePath, imageBuffer);
      return uniqueFilename;
    } catch (error) {
      console.error('Error saving image:', error);
      throw error;
    }
  }

  async deleteImage(filename) {
    try {
      const filePath = path.join(this.uploadDir, filename);
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
}

module.exports = ImageService; 