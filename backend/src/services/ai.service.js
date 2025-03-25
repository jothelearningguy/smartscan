const OpenAI = require('openai');
const logger = require('../utils/logger');
const StudySession = require('../models/studySession.model');
const User = require('../models/user.model');

class AIService {
  constructor() {
    // Initialize OpenAI client with a default configuration
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-development'
    });
  }

  async generateStudyPlan(userId, scannedMaterials) {
    try {
      // Get user's study history and performance
      const user = await User.findById(userId);
      const studyHistory = await StudySession.find({ userId });

      // Analyze scanned materials
      const materialAnalysis = await this.analyzeMaterials(scannedMaterials);

      // Generate personalized study plan
      const studyPlan = await this.createStudyPlan(user, materialAnalysis, studyHistory);

      // Update user's study schedule
      await this.updateStudySchedule(userId, studyPlan);

      return studyPlan;
    } catch (error) {
      logger.error('Error generating study plan:', error);
      throw error;
    }
  }

  async analyzeMaterials(materials) {
    try {
      const prompt = `Analyze the following study materials and identify key topics, concepts, and difficulty levels:
        ${JSON.stringify(materials)}
        
        Provide a structured analysis including:
        1. Main topics and subtopics
        2. Difficulty level for each topic
        3. Estimated study time requirements
        4. Prerequisites and dependencies
        5. Key concepts to focus on`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logger.error('Error analyzing materials:', error);
      throw error;
    }
  }

  async createStudyPlan(user, materialAnalysis, studyHistory) {
    try {
      const prompt = `Create an optimized study plan based on the following information:
        
        User Profile:
        - Learning style: ${user.learningStyle}
        - Preferred study times: ${user.preferredStudyTimes}
        - Current performance: ${user.performanceMetrics}
        
        Material Analysis:
        ${JSON.stringify(materialAnalysis)}
        
        Study History:
        ${JSON.stringify(studyHistory)}
        
        Generate a detailed study plan that includes:
        1. Daily study blocks
        2. Topic prioritization
        3. Review sessions
        4. Practice exercises
        5. Progress tracking milestones`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1500
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logger.error('Error creating study plan:', error);
      throw error;
    }
  }

  async adjustStudyPlan(userId, performanceData) {
    try {
      const user = await User.findById(userId);
      const currentPlan = await StudySession.find({ userId });

      const prompt = `Adjust the study plan based on the following performance data:
        ${JSON.stringify(performanceData)}
        
        Current Plan:
        ${JSON.stringify(currentPlan)}
        
        User Profile:
        ${JSON.stringify(user)}
        
        Provide an adjusted study plan that:
        1. Addresses areas of difficulty
        2. Maintains progress on strong topics
        3. Optimizes time allocation
        4. Includes additional practice where needed
        5. Adjusts difficulty levels appropriately`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1500
      });

      const adjustedPlan = JSON.parse(response.choices[0].message.content);
      await this.updateStudySchedule(userId, adjustedPlan);

      return adjustedPlan;
    } catch (error) {
      logger.error('Error adjusting study plan:', error);
      throw error;
    }
  }

  async updateStudySchedule(userId, studyPlan) {
    try {
      // Clear existing study sessions
      await StudySession.deleteMany({ userId });

      // Create new study sessions
      const sessions = studyPlan.sessions.map(session => ({
        userId,
        ...session,
        status: 'scheduled'
      }));

      await StudySession.insertMany(sessions);
      logger.info(`Updated study schedule for user ${userId}`);
    } catch (error) {
      logger.error('Error updating study schedule:', error);
      throw error;
    }
  }

  async processDocument(text, options = {}) {
    try {
      // For development, return mock data
      return this.getMockResponse(options.type);
    } catch (error) {
      logger.error('Error processing document with AI:', error);
      throw error;
    }
  }

  getMockResponse(type) {
    switch (type) {
      case 'studyPath':
        return {
          recommendedOrder: [
            {
              order: 1,
              reason: 'Foundational concept'
            }
          ],
          focusAreas: [
            {
              topic: 'Sample Topic',
              priority: 1,
              suggestedResources: []
            }
          ]
        };
      case 'flashcards':
        return [
          {
            question: 'Sample Question',
            answer: 'Sample Answer',
            topic: 'Sample Topic'
          }
        ];
      case 'organization':
        return {
          folders: [
            {
              name: 'Chapter 1',
              description: 'Introduction'
            }
          ]
        };
      case 'sessionSuggestions':
        return {
          focusAreas: ['Topic 1', 'Topic 2'],
          relatedResources: [],
          practiceQuestions: [
            {
              question: 'Sample Question',
              answer: 'Sample Answer',
              explanation: 'Sample Explanation'
            }
          ]
        };
      default:
        return {};
    }
  }
}

module.exports = new AIService(); 