import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  IconButton,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  PhotoCamera as CameraIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';

function Scan() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Here you would typically upload the file to your backend
      console.log('File selected:', file);
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
                accept="image/*"
                onChange={handleFileSelect}
              />
            </Button>

            <Button
              variant="contained"
              startIcon={<CameraIcon />}
              sx={{
                bgcolor: '#1a237e',
                '&:hover': { bgcolor: '#0d47a1' },
              }}
            >
              Take Photo
            </Button>
          </Box>

          {selectedFile && (
            <Box sx={{ mt: 4, width: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                Selected File: {selectedFile.name}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  mt: 2,
                  bgcolor: '#1a237e',
                  '&:hover': { bgcolor: '#0d47a1' },
                }}
              >
                Start Scanning
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

export default Scan; 