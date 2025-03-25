const { createWorker } = require('tesseract.js');
const aiService = require('../services/ai.service');
const { logger } = require('../utils/logger');
const StudySession = require('../models/studySession.model');

class ScanController {
  async scanDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No document file provided' });
      }

      // Initialize Tesseract worker
      const worker = await createWorker();
      
      // Perform OCR on the document
      const { data: { text } } = await worker.recognize(req.file.path);
      await worker.terminate();

      // Process the scanned text
      const processedData = await this.processScannedText(text);

      // Generate study plan using AI
      const studyPlan = await aiService.generateStudyPlan(req.user.id, processedData);

      // Create study sessions
      await this.createStudySessions(req.user.id, studyPlan);

      res.json({
        success: true,
        message: 'Document scanned and study plan generated successfully',
        studyPlan
      });
    } catch (error) {
      logger.error('Error scanning document:', error);
      res.status(500).json({ error: 'Failed to process document' });
    }
  }

  async processScannedText(text) {
    try {
      // Use OpenAI to analyze and structure the scanned text
      const prompt = `Analyze the following scanned text and extract:
        1. Main topics and subtopics
        2. Key concepts and definitions
        3. Important dates or deadlines
        4. Required actions or tasks
        5. Difficulty level of the content
        
        Text: ${text}`;

      const response = await aiService.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logger.error('Error processing scanned text:', error);
      throw error;
    }
  }

  async createStudySessions(userId, studyPlan) {
    try {
      // Clear existing study sessions for this material
      await StudySession.deleteMany({
        userId,
        'materials.type': 'scanned'
      });

      // Create new study sessions
      const sessions = studyPlan.sessions.map(session => ({
        userId,
        ...session,
        status: 'scheduled',
        materials: [{
          type: 'scanned',
          title: session.title,
          notes: session.description
        }]
      }));

      await StudySession.insertMany(sessions);
      logger.info(`Created ${sessions.length} study sessions for user ${userId}`);
    } catch (error) {
      logger.error('Error creating study sessions:', error);
      throw error;
    }
  }

  async updateStudyProgress(req, res) {
    try {
      const { sessionId, performance } = req.body;

      // Update session performance
      const session = await StudySession.findByIdAndUpdate(
        sessionId,
        { 'performance': performance },
        { new: true }
      );

      if (!session) {
        return res.status(404).json({ error: 'Study session not found' });
      }

      // Get user's overall performance data
      const userSessions = await StudySession.find({ userId: req.user.id });
      const performanceData = this.calculatePerformanceMetrics(userSessions);

      // Adjust study plan based on performance
      const adjustedPlan = await aiService.adjustStudyPlan(req.user.id, performanceData);

      res.json({
        success: true,
        message: 'Study progress updated and plan adjusted',
        session,
        adjustedPlan
      });
    } catch (error) {
      logger.error('Error updating study progress:', error);
      res.status(500).json({ error: 'Failed to update study progress' });
    }
  }

  calculatePerformanceMetrics(sessions) {
    const metrics = {
      averageScore: 0,
      completedSessions: 0,
      topics: {},
      timeSpent: 0
    };

    sessions.forEach(session => {
      if (session.performance.completed) {
        metrics.completedSessions++;
        metrics.averageScore += session.performance.score || 0;
        metrics.timeSpent += session.duration;

        // Track topic performance
        if (!metrics.topics[session.topic]) {
          metrics.topics[session.topic] = {
            count: 0,
            totalScore: 0,
            timeSpent: 0
          };
        }
        metrics.topics[session.topic].count++;
        metrics.topics[session.topic].totalScore += session.performance.score || 0;
        metrics.topics[session.topic].timeSpent += session.duration;
      }
    });

    // Calculate averages
    if (metrics.completedSessions > 0) {
      metrics.averageScore /= metrics.completedSessions;
    }

    // Calculate topic proficiency
    Object.keys(metrics.topics).forEach(topic => {
      metrics.topics[topic].averageScore = 
        metrics.topics[topic].totalScore / metrics.topics[topic].count;
    });

    return metrics;
  }
}

module.exports = new ScanController(); 