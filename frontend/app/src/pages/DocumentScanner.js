import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Grid,
  Slider,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Camera as CameraIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  AutoFixHigh as AutoFixHighIcon,
  TextFields as TextFieldsIcon,
  Image as ImageIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  FilterHdr as FilterHdrIcon,
  Brightness6 as BrightnessIcon,
  Contrast as ContrastIcon,
  Crop as CropIcon,
  RotateRight as RotateIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const DocumentScanner = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const videoRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [enhancementSettings, setEnhancementSettings] = useState({
    brightness: 50,
    contrast: 50,
    autoEnhance: true,
    edgeDetection: false,
  });

  const handleStartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const handleCapture = () => {
    setIsScanning(true);
    // Simulate scanning process
    setTimeout(() => {
      setPreviewImage('/images/sample-document.jpg');
      setIsScanning(false);
    }, 2000);
  };

  const handleEnhancementChange = (setting) => (event, value) => {
    setEnhancementSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleAutoEnhanceToggle = (event) => {
    setEnhancementSettings(prev => ({
      ...prev,
      autoEnhance: event.target.checked
    }));
  };

  return (
    <Box sx={{ p: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary.main">
          Document Scanner
        </Typography>
        <Box>
          <IconButton onClick={() => setShowSettings(true)}>
            <SettingsIcon />
          </IconButton>
          <IconButton onClick={() => navigate('/scan')}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Main Content */}
      <Grid container spacing={3} sx={{ flex: 1 }}>
        {/* Camera Preview */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={3} 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
              bgcolor: 'black'
            }}
          >
            {previewImage ? (
              <img 
                src={previewImage} 
                alt="Scanned document" 
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            )}
            {isScanning && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                }}
              >
                <Typography variant="h6">Scanning...</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Controls */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Controls
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<CameraIcon />}
                onClick={handleStartCamera}
                fullWidth
              >
                Start Camera
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AutoFixHighIcon />}
                onClick={handleCapture}
                disabled={isScanning}
                fullWidth
              >
                Capture
              </Button>
              <Button
                variant="outlined"
                startIcon={<ImageIcon />}
                onClick={() => setShowAdvancedSettings(true)}
                fullWidth
              >
                Advanced Settings
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Basic Settings Dialog */}
      <Dialog 
        open={showSettings} 
        onClose={() => setShowSettings(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Basic Settings</DialogTitle>
        <DialogContent>
          <List>
            <ListItem>
              <ListItemIcon>
                <BrightnessIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Brightness"
                secondary={
                  <Slider
                    value={enhancementSettings.brightness}
                    onChange={handleEnhancementChange('brightness')}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                  />
                }
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ContrastIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Contrast"
                secondary={
                  <Slider
                    value={enhancementSettings.contrast}
                    onChange={handleEnhancementChange('contrast')}
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                  />
                }
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <AutoFixHighIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Auto Enhance"
                secondary={
                  <FormControlLabel
                    control={
                      <Switch
                        checked={enhancementSettings.autoEnhance}
                        onChange={handleAutoEnhanceToggle}
                      />
                    }
                    label="Enable automatic enhancement"
                  />
                }
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Advanced Settings Dialog */}
      <Dialog 
        open={showAdvancedSettings} 
        onClose={() => setShowAdvancedSettings(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Advanced Settings</DialogTitle>
        <DialogContent>
          <List>
            <ListItem>
              <ListItemIcon>
                <CropIcon />
              </ListItemIcon>
              <ListItemText primary="Auto Crop" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <RotateIcon />
              </ListItemIcon>
              <ListItemText primary="Auto Rotate" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <FilterHdrIcon />
              </ListItemIcon>
              <ListItemText primary="Edge Detection" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <TextFieldsIcon />
              </ListItemIcon>
              <ListItemText primary="Text Recognition" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAdvancedSettings(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentScanner; 