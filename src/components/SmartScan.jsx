import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Button, Container, Grid, Paper, Typography, 
  CircularProgress, Snackbar, Alert, Card,
  CardContent, IconButton, Dialog, DialogContent,
  Box, LinearProgress, List, ListItem, ListItemIcon, ListItemText,
  useTheme, DialogTitle, DialogActions, TextField
} from '@mui/material';
import {
  CameraAlt as ScanIcon,
  Description as DocumentIcon,
  Science as ObjectIcon,
  Share as ShareIcon,
  Schedule as ScheduleIcon,
  CameraAlt,
  Check,
  KeyboardArrowRight,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
  PhotoLibrary as GalleryIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Upload as UploadIcon,
  Camera as CameraIcon,
  SmartToy as SmartToyIcon
} from '@mui/icons-material';
import Tesseract from 'tesseract.js';
import * as tf from '@tensorflow/tfjs';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf';
import styles from './SmartScan.module.css';
import 'pdfjs-dist/build/pdf.worker.entry';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import { DocumentAI } from './ai/DocumentAI';
import { OrganizationAI } from './ai/OrganizationAI';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
  const theme = useTheme();
  // State management
  const [scanningStatus, setScanningStatus] = useState({
    isScanning: false,
    progress: 0,
    type: null
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
  const [result, setResult] = useState(null);
  const [digitalBinder, setDigitalBinder] = useState({
    collections: [],
    activeCollection: null
  });
  const [showBinder, setShowBinder] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showStudyGroupDialog, setShowStudyGroupDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiChat, setAiChat] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [studyGroups, setStudyGroups] = useState([]);
  const [showHeallyDialog, setShowHeallyDialog] = useState(false);
  const [heallyProjects, setHeallyProjects] = useState([]);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Refs
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Load TensorFlow model on component mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        const model = await tf.loadGraphModel('/models/object_detection/model.json');
        window.tfModel = model;
      } catch (err) {
        console.error('Error loading TensorFlow model:', err);
        showNotification('Failed to load object recognition model', 'error');
      }
    };

    const fetchMaterials = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/study/materials`);
        setStudyMaterials(response.data);
      } catch (err) {
        console.error('Error fetching study materials:', err);
        showNotification('Failed to load study materials', 'error');
      }
    };

    loadModel();
    fetchMaterials();
  }, []);

  /**
   * Handles document scanning using device camera or file upload
   */
  const handleDocumentScan = async () => {
    setError(null);
    setScanningStatus({ isScanning: true, progress: 0, type: 'document' });
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

      // Process the extracted text
      const processedContent = await processScannedContent(text);
      
      // Update state with results
      setExtractedPoints(processedContent.keyPoints || extractKeyPoints(text));
      setScannedContent(text);
      setResult(processedContent);
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
      console.log('Starting document processing...');
      
      // Split text into chunks for faster processing
      const chunkSize = 1000; // Process 1000 characters at a time
      const chunks = text.match(new RegExp(`.{1,${chunkSize}}`, 'g')) || [];
      let processedContent = {
        keyPoints: [],
        summary: '',
        categories: [],
        tags: [],
        suggestions: []
      };

      // Process each chunk with progress updates
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const progress = ((i + 1) / chunks.length) * 100;
        
        // Update progress status
        setScanningStatus(prev => ({
          ...prev,
          progress: progress
        }));

        // Process chunk with DocumentAI
        const chunkAnalysis = await DocumentAI.analyzeDocument(chunk);
        
        // Merge results
        processedContent.keyPoints = [...new Set([...processedContent.keyPoints, ...chunkAnalysis.keyPoints])];
        processedContent.summary += chunkAnalysis.summary + ' ';
        
        // Process every 3 chunks with OrganizationAI to reduce API calls
        if ((i + 1) % 3 === 0 || i === chunks.length - 1) {
          const organization = await OrganizationAI.categorizeContent([{
            type: 'document',
            text: chunks.slice(Math.max(0, i - 2), i + 1).join(' '),
            id: Date.now(),
            createdAt: new Date().toISOString()
          }]);

          processedContent.categories = [...new Set([...processedContent.categories, ...organization.categories])];
          processedContent.tags = [...new Set([...processedContent.tags, ...organization.tags])];
          processedContent.suggestions = [...new Set([...processedContent.suggestions, ...organization.suggestions])];
        }
      }

      // Clean up and format results
      processedContent = {
        ...processedContent,
        keyPoints: processedContent.keyPoints.slice(0, 5), // Keep top 5 key points
        summary: processedContent.summary.trim(),
        categories: processedContent.categories.slice(0, 3), // Keep top 3 categories
        tags: processedContent.tags.slice(0, 5), // Keep top 5 tags
        suggestions: processedContent.suggestions.slice(0, 3) // Keep top 3 suggestions
      };

      console.log('Analysis complete:', processedContent);
      setProcessingStatus('complete');
      return processedContent;
    } catch (err) {
      console.error('Error processing content:', err);
      console.error('Error details:', err.response?.data || err.message);
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

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 25; // Increased margin for better readability
    const contentWidth = pageWidth - (margin * 2);
    const lineHeight = 9; // Increased for 1.5 spacing
    let y = margin;

    // Add gradient background
    const gradient = doc.setFillColor(240, 249, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Add header with logo
    doc.setFontSize(28);
    doc.setTextColor(13, 71, 161);
    doc.setFont('Times', 'bold');
    doc.text('SmartScan', margin, y);
    
    // Add subtitle
    doc.setFontSize(16);
    doc.setFont('Times', 'italic');
    doc.setTextColor(70, 90, 120);
    doc.text('by HeallyHub', margin + 90, y);
    y += lineHeight * 2;

    // Add decorative line with gradient
    doc.setDrawColor(13, 71, 161);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    y += lineHeight * 2;

    // Add timestamp with better formatting
    doc.setFontSize(10);
    doc.setFont('Times', 'normal');
    doc.setTextColor(100, 100, 100);
    const timestamp = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    doc.text(`Generated on ${timestamp}`, margin, y);
    y += lineHeight * 3;

    // Add document title
    doc.setFontSize(20);
    doc.setFont('Times', 'bold');
    doc.setTextColor(13, 71, 161);
    doc.text('Document Analysis Results', margin, y);
    y += lineHeight * 2;

    // Add key points with natural text flow
    doc.setFontSize(12);
    doc.setFont('Times', 'normal');
    doc.setTextColor(0, 0, 0);

    // Function to create natural paragraph flow
    const createParagraphFlow = (text) => {
      const words = text.split(' ');
      let currentLine = '';
      const lines = [];
      
      words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = doc.getStringUnitWidth(testLine) * doc.internal.getFontSize();
        
        if (testWidth > contentWidth) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      
      if (currentLine) {
        lines.push(currentLine);
      }
      
      return lines;
    };

    // Add introduction paragraph
    doc.setFont('Times', 'bold');
    doc.text('Key Insights:', margin, y);
    y += lineHeight * 1.5;
    doc.setFont('Times', 'normal');

    // Process each key point as a paragraph
    extractedPoints.forEach((point, index) => {
      // Add bullet point number
      doc.setFont('Times', 'bold');
      doc.text(`${index + 1}.`, margin, y);
      doc.setFont('Times', 'normal');

      // Create flowing paragraph
      const lines = createParagraphFlow(point);
      lines.forEach((line, lineIndex) => {
        if (y > pageHeight - margin * 3) {
          doc.addPage();
          y = margin;
        }
        // First line is indented differently from continuation lines
        const xPos = lineIndex === 0 ? margin + 10 : margin + 15;
        doc.text(line, xPos, y);
        y += lineHeight;
      });
      y += lineHeight; // Space between paragraphs
    });

    // Add footer with gradient
    const footerY = pageHeight - margin;
    doc.setFillColor(240, 249, 255);
    doc.rect(0, footerY - 15, pageWidth, 20, 'F');

    // Add footer text
    doc.setFontSize(8);
    doc.setTextColor(70, 90, 120);
    doc.text('Generated by SmartScan - Turning the World into Your Textbook', margin, footerY - 5);
    doc.text('© HeallyHub ' + new Date().getFullYear(), pageWidth - margin - 40, footerY - 5);

    // Save the PDF
    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`SmartScan-Analysis-${dateStr}.pdf`);
  };

  const renderScanResult = () => {
    if (!result) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Paper 
          elevation={3} 
          className={styles.resultCard}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <IconButton
            onClick={() => setResult(null)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ 
              color: 'white',
              fontWeight: 600,
              mb: 3,
              background: 'linear-gradient(45deg, #00ff9d, #00ffcc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Document Analysis Results
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#00ff9d', mb: 2 }}>
                  Key Points
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {result.keyPoints.map((point, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Paper
                        sx={{
                          p: 2,
                          background: 'rgba(0, 255, 157, 0.1)',
                          border: '1px solid rgba(0, 255, 157, 0.2)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(10px)',
                            background: 'rgba(0, 255, 157, 0.15)',
                          },
                        }}
                      >
                        <Typography sx={{ color: 'white' }}>
                          {point}
                        </Typography>
                      </Paper>
                    </motion.div>
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ color: '#00ff9d', mb: 2 }}>
                  Summary
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    background: 'rgba(0, 255, 157, 0.1)',
                    border: '1px solid rgba(0, 255, 157, 0.2)',
                  }}
                >
                  <Typography sx={{ color: 'white' }}>
                    {result.summary}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadPDF}
                    sx={{
                      background: 'linear-gradient(45deg, #00ff9d, #00ffcc)',
                      color: 'black',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #00ffcc, #00ff9d)',
                      },
                    }}
                  >
                    Download PDF
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    sx={{
                      background: 'rgba(0, 255, 157, 0.2)',
                      color: '#00ff9d',
                      '&:hover': {
                        background: 'rgba(0, 255, 157, 0.3)',
                      },
                    }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<ShareIcon />}
                    sx={{
                      background: 'rgba(0, 255, 157, 0.2)',
                      color: '#00ff9d',
                      '&:hover': {
                        background: 'rgba(0, 255, 157, 0.3)',
                      },
                    }}
                  >
                    Share
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </motion.div>
    );
  };

  const saveToDigitalBinder = async (item) => {
    try {
      // Get the current active collection
      const activeCollection = digitalBinder.activeCollection;
      
      if (!activeCollection) {
        // If no active collection, create a new one
        const newCollection = {
          id: Date.now(),
          name: `Collection ${digitalBinder.collections.length + 1}`,
          items: [item],
          createdAt: new Date().toISOString()
        };
        
        setDigitalBinder(prev => ({
          ...prev,
          collections: [...prev.collections, newCollection],
          activeCollection: newCollection.id
        }));
      } else {
        // Add item to existing collection
        setDigitalBinder(prev => ({
          ...prev,
          collections: prev.collections.map(collection => 
            collection.id === activeCollection
              ? { ...collection, items: [...collection.items, item] }
              : collection
          )
        }));
      }
      
      // Organize content using AI
      const organization = await OrganizationAI.categorizeContent(
        Object.values(digitalBinder.collections).flatMap(c => c.items)
      );
      
      // Update binder with AI suggestions
      setDigitalBinder(prev => ({
        ...prev,
        categories: organization.categories,
        tags: organization.tags,
        suggestions: organization.suggestions
      }));
    } catch (error) {
      console.error('Error saving to digital binder:', error);
      setError('Failed to save to digital binder. Please try again.');
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    // Handle dragging from preview to collection
    if (source.droppableId === 'preview') {
      const item = {
        id: Date.now(),
        text: extractedPoints[source.index],
        type: 'text',
        createdAt: new Date().toISOString()
      };
      
      const destCollection = digitalBinder.collections.find(c => c.id.toString() === destination.droppableId);
      if (destCollection) {
        setDigitalBinder(prev => ({
          ...prev,
          collections: prev.collections.map(collection =>
            collection.id.toString() === destination.droppableId
              ? {
                  ...collection,
                  items: [
                    ...collection.items.slice(0, destination.index),
                    item,
                    ...collection.items.slice(destination.index)
                  ]
                }
              : collection
          )
        }));
      }
      return;
    }

    // Handle dragging between collections
    const sourceCollection = digitalBinder.collections.find(c => c.id.toString() === source.droppableId);
    const destCollection = digitalBinder.collections.find(c => c.id.toString() === destination.droppableId);
    const [movedItem] = sourceCollection.items.splice(source.index, 1);
    
    setDigitalBinder(prev => ({
      ...prev,
      collections: prev.collections.map(collection => {
        if (collection.id.toString() === source.droppableId) {
          return {
            ...collection,
            items: collection.items.filter((_, index) => index !== source.index)
          };
        }
        if (collection.id.toString() === destination.droppableId) {
          const newItems = [...collection.items];
          newItems.splice(destination.index, 0, movedItem);
          return {
            ...collection,
            items: newItems
          };
        }
        return collection;
      })
    }));
  };

  const DigitalBinder = () => {
    return (
      <Paper
        elevation={3}
        sx={{
          mt: 4,
          p: 3,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" sx={{ 
            color: '#00ff9d',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <FolderIcon /> Digital Binder
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowFolderDialog(true)}
            sx={{
              background: 'linear-gradient(45deg, #00ff9d, #00ffcc)',
              color: 'black',
              '&:hover': {
                background: 'linear-gradient(45deg, #00ffcc, #00ff9d)',
              }
            }}
          >
            New Folder
          </Button>
        </Box>

        <Grid container spacing={3}>
          {digitalBinder.collections.map((collection) => (
            <Grid item xs={12} md={4} key={collection.id}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0, 255, 157, 0.2)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#00ff9d' }}>
                    {collection.name}
                  </Typography>
                  <IconButton size="small" sx={{ color: '#00ff9d' }}>
                    <MoreIcon />
                  </IconButton>
                </Box>

                <Droppable droppableId={collection.id.toString()}>
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                        gap: 1,
                        mb: 2,
                        minHeight: '80px',
                        background: 'rgba(0, 255, 157, 0.05)',
                        borderRadius: 1,
                        p: 1
                      }}
                    >
                      {collection.items.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                paddingTop: '100%',
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: 1,
                                background: snapshot.isDragging 
                                  ? 'rgba(0, 255, 157, 0.2)' 
                                  : 'rgba(0, 255, 157, 0.1)',
                                transform: snapshot.isDragging ? 'scale(1.05)' : 'scale(1)',
                                transition: 'all 0.2s ease',
                                cursor: 'grab',
                                '&:active': {
                                  cursor: 'grabbing'
                                }
                              }}
                            >
                              {item.type === 'text' ? (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    p: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    fontSize: '0.8rem',
                                    color: 'white',
                                    overflow: 'hidden'
                                  }}
                                >
                                  {item.text}
                                </Box>
                              ) : (
                                <img
                                  src={item.image}
                                  alt=""
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                              )}
                            </Box>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {collection.items.length} items
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<GalleryIcon />}
                    sx={{ color: '#00ff9d' }}
                    onClick={() => setSelectedFolder(collection)}
                  >
                    View All
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  };

  const handleScan = async () => {
    if (!file) return;
    
    setScanning(true);
    try {
      // Process the file
      await handleFileSelect({ target: { files: [file] } });
    } catch (error) {
      console.error('Scan failed:', error);
      setError('Failed to process the file. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(uploadedFile);
    }
  };

  const createStudyGroup = () => {
    if (!newGroupName.trim()) return;
    
    const newGroup = {
      id: Date.now(),
      name: newGroupName,
      members: [],
      collections: [],
      createdAt: new Date().toISOString()
    };
    
    setStudyGroups(prev => [...prev, newGroup]);
    setNewGroupName('');
    setShowStudyGroupDialog(false);
  };

  const shareCollectionWithGroup = (collectionId, groupId) => {
    setStudyGroups(prev => prev.map(group => 
      group.id === groupId
        ? { ...group, collections: [...group.collections, collectionId] }
        : group
    ));
  };

  const handleAIAssistantChat = async () => {
    if (!userInput.trim()) return;

    const userMessage = {
      type: 'user',
      content: userInput,
      timestamp: new Date().toISOString()
    };

    setAiChat(prev => [...prev, userMessage]);
    setUserInput('');

    // Simulate AI response
    const aiResponse = {
      type: 'ai',
      content: `I understand you're interested in ${userInput}. Let me help you with that. Would you like to:
        1. View specific content from your collections?
        2. Get study recommendations?
        3. Create a new study group?
        4. Generate practice questions?`,
      timestamp: new Date().toISOString()
    };

    setTimeout(() => {
      setAiChat(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const PreviewDialog = ({ open, onClose, scannedContent, extractedPoints, onSaveToCollection }) => {
    return (
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
      >
        <DialogContent>
          {scannedContent && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{
                color: '#00ff9d',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #00ff9d, #00ffcc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Extracted Key Points
              </Typography>
              <Droppable droppableId="preview">
                {(provided) => (
                  <List
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      minHeight: '100px',
                      background: 'rgba(0, 255, 157, 0.05)',
                      borderRadius: 1,
                      p: 1
                    }}
                  >
                    {extractedPoints.map((point, index) => (
                      <Draggable key={index} draggableId={`preview-${index}`} index={index}>
                        {(provided, snapshot) => (
                          <ListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              background: snapshot.isDragging 
                                ? 'rgba(0, 255, 157, 0.2)' 
                                : 'rgba(0, 255, 157, 0.1)',
                              borderRadius: 1,
                              mb: 1,
                              cursor: 'grab',
                              '&:active': {
                                cursor: 'grabbing'
                              },
                              transform: snapshot.isDragging ? 'scale(1.02)' : 'scale(1)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <ListItemIcon>
                              <KeyboardArrowRight sx={{ color: '#00ff9d' }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={point}
                              sx={{
                                '& .MuiListItemText-primary': {
                                  color: 'white'
                                }
                              }}
                            />
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadPDF}
                  sx={{
                    background: 'linear-gradient(45deg, #00ff9d, #00ffcc)',
                    color: 'black',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #00ffcc, #00ff9d)',
                    },
                  }}
                >
                  Download PDF
                </Button>
                <Button
                  variant="contained"
                  startIcon={<ShareIcon />}
                  onClick={handleShare}
                  sx={{
                    background: 'rgba(0, 255, 157, 0.2)',
                    color: '#00ff9d',
                    '&:hover': {
                      background: 'rgba(0, 255, 157, 0.3)',
                    },
                  }}
                >
                  Share with Study Group
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  const fetchHeallyProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/heally/projects`);
      setHeallyProjects(response.data);
    } catch (err) {
      console.error('Error fetching HEALLY projects:', err);
      showNotification('Failed to load HEALLY projects', 'error');
    }
  };

  const sendToHeally = async (projectId) => {
    try {
      await axios.post(`${API_BASE_URL}/heally/share`, {
        projectId,
        content: scannedContent,
        analysis: result
      });
      showNotification('Content sent to HEALLY successfully', 'success');
      setShowHeallyDialog(false);
    } catch (err) {
      console.error('Error sending to HEALLY:', err);
      showNotification('Failed to send content to HEALLY', 'error');
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      const response = await axios.post(`${API_BASE_URL}/folders`, {
        name: newFolderName,
        description: '',
        createdAt: new Date().toISOString()
      });
      
      setDigitalBinder(prev => ({
        ...prev,
        collections: [...prev.collections, response.data]
      }));
      
      setNewFolderName('');
      setShowFolderDialog(false);
      showNotification('Folder created successfully', 'success');
    } catch (err) {
      console.error('Error creating folder:', err);
      showNotification('Failed to create folder', 'error');
    }
  };

  const handleFileView = (file) => {
    setSelectedFile(file);
    setShowFileViewer(true);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Container maxWidth="lg" className={styles.container}>
        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Paper className={styles.mainContent}>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                  <Typography 
                    variant="h2" 
                    component="h1" 
                    sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(45deg, #2196F3 30%, #00ff9d 90%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 0 20px rgba(33, 150, 243, 0.3)',
                      animation: 'glow 1.5s ease-in-out infinite alternate',
                      '@keyframes glow': {
                        from: {
                          textShadow: '0 0 10px rgba(33, 150, 243, 0.3), 0 0 20px rgba(33, 150, 243, 0.3), 0 0 30px rgba(33, 150, 243, 0.3)'
                        },
                        to: {
                          textShadow: '0 0 20px rgba(33, 150, 243, 0.5), 0 0 30px rgba(33, 150, 243, 0.5), 0 0 40px rgba(33, 150, 243, 0.5)'
                        }
                      }
                    }}
                  >
                    Welcome to SmartScan
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mt: 2, 
                      color: 'text.secondary',
                      fontStyle: 'italic',
                      opacity: 0.9
                    }}
                  >
                    Turning the World into Your Digital Textbook, One Scan at a Time
                  </Typography>
                </Box>
              </motion.div>

              {/* Upload Area */}
              <Paper 
                elevation={3}
                sx={{
                  p: 3,
                  background: 'rgba(42, 42, 42, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  {/* Upload Area */}
                  <Box
                    sx={{
                      width: '100%',
                      height: 300,
                      border: '2px dashed rgba(0, 255, 157, 0.3)',
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#00ff9d',
                        background: 'rgba(0, 255, 157, 0.05)',
                      },
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    component="label"
                  >
                    <input
                      type="file"
                      hidden
                      onChange={handleFileUpload}
                      accept="image/*,.pdf"
                    />
                    
                    {preview ? (
                      <Box
                        component="img"
                        src={preview}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      <>
                        <UploadIcon sx={{ fontSize: 48, color: '#00ff9d', mb: 2 }} />
                        <Typography variant="h6" color="primary">
                          Drop files here or click to upload
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Supports PDF and image files
                        </Typography>
                      </>
                    )}
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      startIcon={<UploadIcon />}
                      component="label"
                      sx={{
                        background: 'linear-gradient(45deg, #00ff9d, #00ffcc)',
                        color: 'black',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #00ffcc, #00ff9d)',
                        },
                      }}
                    >
                      Upload File
                      <input
                        type="file"
                        hidden
                        onChange={handleFileUpload}
                        accept="image/*,.pdf"
                      />
                    </Button>
                    
                    <Button
                      variant="contained"
                      startIcon={<CameraIcon />}
                      onClick={() => {/* Camera functionality will be added */}}
                      sx={{
                        background: 'linear-gradient(45deg, #00ff9d, #00ffcc)',
                        color: 'black',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #00ffcc, #00ff9d)',
                        },
                      }}
                    >
                      Use Camera
                    </Button>
                  </Box>

                  {/* Scan Button */}
                  {file && (
                    <Button
                      variant="contained"
                      onClick={handleScan}
                      disabled={scanning}
                      sx={{
                        width: '100%',
                        py: 1.5,
                        background: scanning ? 'grey' : 'linear-gradient(45deg, #00ff9d, #00ffcc)',
                        color: 'black',
                        '&:hover': {
                          background: scanning ? 'grey' : 'linear-gradient(45deg, #00ffcc, #00ff9d)',
                        },
                      }}
                    >
                      {scanning ? (
                        <>
                          <CircularProgress size={24} sx={{ mr: 1 }} />
                          Analyzing...
                        </>
                      ) : (
                        'Start Analysis'
                      )}
                    </Button>
                  )}
                </Box>
              </Paper>

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
              <PreviewDialog 
                open={showPreview}
                onClose={() => setShowPreview(false)}
                scannedContent={scannedContent}
                extractedPoints={extractedPoints}
                onSaveToCollection={(item) => {
                  const activeCollection = digitalBinder.collections.find(c => c.id === digitalBinder.activeCollection);
                  if (activeCollection) {
                    setDigitalBinder(prev => ({
                      ...prev,
                      collections: prev.collections.map(collection =>
                        collection.id === activeCollection.id
                          ? { ...collection, items: [...collection.items, item] }
                          : collection
                      )
                    }));
                  }
                }}
              />

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

              {/* Digital Binder */}
              <Box className={styles.binderSection}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Digital Binder
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowFolderDialog(true)}
                    sx={{
                      background: 'linear-gradient(45deg, #00ff9d, #00ffcc)',
                      color: 'black',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #00ffcc, #00ff9d)',
                      },
                    }}
                  >
                    New Folder
                  </Button>
                </Box>
                
                <Droppable droppableId="binder">
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={styles.binderContent}
                    >
                      {digitalBinder.collections.map((collection, index) => (
                        <Draggable
                          key={collection.id}
                          draggableId={collection.id}
                          index={index}
                        >
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={styles.collectionCard}
                              onClick={() => setSelectedFolder(collection)}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" sx={{ color: '#00ff9d' }}>
                                  {collection.name}
                                </Typography>
                                <IconButton size="small" sx={{ color: '#00ff9d' }}>
                                  <MoreIcon />
                                </IconButton>
                              </Box>

                              <Droppable droppableId={collection.id.toString()}>
                                {(provided) => (
                                  <Box
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={styles.folderContent}
                                  >
                                    {collection.items.map((item, index) => (
                                      <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                                        {(provided, snapshot) => (
                                          <Box
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={styles.fileItem}
                                            onClick={() => handleFileView(item)}
                                          >
                                            {item.type === 'text' ? (
                                              <Box className={styles.textPreview}>
                                                {item.text}
                                              </Box>
                                            ) : (
                                              <img
                                                src={item.image}
                                                alt=""
                                                className={styles.filePreview}
                                              />
                                            )}
                                          </Box>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                  </Box>
                                )}
                              </Droppable>

                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {collection.items.length} items
                                </Typography>
                                <Button
                                  size="small"
                                  startIcon={<GalleryIcon />}
                                  sx={{ color: '#00ff9d' }}
                                  onClick={() => setSelectedFolder(collection)}
                                >
                                  View All
                                </Button>
                              </Box>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Box>
            </Paper>
          </Grid>
          
          {/* Study Group Dialog */}
          <Grid item xs={12} md={4}>
            <Paper className={styles.studyGroupSection}>
              <Typography variant="h6" gutterBottom sx={{ color: '#00ff9d' }}>
                HEALLY Integration
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Send your scanned content to HEALLY for enhanced learning and collaboration
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  setShowHeallyDialog(true);
                  fetchHeallyProjects();
                }}
                startIcon={<ShareIcon />}
                sx={{ 
                  width: '100%',
                  background: 'linear-gradient(45deg, #00ff9d, #00ffcc)',
                  color: 'black',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #00ffcc, #00ff9d)',
                  },
                }}
              >
                Send to HEALLY
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* AI Assistant Dialog */}
        <Dialog 
          open={showAIAssistant} 
          onClose={() => setShowAIAssistant(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <SmartToyIcon sx={{ mr: 1, color: '#00ff88' }} />
              AI Study Assistant
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ height: 400, overflowY: 'auto', mb: 2 }}>
              {aiChat.map((message, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '70%',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: message.type === 'user' ? 'primary.main' : 'background.paper',
                      color: message.type === 'user' ? 'white' : 'text.primary',
                      boxShadow: 1
                    }}
                  >
                    <Typography variant="body1">{message.content}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            <Box display="flex" gap={1}>
              <TextField
                fullWidth
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask me anything about your study materials..."
                onKeyPress={(e) => e.key === 'Enter' && handleAIAssistantChat()}
              />
              <Button
                variant="contained"
                onClick={handleAIAssistantChat}
                sx={{ bgcolor: '#00ff88', '&:hover': { bgcolor: '#00cc6a' } }}
              >
                Send
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Add AI Assistant button to the toolbar */}
        <Box sx={{ position: 'fixed', bottom: 20, right: 20 }}>
          <Button
            variant="contained"
            onClick={() => setShowAIAssistant(true)}
            sx={{
              bgcolor: '#00ff88',
              '&:hover': { bgcolor: '#00cc6a' },
              borderRadius: '50%',
              width: 56,
              height: 56,
              minWidth: 0
            }}
          >
            <SmartToyIcon />
          </Button>
        </Box>

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

        <AnimatePresence>
          {scanningStatus.isScanning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Paper
                elevation={3}
                sx={{
                  mt: 4,
                  p: 4,
                  textAlign: 'center',
                  position: 'relative',
                  background: 'rgba(19, 47, 76, 0.8)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <CircularProgress
                  variant="determinate"
                  value={scanningStatus.progress}
                  size={80}
                  thickness={4}
                  sx={{ 
                    color: 'primary.main',
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    },
                  }}
                />
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                  Scanning {scanningStatus.type === 'document' ? 'Document' : 'Object'}...
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {scanningStatus.progress}% Complete
                </Typography>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {result && renderScanResult()}
        </AnimatePresence>

        {/* Replace Study Group Dialog with HEALLY Dialog */}
        <Dialog 
          open={showHeallyDialog} 
          onClose={() => setShowHeallyDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center">
              <ShareIcon sx={{ mr: 1, color: '#00ff9d' }} />
              Send to HEALLY
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Select a HEALLY Project
              </Typography>
              <List>
                {heallyProjects.map((project) => (
                  <ListItem
                    key={project.id}
                    button
                    onClick={() => sendToHeally(project.id)}
                    sx={{
                      mb: 1,
                      borderRadius: 1,
                      '&:hover': {
                        background: 'rgba(0, 255, 157, 0.1)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <FolderIcon sx={{ color: '#00ff9d' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={project.name}
                      secondary={`Last updated: ${new Date(project.updatedAt).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Add Folder Dialog */}
        <Dialog open={showFolderDialog} onClose={() => setShowFolderDialog(false)}>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Folder Name"
              fullWidth
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowFolderDialog(false)}>Cancel</Button>
            <Button onClick={createFolder} color="primary">Create</Button>
          </DialogActions>
        </Dialog>

        {/* Add File Viewer Dialog */}
        <Dialog
          open={showFileViewer}
          onClose={() => setShowFileViewer(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">File Preview</Typography>
              <IconButton onClick={() => setShowFileViewer(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedFile && (
              <Box sx={{ mt: 2 }}>
                {selectedFile.type === 'text' ? (
                  <Paper sx={{ p: 2, maxHeight: '60vh', overflow: 'auto' }}>
                    <Typography>{selectedFile.text}</Typography>
                  </Paper>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <img
                      src={selectedFile.image}
                      alt=""
                      style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }}
                    />
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </DragDropContext>
  );
};

export default SmartScan; 