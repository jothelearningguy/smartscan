import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Grid,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { usePhotos } from '../contexts/PhotoContext';

const MotionPaper = motion(Paper);

const PhotoUpload = () => {
  const navigate = useNavigate();
  const { uploadPhoto, loading, error } = usePhotos();
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles) => {
    try {
      const file = acceptedFiles[0];
      const photo = await uploadPhoto(file);
      navigate(`/photo/${photo._id}`);
    } catch (err) {
      console.error('Error uploading photo:', err);
    }
  }, [uploadPhoto, navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Upload Photo
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <MotionPaper
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            sx={{
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'divider',
              transition: 'all 0.2s ease-in-out',
            }}
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive
                ? 'Drop the photo here'
                : 'Drag and drop a photo here, or click to select'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supported formats: JPEG, PNG, GIF
            </Typography>
          </MotionPaper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upload Instructions
            </Typography>
            <Typography variant="body2" paragraph>
              1. Drag and drop your photo into the upload area, or click to select a file
            </Typography>
            <Typography variant="body2" paragraph>
              2. The photo will be automatically processed and analyzed
            </Typography>
            <Typography variant="body2" paragraph>
              3. You'll be redirected to the photo details page once processing is complete
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Note: Maximum file size is 5MB
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {loading && (
        <Box mt={3} display="flex" flexDirection="column" alignItems="center">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" mt={2}>
            Uploading and processing your photo...
          </Typography>
        </Box>
      )}

      {error && (
        <Box mt={3}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      <Box mt={3} display="flex" justifyContent="center">
        <Button
          variant="outlined"
          startIcon={<PhotoCameraIcon />}
          onClick={() => navigate('/')}
        >
          View All Photos
        </Button>
      </Box>
    </Box>
  );
};

export default PhotoUpload; 