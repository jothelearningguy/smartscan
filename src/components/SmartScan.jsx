import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Button, Container, Grid, Paper, Typography, 
  CircularProgress, Snackbar, Alert, Card,
  CardContent, IconButton, Dialog, DialogContent,
  Box, LinearProgress, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
  CameraAlt as ScanIcon,
  Description as DocumentIcon,
  Science as ObjectIcon,
  Share as ShareIcon,
  Schedule as ScheduleIcon,
  CameraAlt,
  Check,
  DocumentScanner,
  PictureAsPdf,
  Image,
  KeyboardArrowRight
} from '@mui/icons-material';
import Tesseract from 'tesseract.js';
import * as tf from '@tensorflow/tfjs';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf';
import styles from './SmartScan.module.css';
import 'pdfjs-dist/build/pdf.worker.entry';

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.entry');
}

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * SmartScan Component
 * Intelligent learning material management system integrated with HeallyHub
 */
const SmartScan = () => {
  // State management
  const [scanningStatus, setScanningStatus] = useState({
    isScanning: false,
    progress: 0,
    type: null // 'document' or 'object'
  });
  const [scannedContent, setScannedContent] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [showPreview, setShowPreview] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [extractedPoints, setExtractedPoints] = useState([]);
  const [error, setError] = useState(null);
  
  // Refs
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Load TensorFlow model on component mount
  useEffect(() => {
    loadTensorFlowModel();
    fetchStudyMaterials();
  }, []);

  /**
   * Loads and initializes the TensorFlow model for object recognition
   */
  const loadTensorFlowModel = async () => {
    try {
      const model = await tf.loadGraphModel('/models/object_detection/model.json');
      // Store model in ref for later use
      window.tfModel = model;
    } catch (err) {
      console.error('Error loading TensorFlow model:', err);
      showNotification('Failed to load object recognition model', 'error');
    }
  };

  /**
   * Fetches existing study materials from HeallyHub
   */
  const fetchStudyMaterials = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/study/materials`);
      setStudyMaterials(response.data);
    } catch (err) {
      console.error('Error fetching study materials:', err);
      showNotification('Failed to load study materials', 'error');
    }
  };

  /**
   * Handles document scanning using device camera or file upload
   */
  const handleDocumentScan = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const extractKeyPoints = (text) => {
    // Split text into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    
    // Select most informative sentences (based on length and keyword presence)
    const keywordsList = ['important', 'key', 'main', 'significant', 'essential', 'primary', 'critical'];
    
    const scoredSentences = sentences.map(sentence => ({
      text: sentence.trim(),
      score: sentence.length + keywordsList.reduce((acc, keyword) => 
        acc + (sentence.toLowerCase().includes(keyword) ? 2 : 0), 0)
    }));

    // Sort by score and take top 5
    return scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => s.text);
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setScanningStatus({ isScanning: true, progress: 0, type: 'document' });
      let text = '';

      if (file.type === 'application/pdf') {
        // Handle PDF
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        const maxPages = pdf.numPages;
        let fullText = '';
        
        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const pageText = content.items.map(item => item.str).join(' ');
          fullText += pageText + ' ';
          
          setScanningStatus({ 
            isScanning: true, 
            progress: (pageNum / maxPages) * 100, 
            type: 'document' 
          });
        }
        
        text = fullText;
      } else if (file.type.startsWith('image/')) {
        // Handle Image
        const result = await Tesseract.recognize(file, 'eng', {
          logger: m => {
            if (m.status === 'recognizing text') {
              setScanningStatus({ 
                isScanning: true, 
                progress: m.progress * 100, 
                type: 'document' 
              });
            }
          }
        });
        text = result.data.text;
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or image file.');
      }

      if (!text.trim()) {
        throw new Error('No text could be extracted from the document. Please try a different file.');
      }

      const points = extractKeyPoints(text);
      setExtractedPoints(points);
      setScannedContent(text);
      setShowPreview(true);
    } catch (err) {
      console.error('Error scanning document:', err);
      setError(err.message || 'Failed to scan document. Please try again.');
    } finally {
      setScanningStatus({ isScanning: false, progress: 0, type: null });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * Handles object scanning using device camera
   */
  const handleObjectScan = async () => {
    setScanningStatus({ isScanning: true, progress: 0, type: 'object' });
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Wait for video to be ready
      await new Promise((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = resolve;
        }
      });

      // Capture frame after 2 seconds
      setTimeout(async () => {
        if (canvasRef.current && videoRef.current) {
          const context = canvasRef.current.getContext('2d');
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          context.drawImage(videoRef.current, 0, 0);
          
          // Convert canvas to blob
          const blob = await new Promise(resolve => canvasRef.current.toBlob(resolve, 'image/jpeg'));
          const imageUrl = URL.createObjectURL(blob);
          setCapturedImage(imageUrl);
          setShowImagePreview(true);
        }

        // Clean up
        stream.getTracks().forEach(track => track.stop());
        setShowCamera(false);
        setScanningStatus({ isScanning: false, progress: 0, type: null });
      }, 2000);

    } catch (err) {
      console.error('Error scanning object:', err);
      showNotification('Failed to scan object', 'error');
      setShowCamera(false);
      setScanningStatus({ isScanning: false, progress: 0, type: null });
    }
  };

  const handleRetake = () => {
    setShowImagePreview(false);
    setCapturedImage(null);
    handleObjectScan();
  };

  const handleProceed = async () => {
    try {
      setScanningStatus({ isScanning: true, progress: 0, type: 'object' });
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const processedContent = await processObjectRecognition(blob);
      setScannedContent(processedContent);
      setShowPreview(true);
      setShowImagePreview(false);
    } catch (err) {
      console.error('Error processing image:', err);
      showNotification('Failed to process image', 'error');
    } finally {
      setScanningStatus({ isScanning: false, progress: 0, type: null });
    }
  };

  /**
   * Processes scanned content using AI for categorization and enhancement
   */
  const processScannedContent = async (text) => {
    setProcessingStatus('processing');
    try {
      const response = await axios.post(`${API_BASE_URL}/scan/process`, { content: text });
      setProcessingStatus('complete');
      return response.data;
    } catch (err) {
      console.error('Error processing content:', err);
      setProcessingStatus('error');
      throw err;
    }
  };

  /**
   * Processes object recognition results
   */
  const processObjectRecognition = async (imageBlob) => {
    try {
      const formData = new FormData();
      formData.append('image', imageBlob);
      
      const response = await axios.post(`${API_BASE_URL}/scan/object/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (err) {
      console.error('Error analyzing object:', err);
      throw err;
    }
  };

  /**
   * Shares scanned content with study group
   */
  const handleShare = async () => {
    try {
      await axios.post(`${API_BASE_URL}/collab/share`, { content: scannedContent });
      showNotification('Content shared successfully', 'success');
    } catch (err) {
      console.error('Error sharing content:', err);
      showNotification('Failed to share content', 'error');
    }
  };

  /**
   * Shows notification message
   */
  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  /**
   * Handles notification close
   */
  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      overflowY: 'auto',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          SmartScan
        </Typography>

        {/* Scanning Options */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 3, 
                textAlign: 'center',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,image/*"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<DocumentScanner />}
                onClick={handleDocumentScan}
                disabled={scanningStatus.isScanning}
                sx={{ 
                  minWidth: '200px',
                  py: 1.5
                }}
              >
                Scan Document (PDF or Image)
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Supports PDF and image files
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 3, 
                textAlign: 'center',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<ObjectIcon />}
                onClick={handleObjectScan}
                disabled={scanningStatus.isScanning}
                sx={{ 
                  minWidth: '200px',
                  py: 1.5
                }}
              >
                Scan Object
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Uses your device camera
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Camera Preview */}
        {showCamera && (
          <Paper 
            elevation={3}
            sx={{ 
              p: 3, 
              textAlign: 'center',
              mb: 4
            }}
          >
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '400px',
                  borderRadius: '8px'
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '200px',
                  height: '200px',
                  border: '2px solid #fff',
                  borderRadius: '50%',
                  pointerEvents: 'none'
                }}
              />
            </Box>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Position the object in the frame. Capturing in 2 seconds...
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={50}
              sx={{ 
                width: '100%', 
                mt: 2,
                height: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#fff',
                }
              }}
            />
          </Paper>
        )}

        {/* Scanning Progress */}
        {scanningStatus.isScanning && (
          <Paper 
            elevation={3}
            sx={{ 
              p: 3, 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              mb: 4
            }}
          >
            <CircularProgress 
              variant="determinate" 
              value={scanningStatus.progress}
              size={60}
            />
            <Typography>
              {scanningStatus.type === 'document' ? 'Scanning document...' : 'Analyzing object...'}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={scanningStatus.progress}
              sx={{ width: '100%', mt: 2 }}
            />
          </Paper>
        )}

        {/* Preview Dialog */}
        <Dialog 
          open={showPreview} 
          onClose={() => setShowPreview(false)} 
          maxWidth="md" 
          fullWidth
        >
          <DialogContent>
            {scannedContent && (
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Extracted Key Points
                </Typography>
                <List>
                  {extractedPoints.map((point, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <KeyboardArrowRight />
                      </ListItemIcon>
                      <ListItemText primary={point} />
                    </ListItem>
                  ))}
                </List>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ShareIcon />}
                  onClick={handleShare}
                  sx={{ mt: 2 }}
                >
                  Share with Study Group
                </Button>
              </Box>
            )}
          </DialogContent>
        </Dialog>

        {/* Image Preview Dialog */}
        <Dialog 
          open={showImagePreview} 
          onClose={() => setShowImagePreview(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogContent>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Preview Captured Image
              </Typography>
              <Box sx={{ mb: 3 }}>
                <img
                  src={capturedImage}
                  alt="Captured object"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleRetake}
                  startIcon={<CameraAlt />}
                >
                  Retake
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleProceed}
                  startIcon={<Check />}
                >
                  Proceed
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Study Materials */}
        <Grid container spacing={3}>
          {studyMaterials.map((material, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                elevation={3}
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {material.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {material.category}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Scanned on: {new Date(material.scanDate).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Hidden Elements */}
        <video ref={videoRef} style={{ display: 'none' }} />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Notifications */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleNotificationClose}
        >
          <Alert onClose={handleNotificationClose} severity={notification.severity}>
            {notification.message}
          </Alert>
        </Snackbar>

        {error && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography>{error}</Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default SmartScan; 