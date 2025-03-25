import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import CameraInterface from './components/CameraInterface';
import AnalysisInterface from './components/AnalysisInterface';
import DigitalBinder from './components/DigitalBinder';
import './App.css';

function App() {
  const navigate = useNavigate();
  const [capturedImage, setCapturedImage] = useState(null);
  const [documents, setDocuments] = useState([]);

  const handleCapture = (image) => {
    setCapturedImage(image);
    navigate('/analysis');
  };

  const handleClose = () => {
    navigate('/');
  };

  const handleSaveDocument = (document) => {
    setDocuments(prev => [...prev, {
      id: Date.now(),
      title: document.title || 'Untitled Document',
      subject: document.subject || 'Uncategorized',
      date: new Date().toISOString(),
      thumbnail: document.image,
      content: document.content
    }]);
    navigate('/library');
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={
          <div className="smartscan-banner">
            <h1>SmartScan</h1>
            <p>Scan, analyze, and organize your study materials with AI</p>
            <div className="banner-buttons">
              <button onClick={() => navigate('/scan')} className="primary-btn">Start Scanning</button>
              <button onClick={() => navigate('/library')} className="secondary-btn">View Library</button>
            </div>
          </div>
        } />
        <Route path="/scan" element={
          <CameraInterface 
            onCapture={handleCapture}
            onClose={handleClose}
          />
        } />
        <Route path="/analysis" element={
          <AnalysisInterface 
            image={capturedImage}
            onClose={() => navigate('/')}
            onSave={handleSaveDocument}
          />
        } />
        <Route path="/library" element={
          <DigitalBinder 
            documents={documents}
            onClose={() => navigate('/')}
          />
        } />
      </Routes>
    </div>
  );
}

export default App;
