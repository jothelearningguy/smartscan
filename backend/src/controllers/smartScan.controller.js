const ScannedMaterial = require('../models/scannedMaterial.model');
const Class = require('../models/class.model');
const StudySession = require('../models/studySession.model');
const { processDocument } = require('../services/ai.service');
const { uploadToStorage } = require('../services/storage.service');
const { extractTextFromImage } = require('../services/ocr.service');

const smartScanController = {
  // Upload and process a new document
  async uploadDocument(req, res, next) {
    try {
      const { classId } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Upload file to storage
      const fileUrl = await uploadToStorage(file);

      // Extract text using OCR
      const ocrText = await extractTextFromImage(file.buffer);

      // Process document with AI
      const aiAnalysis = await processDocument(ocrText);

      // Create new scanned material
      const material = new ScannedMaterial({
        userId: req.user._id,
        classId,
        title: file.originalname,
        type: file.mimetype,
        fileUrl,
        ocrText,
        keyPoints: aiAnalysis.keyPoints,
        summary: aiAnalysis.summary,
        flashcards: aiAnalysis.flashcards,
        relatedResources: aiAnalysis.relatedResources,
        organization: aiAnalysis.organization,
        metadata: {
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype
        }
      });

      await material.save();

      // Update class with new material
      await Class.findByIdAndUpdate(classId, {
        $push: { materials: material._id }
      });

      // Update AI insights for the class
      await updateClassAIInsights(classId);

      res.status(201).json({
        message: 'Document processed successfully',
        material
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all materials for a class
  async getClassMaterials(req, res, next) {
    try {
      const { classId } = req.params;
      const materials = await ScannedMaterial.find({ classId })
        .sort({ createdAt: -1 });

      res.json(materials);
    } catch (error) {
      next(error);
    }
  },

  // Get AI-generated study path
  async getStudyPath(req, res, next) {
    try {
      const { classId } = req.params;
      const classData = await Class.findById(classId)
        .populate('materials')
        .select('aiInsights studyTimeline');

      res.json({
        recommendedOrder: classData.aiInsights.recommendedStudyOrder,
        timeline: classData.studyTimeline
      });
    } catch (error) {
      next(error);
    }
  },

  // Update material organization
  async updateOrganization(req, res, next) {
    try {
      const { classId } = req.params;
      const { organization } = req.body;

      const updatedClass = await Class.findByIdAndUpdate(
        classId,
        { 'organization.folders': organization.folders },
        { new: true }
      );

      res.json(updatedClass.organization);
    } catch (error) {
      next(error);
    }
  },

  // Get AI insights for a class
  async getAIInsights(req, res, next) {
    try {
      const { classId } = req.params;
      const classData = await Class.findById(classId)
        .populate('materials')
        .select('aiInsights');

      res.json(classData.aiInsights);
    } catch (error) {
      next(error);
    }
  },

  // Flashcard methods
  async getClassFlashcards(req, res, next) {
    try {
      const { classId } = req.params;
      const materials = await ScannedMaterial.find({ classId })
        .select('flashcards title type');
      
      const flashcards = materials.reduce((acc, material) => {
        material.flashcards.forEach(card => {
          acc.push({
            ...card.toObject(),
            materialId: material._id,
            materialTitle: material.title,
            materialType: material.type
          });
        });
        return acc;
      }, []);

      res.json(flashcards);
    } catch (error) {
      next(error);
    }
  },

  async getMaterialFlashcards(req, res, next) {
    try {
      const { materialId } = req.params;
      const material = await ScannedMaterial.findById(materialId)
        .select('flashcards title');
      
      if (!material) {
        return res.status(404).json({ message: 'Material not found' });
      }

      res.json(material.flashcards);
    } catch (error) {
      next(error);
    }
  },

  async generateFlashcards(req, res, next) {
    try {
      const { materialId } = req.params;
      const material = await ScannedMaterial.findById(materialId);
      
      if (!material) {
        return res.status(404).json({ message: 'Material not found' });
      }

      // Generate flashcards using AI
      const flashcards = await processDocument(material.ocrText, { type: 'flashcards' });
      
      material.flashcards = flashcards;
      await material.save();

      res.json(flashcards);
    } catch (error) {
      next(error);
    }
  },

  // Study session methods
  async startStudySession(req, res, next) {
    try {
      const { classId, materials } = req.body;
      
      const session = new StudySession({
        userId: req.user._id,
        classId,
        materials: materials.map(m => ({
          materialId: m.materialId,
          timeSpent: 0,
          completed: false
        })),
        startTime: new Date()
      });

      await session.save();
      res.status(201).json(session);
    } catch (error) {
      next(error);
    }
  },

  async updateStudySession(req, res, next) {
    try {
      const { sessionId } = req.params;
      const updates = req.body;

      const session = await StudySession.findById(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Study session not found' });
      }

      // Update session details
      Object.assign(session, updates);
      session.endTime = new Date();
      session.duration = (session.endTime - session.startTime) / (1000 * 60); // in minutes

      await session.save();
      res.json(session);
    } catch (error) {
      next(error);
    }
  },

  async getStudySessions(req, res, next) {
    try {
      const { classId } = req.params;
      const sessions = await StudySession.find({ classId })
        .sort({ startTime: -1 })
        .populate('materials.materialId');

      res.json(sessions);
    } catch (error) {
      next(error);
    }
  },

  async getStudyStats(req, res, next) {
    try {
      const { classId } = req.params;
      const sessions = await StudySession.find({ classId });

      const stats = {
        totalSessions: sessions.length,
        totalTime: sessions.reduce((acc, session) => acc + (session.duration || 0), 0),
        averageFocusScore: sessions.reduce((acc, session) => acc + (session.focusScore || 0), 0) / sessions.length,
        topics: {},
        performance: {
          flashcardsCompleted: 0,
          correctAnswers: 0,
          totalQuestions: 0
        }
      };

      // Calculate topic statistics
      sessions.forEach(session => {
        session.topics.forEach(topic => {
          if (!stats.topics[topic.name]) {
            stats.topics[topic.name] = {
              timeSpent: 0,
              averageConfidence: 0,
              sessions: 0
            };
          }
          stats.topics[topic.name].timeSpent += topic.timeSpent;
          stats.topics[topic.name].averageConfidence += topic.confidence;
          stats.topics[topic.name].sessions += 1;
        });

        // Update performance stats
        if (session.performance) {
          stats.performance.flashcardsCompleted += session.performance.flashcardsCompleted || 0;
          stats.performance.correctAnswers += session.performance.correctAnswers || 0;
          stats.performance.totalQuestions += session.performance.totalQuestions || 0;
        }
      });

      // Calculate averages for topics
      Object.keys(stats.topics).forEach(topic => {
        stats.topics[topic].averageConfidence /= stats.topics[topic].sessions;
      });

      res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  // Material organization methods
  async getOrganizedMaterials(req, res, next) {
    try {
      const { classId } = req.params;
      const classData = await Class.findById(classId)
        .populate('materials')
        .select('organization materials');

      res.json({
        folders: classData.organization.folders,
        aiSuggestedStructure: classData.organization.aiSuggestedStructure,
        materials: classData.materials
      });
    } catch (error) {
      next(error);
    }
  },

  async organizeMaterials(req, res, next) {
    try {
      const { classId } = req.params;
      const classData = await Class.findById(classId)
        .populate('materials');

      // Use AI to analyze and organize materials
      const organization = await processDocument(
        classData.materials.map(m => m.ocrText).join('\n'),
        { type: 'organization' }
      );

      classData.organization.aiSuggestedStructure = organization;
      await classData.save();

      res.json(classData.organization);
    } catch (error) {
      next(error);
    }
  },

  async updateMaterialTags(req, res, next) {
    try {
      const { materialId } = req.params;
      const { tags } = req.body;

      const material = await ScannedMaterial.findByIdAndUpdate(
        materialId,
        { 'organization.customTags': tags },
        { new: true }
      );

      res.json(material.organization);
    } catch (error) {
      next(error);
    }
  },

  async searchMaterials(req, res, next) {
    try {
      const { classId } = req.params;
      const { query, tags } = req.query;

      const searchCriteria = { classId };
      
      if (query) {
        searchCriteria.$or = [
          { title: { $regex: query, $options: 'i' } },
          { ocrText: { $regex: query, $options: 'i' } }
        ];
      }

      if (tags) {
        searchCriteria['organization.tags'] = { $in: tags.split(',') };
      }

      const materials = await ScannedMaterial.find(searchCriteria);
      res.json(materials);
    } catch (error) {
      next(error);
    }
  },

  // Study path and recommendations
  async getStudyRecommendations(req, res, next) {
    try {
      const { classId } = req.params;
      const classData = await Class.findById(classId)
        .populate('materials')
        .select('aiInsights performance');

      const recommendations = {
        focusAreas: classData.aiInsights.focusAreas,
        suggestedOrder: classData.aiInsights.recommendedStudyOrder,
        performance: classData.performance
      };

      res.json(recommendations);
    } catch (error) {
      next(error);
    }
  },

  async generateStudyPath(req, res, next) {
    try {
      const { classId } = req.params;
      const classData = await Class.findById(classId)
        .populate('materials');

      // Generate study path using AI
      const studyPath = await processDocument(
        classData.materials.map(m => m.ocrText).join('\n'),
        { type: 'studyPath' }
      );

      classData.aiInsights.recommendedStudyOrder = studyPath;
      await classData.save();

      res.json(studyPath);
    } catch (error) {
      next(error);
    }
  },

  async customizeStudyPath(req, res, next) {
    try {
      const { classId } = req.params;
      const { customOrder } = req.body;

      const classData = await Class.findByIdAndUpdate(
        classId,
        { 'aiInsights.recommendedStudyOrder': customOrder },
        { new: true }
      );

      res.json(classData.aiInsights.recommendedStudyOrder);
    } catch (error) {
      next(error);
    }
  }
};

// Helper function to update AI insights for a class
async function updateClassAIInsights(classId) {
  const classData = await Class.findById(classId)
    .populate('materials');

  // Analyze materials and generate insights
  const materials = classData.materials;
  const recommendedOrder = materials.map((material, index) => ({
    materialId: material._id,
    order: index + 1,
    reason: `Based on content analysis and learning progression`
  }));

  const focusAreas = materials.reduce((acc, material) => {
    const topics = material.keyPoints.map(point => point.topic);
    topics.forEach(topic => {
      const existing = acc.find(area => area.topic === topic);
      if (existing) {
        existing.priority += 1;
        existing.suggestedResources.push(material._id);
      } else {
        acc.push({
          topic,
          priority: 1,
          suggestedResources: [material._id]
        });
      }
    });
    return acc;
  }, []);

  // Update class with new insights
  await Class.findByIdAndUpdate(classId, {
    'aiInsights.recommendedStudyOrder': recommendedOrder,
    'aiInsights.focusAreas': focusAreas
  });
}

module.exports = smartScanController; 