import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Cameraswitch as CameraSwitchIcon,
  FlashOn as FlashOnIcon,
  FlashOff as FlashOffIcon,
  PhotoCamera as CameraIcon,
} from '@mui/icons-material';
import './CameraInterface.css';

const CameraInterface = ({ onClose, onCapture }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [facingMode, setFacingMode] = useState('environment');
  const [flashAvailable, setFlashAvailable] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      setFlashAvailable('torch' in capabilities);
      setLoading(false);
    } catch (err) {
      console.error('Error accessing camera:', err);
      onClose();
    }
  };

  const toggleFlash = async () => {
    if (!streamRef.current) return;

    const track = streamRef.current.getVideoTracks()[0];
    const capabilities = track.getCapabilities();
    
    if ('torch' in capabilities) {
      const newFlashState = !flashOn;
      await track.applyConstraints({
        advanced: [{ torch: newFlashState }],
      });
      setFlashOn(newFlashState);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    onCapture(imageData);
  };

  return (
    <Box className="camera-container">
      {loading ? (
        <Box className="loading-container">
          <CircularProgress />
          <Typography>Accessing camera...</Typography>
        </Box>
      ) : (
        <>
          <Box className="camera-header">
            <IconButton onClick={onClose} className="close-button">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6">Take Photo</Typography>
            <Box className="camera-controls">
              {flashAvailable && (
                <IconButton onClick={toggleFlash} className="control-button">
                  {flashOn ? <FlashOnIcon /> : <FlashOffIcon />}
                </IconButton>
              )}
              <IconButton onClick={switchCamera} className="control-button">
                <CameraSwitchIcon />
              </IconButton>
            </Box>
          </Box>

          <Box className="video-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-preview"
            />
          </Box>

          <Box className="capture-container">
            <IconButton
              className="capture-button"
              onClick={capturePhoto}
            >
              <CameraIcon />
            </IconButton>
          </Box>
        </>
      )}
    </Box>
  );
};

export default CameraInterface; 