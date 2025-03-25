const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  code: String,
  semester: String,
  year: Number,
  instructor: String,
  schedule: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    startTime: String,
    endTime: String,
    location: String
  },
  materials: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScannedMaterial'
  }],
  organization: {
    folders: [{
      name: String,
      description: String,
      materials: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ScannedMaterial'
      }]
    }],
    aiSuggestedStructure: {
      folders: [{
        name: String,
        description: String,
        materials: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ScannedMaterial'
        }]
      }]
    }
  },
  studyTimeline: {
    startDate: Date,
    endDate: Date,
    milestones: [{
      title: String,
      description: String,
      dueDate: Date,
      materials: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ScannedMaterial'
      }]
    }]
  },
  performance: {
    averageScore: Number,
    completedAssignments: Number,
    totalAssignments: Number,
    studyStreak: Number
  },
  aiInsights: {
    recommendedStudyOrder: [{
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
    }]
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
classSchema.index({ userId: 1, name: 1 });
classSchema.index({ 'schedule.days': 1 });
classSchema.index({ 'studyTimeline.milestones.dueDate': 1 });

// Update the updatedAt timestamp before saving
classSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Class', classSchema); 