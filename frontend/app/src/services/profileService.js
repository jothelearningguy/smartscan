import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const profileService = {
  // Get user profile data
  getProfile: async () => {
    const response = await axios.get(`${API_URL}/profile`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await axios.put(`${API_URL}/profile`, profileData);
    return response.data;
  },

  // Get user statistics
  getStatistics: async () => {
    const response = await axios.get(`${API_URL}/profile/statistics`);
    return response.data;
  },

  // Update user settings
  updateSettings: async (settings) => {
    const response = await axios.put(`${API_URL}/profile/settings`, settings);
    return response.data;
  },

  // Get user preferences
  getPreferences: async () => {
    const response = await axios.get(`${API_URL}/profile/preferences`);
    return response.data;
  },

  // Update user preferences
  updatePreferences: async (preferences) => {
    const response = await axios.put(`${API_URL}/profile/preferences`, preferences);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await axios.put(`${API_URL}/profile/password`, passwordData);
    return response.data;
  },

  // Delete account
  deleteAccount: async () => {
    const response = await axios.delete(`${API_URL}/profile`);
    return response.data;
  },
};

export default profileService; 