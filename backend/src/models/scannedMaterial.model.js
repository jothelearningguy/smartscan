const mongoose = require('mongoose');

const scannedMaterialSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['notes', 'textbook', 'slides', 'pdf'],
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  originalFileName: String,
  fileSize: Number,
  mimeType: String,
  ocrText: String,
  keyPoints: [{
    text: String,
    importance: {
      type: Number,
      min: 1,
      max: 5
    },
    tags: [String]
  }],
  summary: {
    short: String,
    detailed: String,
    mainTopics: [String]
  },
  flashcards: [{
    question: String,
    answer: String,
    tags: [String],
    difficulty: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  relatedResources: [{
    title: String,
    type: String,
    url: String,
    relevance: Number,
    description: String
  }],
  organization: {
    folder: String,
    tags: [String],
    aiSuggestedTags: [String],
    customTags: [String]
  },
  metadata: {
    scannedDate: {
      type: Date,
      default: Date.now
    },
    lastAccessed: Date,
    accessCount: {
      type: Number,
      default: 0
    }
  },
  aiInsights: {
    difficultyLevel: Number,
    estimatedStudyTime: Number,
    prerequisites: [String],
    recommendedOrder: Number,
    learningObjectives: [String]
  }
});

// Indexes for better query performance
scannedMaterialSchema.index({ userId: 1, classId: 1 });
scannedMaterialSchema.index({ 'organization.tags': 1 });
scannedMaterialSchema.index({ 'keyPoints.tags': 1 });
scannedMaterialSchema.index({ 'metadata.scannedDate': 1 });

module.exports = mongoose.model('ScannedMaterial', scannedMaterialSchema); 