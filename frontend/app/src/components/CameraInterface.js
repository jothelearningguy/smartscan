import React, { useState, useRef } from 'react';
import './CameraInterface.css';

const CameraInterface = ({ onClose, onCapture }) => {
  const [isCapturing, setIsCapturing] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  React.useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
      const image = canvas.toDataURL('image/jpeg');
      setCapturedImage(image);
      setIsCapturing(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setIsCapturing(true);
    startCamera();
  };

  const analyze = () => {
    onCapture(capturedImage);
  };

  return (
    <div className="camera-interface">
      <div className="camera-container">
        {isCapturing ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-preview"
            />
            <div className="camera-controls">
              <button className="capture-btn" onClick={captureImage}>
                <span className="capture-btn-inner" />
              </button>
            </div>
          </>
        ) : (
          <div className="captured-view">
            <img src={capturedImage} alt="Captured" className="captured-image" />
            <div className="analysis-options">
              <button className="option-btn retake" onClick={retake}>
                Retake
              </button>
              <button className="option-btn analyze" onClick={analyze}>
                Analyze with HeallyAI
              </button>
            </div>
          </div>
        )}
      </div>
      <button className="close-btn" onClick={onClose}>×</button>
    </div>
  );
};

export default CameraInterface; 