const StudyPath = require('../models/studyPath.model');
const ScannedMaterial = require('../models/scannedMaterial.model');
const { processDocument } = require('../services/ai.service');
const logger = require('../utils/logger');

const studyPathController = {
  // Create a new study path
  async createStudyPath(req, res, next) {
    try {
      const { classId, title, description } = req.body;
      
      // Get class materials
      const materials = await ScannedMaterial.find({ classId });
      
      // Generate AI insights for the study path
      const aiAnalysis = await processDocument(
        materials.map(m => m.ocrText).join('\n'),
        { type: 'studyPath' }
      );

      const studyPath = new StudyPath({
        userId: req.user._id,
        classId,
        title,
        description,
        aiInsights: aiAnalysis,
        progress: {
          totalSessions: 0,
          completedSessions: 0,
          totalTime: 0,
          averageFocusScore: 0,
          topics: []
        }
      });

      await studyPath.save();
      res.status(201).json(studyPath);
    } catch (error) {
      next(error);
    }
  },

  // Get all study paths for a class
  async getClassStudyPaths(req, res, next) {
    try {
      const { classId } = req.params;
      const studyPaths = await StudyPath.find({ classId })
        .populate('timeline.sessions.materials.materialId')
        .sort({ createdAt: -1 });

      res.json(studyPaths);
    } catch (error) {
      next(error);
    }
  },

  // Get a specific study path
  async getStudyPath(req, res, next) {
    try {
      const { pathId } = req.params;
      const studyPath = await StudyPath.findById(pathId)
        .populate('timeline.sessions.materials.materialId')
        .populate('learningObjectives.materials')
        .populate('aiInsights.recommendedOrder.materialId')
        .populate('aiInsights.focusAreas.suggestedResources');

      if (!studyPath) {
        return res.status(404).json({ message: 'Study path not found' });
      }

      res.json(studyPath);
    } catch (error) {
      next(error);
    }
  },

  // Update study path timeline
  async updateTimeline(req, res, next) {
    try {
      const { pathId } = req.params;
      const { timeline } = req.body;

      const studyPath = await StudyPath.findById(pathId);
      if (!studyPath) {
        return res.status(404).json({ message: 'Study path not found' });
      }

      studyPath.timeline = timeline;
      await studyPath.save();

      res.json(studyPath.timeline);
    } catch (error) {
      next(error);
    }
  },

  // Add a new session to the timeline
  async addSession(req, res, next) {
    try {
      const { pathId } = req.params;
      const { date, session } = req.body;

      const studyPath = await StudyPath.findById(pathId);
      if (!studyPath) {
        return res.status(404).json({ message: 'Study path not found' });
      }

      // Find or create timeline entry for the date
      let timelineEntry = studyPath.timeline.find(entry => 
        entry.date.toDateString() === new Date(date).toDateString()
      );

      if (!timelineEntry) {
        timelineEntry = { date: new Date(date), sessions: [] };
        studyPath.timeline.push(timelineEntry);
      }

      // Add the new session
      timelineEntry.sessions.push(session);

      // Update progress
      studyPath.progress.totalSessions += 1;

      await studyPath.save();
      res.json(timelineEntry);
    } catch (error) {
      next(error);
    }
  },

  // Update session status
  async updateSessionStatus(req, res, next) {
    try {
      const { pathId, sessionId } = req.params;
      const { status } = req.body;

      const studyPath = await StudyPath.findById(pathId);
      if (!studyPath) {
        return res.status(404).json({ message: 'Study path not found' });
      }

      // Find and update the session
      for (const entry of studyPath.timeline) {
        const session = entry.sessions.id(sessionId);
        if (session) {
          session.status = status;
          if (status === 'completed') {
            studyPath.progress.completedSessions += 1;
          }
          break;
        }
      }

      await studyPath.save();
      res.json(studyPath.progress);
    } catch (error) {
      next(error);
    }
  },

  // Get AI suggestions for a session
  async getSessionSuggestions(req, res, next) {
    try {
      const { pathId, sessionId } = req.params;
      const studyPath = await StudyPath.findById(pathId)
        .populate('timeline.sessions.materials.materialId');

      if (!studyPath) {
        return res.status(404).json({ message: 'Study path not found' });
      }

      // Find the session
      let targetSession;
      for (const entry of studyPath.timeline) {
        const session = entry.sessions.id(sessionId);
        if (session) {
          targetSession = session;
          break;
        }
      }

      if (!targetSession) {
        return res.status(404).json({ message: 'Session not found' });
      }

      // Generate AI suggestions based on session materials
      const materials = targetSession.materials.map(m => m.materialId);
      const suggestions = await processDocument(
        materials.map(m => m.ocrText).join('\n'),
        { type: 'sessionSuggestions' }
      );

      targetSession.aiSuggestions = suggestions;
      await studyPath.save();

      res.json(suggestions);
    } catch (error) {
      next(error);
    }
  },

  // Update learning objectives
  async updateObjectives(req, res, next) {
    try {
      const { pathId } = req.params;
      const { learningObjectives } = req.body;

      const studyPath = await StudyPath.findById(pathId);
      if (!studyPath) {
        return res.status(404).json({ message: 'Study path not found' });
      }

      studyPath.learningObjectives = learningObjectives;
      await studyPath.save();

      res.json(studyPath.learningObjectives);
    } catch (error) {
      next(error);
    }
  },

  // Get study path progress
  async getProgress(req, res, next) {
    try {
      const { pathId } = req.params;
      const studyPath = await StudyPath.findById(pathId)
        .populate('timeline.sessions.materials.materialId');

      if (!studyPath) {
        return res.status(404).json({ message: 'Study path not found' });
      }

      // Calculate progress metrics
      const progress = {
        totalSessions: studyPath.progress.totalSessions,
        completedSessions: studyPath.progress.completedSessions,
        totalTime: studyPath.progress.totalTime,
        averageFocusScore: studyPath.progress.averageFocusScore,
        topics: studyPath.progress.topics,
        completionRate: (studyPath.progress.completedSessions / studyPath.progress.totalSessions) * 100
      };

      res.json(progress);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = studyPathController; 