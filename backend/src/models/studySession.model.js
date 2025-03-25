const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
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
  materials: [{
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ScannedMaterial'
    },
    timeSpent: Number, // in minutes
    completed: Boolean,
    notes: String
  }],
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  duration: Number, // in minutes
  focusScore: {
    type: Number,
    min: 0,
    max: 100
  },
  topics: [{
    name: String,
    timeSpent: Number,
    confidence: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  activities: [{
    type: {
      type: String,
      enum: ['reading', 'flashcards', 'practice', 'review', 'summary']
    },
    duration: Number,
    materials: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ScannedMaterial'
    }]
  }],
  performance: {
    flashcardsCompleted: Number,
    correctAnswers: Number,
    totalQuestions: Number,
    accuracy: Number
  },
  notes: String,
  aiInsights: {
    suggestedNextSteps: [{
      type: String,
      priority: Number
    }],
    focusAreas: [{
      topic: String,
      priority: Number,
      reason: String
    }],
    studyEfficiency: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
studySessionSchema.index({ userId: 1, classId: 1 });
studySessionSchema.index({ startTime: 1 });
studySessionSchema.index({ 'topics.name': 1 });

// Update the updatedAt timestamp before saving
studySessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('StudySession', studySessionSchema); 