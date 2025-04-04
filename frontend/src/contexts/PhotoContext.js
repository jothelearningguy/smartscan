import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const PhotoContext = createContext();

export function usePhotos() {
  return useContext(PhotoContext);
}

export function PhotoProvider({ children }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:3000/api';

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/photos`);
      setPhotos(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch photos');
      console.error('Error fetching photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('photo', file);

      const response = await axios.post(`${API_URL}/photos/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setPhotos(prev => [response.data, ...prev]);
      setError(null);
      return response.data;
    } catch (err) {
      setError('Failed to upload photo');
      console.error('Error uploading photo:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const processPhoto = async (photoId) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/photos/${photoId}/process`);
      setPhotos(prev => prev.map(photo => 
        photo._id === photoId ? response.data : photo
      ));
      setError(null);
      return response.data;
    } catch (err) {
      setError('Failed to process photo');
      console.error('Error processing photo:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const categorizePhoto = async (photoId) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/photos/${photoId}/categorize`);
      setPhotos(prev => prev.map(photo => 
        photo._id === photoId ? response.data : photo
      ));
      setError(null);
      return response.data;
    } catch (err) {
      setError('Failed to categorize photo');
      console.error('Error categorizing photo:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async (photoId) => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/photos/${photoId}`);
      setPhotos(prev => prev.filter(photo => photo._id !== photoId));
      setError(null);
    } catch (err) {
      setError('Failed to delete photo');
      console.error('Error deleting photo:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const value = {
    photos,
    loading,
    error,
    uploadPhoto,
    processPhoto,
    categorizePhoto,
    deletePhoto,
    fetchPhotos,
  };

  return (
    <PhotoContext.Provider value={value}>
      {children}
    </PhotoContext.Provider>
  );
} 