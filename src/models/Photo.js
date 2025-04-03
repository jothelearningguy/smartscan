const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  processedUrl: {
    type: String,
    required: true
  },
  categories: [{
    type: String,
    enum: ['medical', 'document', 'personal', 'food', 'product', 'sensitive'],
    required: true
  }],
  aiAnalysis: {
    labels: [{
      description: String,
      score: Number
    }],
    objects: [{
      name: String,
      score: Number
    }],
    text: String,
    safeSearch: {
      adult: String,
      violence: String,
      racy: String,
      medical: String,
      spoof: String
    }
  },
  metadata: {
    width: Number,
    height: Number,
    format: String,
    size: Number,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'processed', 'analyzing', 'categorized', 'error'],
    default: 'pending'
  },
  error: {
    message: String,
    code: String
  }
}, {
  timestamps: true
});

// Index for faster queries
photoSchema.index({ userId: 1, categories: 1 });
photoSchema.index({ status: 1 });

const Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo; 