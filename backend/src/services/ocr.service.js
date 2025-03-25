const logger = require('../utils/logger');

class OCRService {
  async extractTextFromImage(buffer) {
    try {
      // For development, return mock text
      return this.getMockText();
    } catch (error) {
      logger.error('Error extracting text from image:', error);
      throw error;
    }
  }

  getMockText() {
    return `
      Sample text extracted from image.
      This is a mock response for development purposes.
      It simulates text that would be extracted from a scanned document.
      
      Key points:
      1. First important point
      2. Second important point
      3. Third important point
      
      Summary:
      This is a summary of the content that would be extracted from the scanned document.
    `;
  }
}

module.exports = new OCRService(); 