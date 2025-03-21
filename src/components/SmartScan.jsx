import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Button, Container, Grid, Paper, Typography, 
  CircularProgress, Snackbar, Alert, Card,
  CardContent, IconButton, Dialog, DialogContent 
} from '@mui/material';
import {
  CameraAlt as ScanIcon,
  Description as DocumentIcon,
  Science as ObjectIcon,
  Share as ShareIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import Tesseract from 'tesseract.js';
import * as tf from '@tensorflow/tfjs';
import styles from './SmartScan.module.css';

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
  const handleDocumentScan = async (file) => {
    setScanningStatus({ isScanning: true, progress: 0, type: 'document' });
    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setScanningStatus(prev => ({
              ...prev,
              progress: m.progress * 100
            }));
          }
        }
      });

      const processedContent = await processScannedContent(result.data.text);
      setScannedContent(processedContent);
      setShowPreview(true);
    } catch (err) {
      console.error('Error scanning document:', err);
      showNotification('Failed to scan document', 'error');
    } finally {
      setScanningStatus({ isScanning: false, progress: 0, type: null });
    }
  };

  /**
   * Handles object scanning using device camera
   */
  const handleObjectScan = async () => {
    setScanningStatus({ isScanning: true, progress: 0, type: 'object' });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      await new Promise(resolve => videoRef.current.onloadedmetadata = resolve);
      
      // Capture frame and analyze
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Process with TensorFlow
      const tensor = tf.browser.fromPixels(imageData);
      const predictions = await window.tfModel.predict(tensor);
      
      // Process results
      const processedContent = await processObjectRecognition(predictions);
      setScannedContent(processedContent);
      setShowPreview(true);

      // Clean up
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error('Error scanning object:', err);
      showNotification('Failed to scan object', 'error');
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
  const processObjectRecognition = async (predictions) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/scan/object/analyze`, { predictions });
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
    <Container className={styles.smartScanContainer}>
      <Typography variant="h4" component="h1" gutterBottom>
        SmartScan
      </Typography>

      {/* Scanning Options */}
      <Grid container spacing={3} className={styles.scanOptions}>
        <Grid item xs={12} md={6}>
          <Paper className={styles.scanOption}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,.pdf"
              style={{ display: 'none' }}
              onChange={(e) => handleDocumentScan(e.target.files[0])}
            />
            <Button
              variant="contained"
              startIcon={<DocumentIcon />}
              onClick={() => fileInputRef.current.click()}
              disabled={scanningStatus.isScanning}
            >
              Scan Document
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper className={styles.scanOption}>
            <Button
              variant="contained"
              startIcon={<ObjectIcon />}
              onClick={handleObjectScan}
              disabled={scanningStatus.isScanning}
            >
              Scan Object
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Scanning Progress */}
      {scanningStatus.isScanning && (
        <Paper className={styles.progress}>
          <CircularProgress variant="determinate" value={scanningStatus.progress} />
          <Typography>
            {scanningStatus.type === 'document' ? 'Scanning document...' : 'Analyzing object...'}
          </Typography>
        </Paper>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onClose={() => setShowPreview(false)} maxWidth="md" fullWidth>
        <DialogContent>
          {scannedContent && (
            <div className={styles.previewContent}>
              <Typography variant="h6">Scanned Content</Typography>
              <pre>{JSON.stringify(scannedContent, null, 2)}</pre>
              <Button
                variant="contained"
                startIcon={<ShareIcon />}
                onClick={handleShare}
                className={styles.shareButton}
              >
                Share with Study Group
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Study Materials */}
      <Grid container spacing={3} className={styles.materials}>
        {studyMaterials.map((material, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h6">{material.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {material.category}
                </Typography>
                <Typography variant="body2">
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
    </Container>
  );
};

export default SmartScan; 