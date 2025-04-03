import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  Label as LabelIcon,
  Image as ImageIcon,
  TextFields as TextFieldsIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { usePhotos } from '../contexts/PhotoContext';

const MotionPaper = motion(Paper);

const PhotoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { photos, loading, error, processPhoto, categorizePhoto, deletePhoto } = usePhotos();
  const [photo, setPhoto] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const foundPhoto = photos.find(p => p._id === id);
    if (foundPhoto) {
      setPhoto(foundPhoto);
    }
  }, [id, photos]);

  const handleProcess = async () => {
    try {
      setProcessing(true);
      const updatedPhoto = await processPhoto(id);
      setPhoto(updatedPhoto);
    } catch (err) {
      console.error('Error processing photo:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleCategorize = async () => {
    try {
      setProcessing(true);
      const updatedPhoto = await categorizePhoto(id);
      setPhoto(updatedPhoto);
    } catch (err) {
      console.error('Error categorizing photo:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePhoto(id);
      navigate('/');
    } catch (err) {
      console.error('Error deleting photo:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!photo) {
    return (
      <Box p={3}>
        <Alert severity="warning">Photo not found</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={3} display="flex" alignItems="center" gap={2}>
        <IconButton onClick={() => navigate('/')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Photo Details</Typography>
        <Box flexGrow={1} />
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <MotionPaper
            whileHover={{ scale: 1.02 }}
            sx={{ overflow: 'hidden' }}
          >
            <img
              src={`http://localhost:3000${photo.processedUrl}`}
              alt="Processed photo"
              style={{ width: '100%', height: 'auto' }}
            />
          </MotionPaper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Photo Information
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CategoryIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Categories"
                  secondary={
                    <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                      {photo.categories.map((category) => (
                        <Chip
                          key={category}
                          label={category}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ImageIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Dimensions"
                  secondary={`${photo.metadata.width} x ${photo.metadata.height}`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TextFieldsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="File Size"
                  secondary={`${(photo.metadata.size / 1024 / 1024).toFixed(2)} MB`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Status"
                  secondary={photo.status}
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={handleProcess}
                disabled={processing || photo.status === 'processed'}
                fullWidth
              >
                Process
              </Button>
              <Button
                variant="contained"
                startIcon={<LabelIcon />}
                onClick={handleCategorize}
                disabled={processing || photo.status === 'categorized'}
                fullWidth
              >
                Categorize
              </Button>
            </Box>
          </Paper>

          {photo.aiAnalysis && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                AI Analysis
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                Detected Labels
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                {photo.aiAnalysis.labels.map((label, index) => (
                  <Chip
                    key={index}
                    label={`${label.description} (${(label.score * 100).toFixed(0)}%)`}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Detected Objects
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                {photo.aiAnalysis.objects.map((obj, index) => (
                  <Chip
                    key={index}
                    label={`${obj.name} (${(obj.score * 100).toFixed(0)}%)`}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>

              {photo.aiAnalysis.text && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Extracted Text
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                    {photo.aiAnalysis.text}
                  </Typography>
                </>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Safe Search
              </Typography>
              <List dense>
                {Object.entries(photo.aiAnalysis.safeSearch).map(([key, value]) => (
                  <ListItem key={key}>
                    <ListItemText
                      primary={key.charAt(0).toUpperCase() + key.slice(1)}
                      secondary={value}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>
      </Grid>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Photo</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this photo? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PhotoDetail; 