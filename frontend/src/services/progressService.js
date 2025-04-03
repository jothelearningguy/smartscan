import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const progressService = {
  // Get user's learning progress
  getLearningProgress: async () => {
    const response = await axios.get(`${API_URL}/progress`);
    return response.data;
  },

  // Get user's achievements
  getAchievements: async () => {
    const response = await axios.get(`${API_URL}/achievements`);
    return response.data;
  },

  // Get recent learning activities
  getRecentActivities: async () => {
    const response = await axios.get(`${API_URL}/activities`);
    return response.data;
  },

  // Update learning progress
  updateProgress: async (progressData) => {
    const response = await axios.put(`${API_URL}/progress`, progressData);
    return response.data;
  },

  // Mark achievement as completed
  completeAchievement: async (achievementId) => {
    const response = await axios.post(`${API_URL}/achievements/${achievementId}/complete`);
    return response.data;
  },

  // Get detailed statistics
  getStatistics: async () => {
    const response = await axios.get(`${API_URL}/statistics`);
    return response.data;
  },
};

export default progressService; 