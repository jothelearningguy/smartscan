const fs = require('fs');
const path = require('path');

const setupUploadsDirectory = () => {
  const uploadsDir = path.join(__dirname, '../uploads');
  
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('Created uploads directory');
    }
    
    // Ensure directory is writable
    fs.accessSync(uploadsDir, fs.constants.W_OK);
    console.log('Uploads directory is writable');
    
    return true;
  } catch (error) {
    console.error('Error setting up uploads directory:', error);
    return false;
  }
};

module.exports = { setupUploadsDirectory }; 