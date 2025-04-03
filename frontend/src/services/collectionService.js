import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const collectionService = {
  // Get all collections
  getAllCollections: async () => {
    try {
      const response = await axios.get(`${API_URL}/collections`);
      return response.data;
    } catch (error) {
      console.error('Error fetching collections:', error);
      throw error;
    }
  },

  // Get collection by ID
  getCollectionById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/collections/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching collection:', error);
      throw error;
    }
  },

  // Create new collection
  createCollection: async (collectionData) => {
    try {
      const response = await axios.post(`${API_URL}/collections`, collectionData);
      return response.data;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  },

  // Update collection
  updateCollection: async (id, collectionData) => {
    try {
      const response = await axios.put(`${API_URL}/collections/${id}`, collectionData);
      return response.data;
    } catch (error) {
      console.error('Error updating collection:', error);
      throw error;
    }
  },

  // Delete collection
  deleteCollection: async (id) => {
    try {
      await axios.delete(`${API_URL}/collections/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting collection:', error);
      throw error;
    }
  },

  // Share collection
  shareCollection: async (id, shareData) => {
    try {
      const response = await axios.post(`${API_URL}/collections/${id}/share`, shareData);
      return response.data;
    } catch (error) {
      console.error('Error sharing collection:', error);
      throw error;
    }
  },

  // Export collection
  exportCollection: async (id, format) => {
    try {
      const response = await axios.get(`${API_URL}/collections/${id}/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting collection:', error);
      throw error;
    }
  }
}; 