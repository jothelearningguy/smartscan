const mongoose = require('mongoose');

const studyPathSchema = new mongoose.Schema({
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
  description: String,
  timeline: [{
    date: Date,
    sessions: [{
      title: String,
      description: String,
      duration: Number, // in minutes
      materials: [{
        materialId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ScannedMaterial'
        },
        type: {
          type: String,
          enum: ['reading', 'flashcards', 'practice', 'review', 'summary']
        },
        order: Number
      }],
      status: {
        type: String,
        enum: ['scheduled', 'in_progress', 'completed'],
        default: 'scheduled'
      },
      notes: String,
      aiSuggestions: {
        focusAreas: [String],
        relatedResources: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ScannedMaterial'
        }],
        practiceQuestions: [{
          question: String,
          answer: String,
          explanation: String
        }]
      }
    }]
  }],
  learningObjectives: [{
    title: String,
    description: String,
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started'
    },
    materials: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ScannedMaterial'
    }]
  }],
  progress: {
    totalSessions: Number,
    completedSessions: Number,
    totalTime: Number,
    averageFocusScore: Number,
    topics: [{
      name: String,
      mastery: Number,
      timeSpent: Number
    }]
  },
  aiInsights: {
    recommendedOrder: [{
      materialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ScannedMaterial'
      },
      order: Number,
      reason: String
    }],
    focusAreas: [{
      topic: String,
      priority: Number,
      suggestedResources: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ScannedMaterial'
      }]
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
studyPathSchema.index({ userId: 1, classId: 1 });
studyPathSchema.index({ 'timeline.date': 1 });
studyPathSchema.index({ 'learningObjectives.status': 1 });

// Update the updatedAt timestamp before saving
studyPathSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('StudyPath', studyPathSchema); 