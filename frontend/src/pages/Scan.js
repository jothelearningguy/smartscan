import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  IconButton,
  Dialog,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  PhotoCamera as CameraIcon,
  ArrowBack as BackIcon,
  Description as DocumentIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import CameraInterface from '../components/CameraInterface';

const SUPPORTED_FORMATS = {
  'image/jpeg': {
    icon: ImageIcon,
    label: 'JPEG Image',
  },
  'image/png': {
    icon: ImageIcon,
    label: 'PNG Image',
  },
  'image/heic': {
    icon: ImageIcon,
    label: 'HEIC Image',
  },
  'application/pdf': {
    icon: PdfIcon,
    label: 'PDF Document',
  },
};

function Scan() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!SUPPORTED_FORMATS[file.type]) {
        setError('Unsupported file format. Please use JPG, PNG, HEIC, or PDF files.');
        return;
      }

      if (file.size > 20 * 1024 * 1024) { // 20MB limit
        setError('File size too large. Please use a file smaller than 20MB.');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleCameraCapture = (imageData) => {
    setShowCamera(false);
    fetch(imageData)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'camera_capture.jpg', { type: 'image/jpeg' });
        setSelectedFile(file);
        setPreviewUrl(imageData);
      });
  };

  const handleStartScanning = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated upload
      navigate('/scan/process', { state: { fileUrl: previewUrl } });
    } catch (error) {
      setError('Error uploading file. Please try again.');
      setLoading(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files[0];
    if (file) {
      if (!SUPPORTED_FORMATS[file.type]) {
        setError('Unsupported file format. Please use JPG, PNG, HEIC, or PDF files.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        pt: 8,
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <IconButton
            onClick={() => navigate('/')}
            sx={{ color: '#1a237e' }}
          >
            <BackIcon />
          </IconButton>
        </Box>
        
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'white',
          }}
        >
          <Typography variant="h4" gutterBottom>
            New Scan
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Upload a document or take a photo to start scanning
          </Typography>

          {!selectedFile ? (
            <>
              <Box
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                sx={{
                  width: '100%',
                  border: '2px dashed #1a237e',
                  borderRadius: 2,
                  p: 4,
                  mb: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(26, 35, 126, 0.05)',
                  },
                }}
              >
                <DocumentIcon sx={{ fontSize: 48, color: '#1a237e', mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  Drag and drop your file here
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  or choose an option below
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<UploadIcon />}
                  sx={{
                    bgcolor: '#1a237e',
                    '&:hover': { bgcolor: '#0d47a1' },
                  }}
                >
                  Upload File
                  <input
                    type="file"
                    hidden
                    accept={Object.keys(SUPPORTED_FORMATS).join(',')}
                    onChange={handleFileSelect}
                  />
                </Button>

                <Button
                  variant="contained"
                  onClick={() => setShowCamera(true)}
                  startIcon={<CameraIcon />}
                  sx={{
                    bgcolor: '#1a237e',
                    '&:hover': { bgcolor: '#0d47a1' },
                  }}
                >
                  Take Photo
                </Button>
              </Box>

              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Supported formats:
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  {Object.entries(SUPPORTED_FORMATS).map(([type, { icon: Icon, label }]) => (
                    <Box
                      key={type}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <Icon sx={{ fontSize: 16 }} />
                      <Typography variant="caption">{label}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ width: '100%' }}>
              <Box
                sx={{
                  width: '100%',
                  maxHeight: '400px',
                  overflow: 'hidden',
                  borderRadius: 2,
                  mb: 2,
                }}
              >
                <img
                  src={previewUrl}
                  alt="Document preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                Selected: {selectedFile.name}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleStartScanning}
                  disabled={loading}
                  sx={{
                    bgcolor: '#1a237e',
                    '&:hover': { bgcolor: '#0d47a1' },
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Processing...
                    </>
                  ) : (
                    'Start Scanning'
                  )}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>

      <Dialog
        fullScreen
        open={showCamera}
        onClose={() => setShowCamera(false)}
      >
        <CameraInterface
          onClose={() => setShowCamera(false)}
          onCapture={handleCameraCapture}
        />
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Scan; 