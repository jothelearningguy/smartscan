import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Grid,
} from '@mui/material';
import {
  Camera as CameraIcon,
  PhotoCamera as PhotoCameraIcon,
  Image as ImageIcon,
  Info as InfoIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  Collections as CollectionsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ObjectScanner = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [collections, setCollections] = useState([
    { id: 1, name: 'Science Objects' },
    { id: 2, name: 'Historical Artifacts' },
    { id: 3, name: 'Art Collection' },
  ]);

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        const stream = videoRef.current.srcObject;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      setError('Failed to access camera. Please ensure you have granted camera permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
    setIsCameraActive(false);
  };

  const startScanning = () => {
    setIsScanning(true);
    // Simulate object recognition process
    setTimeout(() => {
      setScanResult({
        name: 'Sample Object',
        description: 'This is a detailed description of the scanned object.',
        category: 'Science',
        confidence: 95,
        relatedObjects: [
          { name: 'Related Object 1', similarity: 85 },
          { name: 'Related Object 2', similarity: 75 },
        ],
        learningResources: [
          { title: 'Introduction to Object', type: 'Video' },
          { title: 'Detailed Analysis', type: 'Article' },
        ],
      });
      setIsScanning(false);
    }, 2000);
  };

  const handleSave = () => {
    // Implement save functionality
    setSaveDialogOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: 'primary.main' }}>
        Object Scanner
      </Typography>

      <Grid container spacing={3}>
        {/* Camera Feed */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 2,
              height: '500px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              background: '#000',
            }}
          >
            {!isCameraActive ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <CameraIcon sx={{ fontSize: 60, color: 'grey.500' }} />
                <Typography variant="h6" color="text.secondary">
                  Camera not active
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PhotoCameraIcon />}
                  onClick={startCamera}
                >
                  Start Camera
                </Button>
              </Box>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    color="error"
                    onClick={stopCamera}
                  >
                    Stop Camera
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={startScanning}
                    disabled={isScanning}
                  >
                    {isScanning ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Scan Object'
                    )}
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        {/* Scan Results */}
        <Grid item xs={12} md={4}>
          {scanResult ? (
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Scan Results</Typography>
                <Box>
                  <IconButton onClick={() => setSaveDialogOpen(true)}>
                    <SaveIcon />
                  </IconButton>
                  <IconButton>
                    <ShareIcon />
                  </IconButton>
                </Box>
              </Box>
              <Typography variant="subtitle1" gutterBottom>
                {scanResult.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {scanResult.description}
              </Typography>
              <Chip
                label={scanResult.category}
                color="primary"
                sx={{ mb: 2 }}
              />
              <Typography variant="subtitle2" gutterBottom>
                Confidence: {scanResult.confidence}%
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Related Objects:
              </Typography>
              <List dense>
                {scanResult.relatedObjects.map((obj, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <ImageIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={obj.name}
                      secondary={`${obj.similarity}% similar`}
                    />
                  </ListItem>
                ))}
              </List>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Learning Resources:
              </Typography>
              <List dense>
                {scanResult.learningResources.map((resource, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <InfoIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={resource.title}
                      secondary={resource.type}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          ) : (
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <ImageIcon sx={{ fontSize: 60, color: 'grey.500', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No scan results yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use the camera to scan an object and see its analysis here
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save to Collection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Collection Name"
            fullWidth
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
          />
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Or select existing collection:
          </Typography>
          <List dense>
            {collections.map((collection) => (
              <ListItem
                button
                key={collection.id}
                onClick={() => setCollectionName(collection.name)}
              >
                <ListItemIcon>
                  <CollectionsIcon />
                </ListItemIcon>
                <ListItemText primary={collection.name} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ObjectScanner; 