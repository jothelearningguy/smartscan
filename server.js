// Import required dependencies
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

/**
 * Middleware Configuration
 * - CORS: Enables Cross-Origin Resource Sharing for frontend requests
 * - express.json(): Parses incoming JSON payloads
 */
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/**
 * Simulated Database
 * This is a temporary in-memory storage solution.
 * In production, replace with a proper database (e.g., MongoDB, PostgreSQL)
 */
let smartCanData = {
  fullness: 75,
  lastEmptied: new Date().toISOString(),
  nextPickup: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  location: 'Building A, Floor 2',
  temperature: 22,
  humidity: 45
};

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/smartscan', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Models
const StudyMaterial = mongoose.model('StudyMaterial', {
  title: String,
  content: String,
  category: String,
  tags: [String],
  scanDate: { type: Date, default: Date.now },
  userId: String,
  type: String, // 'document' or 'object'
  metadata: Object
});

/**
 * API Routes
 */

/**
 * GET /api/smartcan/status
 * Returns the current status of the SmartCan
 * Simulates real-time updates by generating random values within acceptable ranges
 */
app.get('/api/smartcan/status', (req, res) => {
  // Simulate real-time updates with random values
  smartCanData = {
    ...smartCanData,
    fullness: Math.floor(Math.random() * 30) + 50, // Random value between 50-80
    temperature: Math.floor(Math.random() * 5) + 20, // Random value between 20-25
    humidity: Math.floor(Math.random() * 20) + 40, // Random value between 40-60
  };
  
  res.json(smartCanData);
});

/**
 * POST /api/smartcan/update
 * Updates the SmartCan status with new values
 * @param {Object} req.body - The updates to apply to the SmartCan status
 */
app.post('/api/smartcan/update', (req, res) => {
  const updates = req.body;
  smartCanData = { ...smartCanData, ...updates };
  res.json(smartCanData);
});

/**
 * Process scanned document content
 * Analyzes text and categorizes content
 */
app.post('/api/scan/process', async (req, res) => {
  try {
    const { content } = req.body;
    
    // Process content using AI (simplified for example)
    const processedContent = {
      text: content,
      summary: generateSummary(content),
      keywords: extractKeywords(content),
      category: determineCategory(content),
      suggestedTags: generateTags(content)
    };

    // Save to database
    const material = new StudyMaterial({
      title: `Scanned Document ${new Date().toLocaleDateString()}`,
      content: processedContent.text,
      category: processedContent.category,
      tags: processedContent.suggestedTags,
      type: 'document',
      metadata: {
        summary: processedContent.summary,
        keywords: processedContent.keywords
      }
    });

    await material.save();

    res.json(processedContent);
  } catch (err) {
    console.error('Error processing scan:', err);
    res.status(500).json({ error: 'Failed to process scan' });
  }
});

/**
 * Analyze scanned object
 * Uses TensorFlow predictions to identify and categorize objects
 */
app.post('/api/scan/object/analyze', async (req, res) => {
  try {
    const { predictions } = req.body;
    
    // Process object recognition results (simplified for example)
    const analysis = {
      objectType: determineObjectType(predictions),
      relevantTopics: findRelevantTopics(predictions),
      suggestedResources: generateResourceSuggestions(predictions)
    };

    // Save to database
    const material = new StudyMaterial({
      title: `Scanned Object ${new Date().toLocaleDateString()}`,
      category: analysis.objectType,
      type: 'object',
      metadata: {
        analysis: analysis,
        predictions: predictions
      }
    });

    await material.save();

    res.json(analysis);
  } catch (err) {
    console.error('Error analyzing object:', err);
    res.status(500).json({ error: 'Failed to analyze object' });
  }
});

/**
 * Get study materials
 * Retrieves processed and categorized learning materials
 */
app.get('/api/study/materials', async (req, res) => {
  try {
    const materials = await StudyMaterial.find()
      .sort({ scanDate: -1 })
      .limit(20);
    res.json(materials);
  } catch (err) {
    console.error('Error fetching materials:', err);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

/**
 * Share content with study group
 * Broadcasts content to connected group members
 */
app.post('/api/collab/share', (req, res) => {
  try {
    const { content, groupId } = req.body;
    
    // Broadcast to study group
    io.to(groupId).emit('new-shared-content', {
      content,
      timestamp: new Date(),
      type: content.type
    });

    res.json({ message: 'Content shared successfully' });
  } catch (err) {
    console.error('Error sharing content:', err);
    res.status(500).json({ error: 'Failed to share content' });
  }
});

// Helper functions (simplified implementations)
function generateSummary(text) {
  // Implement AI-based text summarization
  return text.substring(0, 200) + '...';
}

function extractKeywords(text) {
  // Implement keyword extraction
  return text.split(' ')
    .filter(word => word.length > 5)
    .slice(0, 5);
}

function determineCategory(text) {
  // Implement content categorization
  const categories = ['Math', 'Science', 'History', 'Literature'];
  return categories[Math.floor(Math.random() * categories.length)];
}

function generateTags(text) {
  // Implement tag generation
  return ['study', 'notes', 'learning'];
}

function determineObjectType(predictions) {
  // Implement object type determination
  return 'Scientific Specimen';
}

function findRelevantTopics(predictions) {
  // Implement relevant topic finding
  return ['Biology', 'Chemistry', 'Lab Work'];
}

function generateResourceSuggestions(predictions) {
  // Implement resource suggestion
  return ['Related Textbook Chapter', 'Video Tutorial', 'Practice Quiz'];
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('join-study-group', (groupId) => {
    socket.join(groupId);
    console.log(`User joined study group: ${groupId}`);
  });

  socket.on('leave-study-group', (groupId) => {
    socket.leave(groupId);
    console.log(`User left study group: ${groupId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

/**
 * Error Handling Middleware
 * Catches and handles any errors that occur during request processing
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

/**
 * Start the server
 * Listens on the specified port and logs the server status
 */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 