import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './SmartCan.module.css';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * SmartCan Component
 * A real-time dashboard for monitoring SmartCan status and metrics
 */
const SmartCan = () => {
  // State management for SmartCan data and UI interactions
  const [canStatus, setCanStatus] = useState({
    fullness: 0,
    lastEmptied: null,
    nextPickup: null,
    location: 'Loading...',
    temperature: 0,
    humidity: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isHoveringFill, setIsHoveringFill] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetches current SmartCan status from the backend
   * Updates the local state with the received data
   */
  const fetchCanData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/smartcan/status`);
      setCanStatus(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching can data:', err);
      setError('Failed to fetch SmartCan data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time data updates
  useEffect(() => {
    fetchCanData();
    const interval = setInterval(fetchCanData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  /**
   * Handles card click events to show detailed information
   * @param {string} cardType - The type of card that was clicked
   */
  const handleCardClick = (cardType) => {
    setSelectedCard(cardType);
    setShowDetails(true);
  };

  /**
   * Closes the details modal and resets selection
   */
  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedCard(null);
  };

  /**
   * Updates hover state for info cards
   * @param {string} cardType - The type of card being hovered
   */
  const handleCardHover = (cardType) => {
    setHoveredCard(cardType);
  };

  /**
   * Updates hover state for fill level indicator
   * @param {boolean} isHovering - Whether the fill level is being hovered
   */
  const handleFillHover = (isHovering) => {
    setIsHoveringFill(isHovering);
  };

  /**
   * Updates SmartCan status on the backend
   * @param {Object} updates - The updates to apply to the SmartCan status
   */
  const handleUpdateStatus = async (updates) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/smartcan/update`, updates);
      setCanStatus(response.data);
      setError(null);
    } catch (err) {
      console.error('Error updating can status:', err);
      setError('Failed to update SmartCan status. Please try again.');
    }
  };

  /**
   * Renders the loading animation overlay
   */
  const renderLoadingAnimation = () => (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}></div>
      <p className={styles.loadingText}>Loading SmartCan data...</p>
      <div className={styles.loadingDots}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );

  /**
   * Renders the error state with retry functionality
   */
  const renderError = () => (
    <div className={styles.errorContainer}>
      <div className={styles.errorIcon}>⚠️</div>
      <p>{error}</p>
      <button onClick={fetchCanData} className={styles.retryButton}>
        Retry
      </button>
    </div>
  );

  /**
   * Renders the details modal with information about the selected card
   */
  const renderDetailsModal = () => {
    if (!showDetails || !selectedCard) return null;

    /**
     * Returns the content configuration for the selected card type
     */
    const getDetailsContent = () => {
      switch (selectedCard) {
        case 'lastEmptied':
          return {
            title: 'Last Emptied Details',
            content: `Last emptied on ${new Date(canStatus.lastEmptied).toLocaleString()}`,
            icon: '🗑️',
            color: '#4CAF50'
          };
        case 'nextPickup':
          return {
            title: 'Next Pickup Schedule',
            content: `Scheduled for ${new Date(canStatus.nextPickup).toLocaleString()}`,
            icon: '📅',
            color: '#2196F3'
          };
        case 'temperature':
          return {
            title: 'Temperature Analysis',
            content: `Current temperature: ${canStatus.temperature}°C\nOptimal range: 20-25°C`,
            icon: '🌡️',
            color: '#FF9800'
          };
        case 'humidity':
          return {
            title: 'Humidity Analysis',
            content: `Current humidity: ${canStatus.humidity}%\nOptimal range: 40-60%`,
            icon: '💧',
            color: '#00BCD4'
          };
        default:
          return null;
      }
    };

    const details = getDetailsContent();
    if (!details) return null;

    return (
      <div className={styles.modalOverlay} onClick={handleCloseDetails}>
        <div 
          className={styles.modalContent} 
          onClick={e => e.stopPropagation()}
          style={{ borderColor: details.color }}
        >
          <button className={styles.closeButton} onClick={handleCloseDetails}>×</button>
          <div className={styles.modalIcon} style={{ color: details.color }}>{details.icon}</div>
          <h2>{details.title}</h2>
          <p>{details.content}</p>
        </div>
      </div>
    );
  };

  // Main component render
  return (
    <div className={styles.smartCanContainer}>
      {/* Header section with title and location */}
      <div className={styles.header}>
        <h1 className={styles.animatedTitle}>SmartCan Dashboard</h1>
        <div className={styles.location}>
          <span className={styles.locationIcon}>📍</span>
          <span>{canStatus.location}</span>
        </div>
      </div>

      {/* Main content section */}
      {error ? (
        renderError()
      ) : (
        <div className={styles.mainContent}>
          {/* Fill level indicator card */}
          <div className={styles.statusCard}>
            <h2>Fill Level</h2>
            <div 
              className={styles.fillLevelContainer}
              onMouseEnter={() => handleFillHover(true)}
              onMouseLeave={() => handleFillHover(false)}
            >
              <div 
                className={`${styles.fillLevelBar} ${isLoading ? styles.loading : ''} ${isHoveringFill ? styles.hovered : ''}`}
                style={{ height: `${canStatus.fullness}%` }}
              />
              <span className={`${styles.fillPercentage} ${isHoveringFill ? styles.hovered : ''}`}>
                {canStatus.fullness}%
              </span>
              {isHoveringFill && (
                <div className={styles.fillTooltip}>
                  Current Fill Level
                </div>
              )}
            </div>
          </div>

          {/* Information cards grid */}
          <div className={styles.infoGrid}>
            {/* Last Emptied Card */}
            <div 
              className={`${styles.infoCard} ${selectedCard === 'lastEmptied' ? styles.selected : ''} ${hoveredCard === 'lastEmptied' ? styles.hovered : ''}`}
              onClick={() => handleCardClick('lastEmptied')}
              onMouseEnter={() => handleCardHover('lastEmptied')}
              onMouseLeave={() => handleCardHover(null)}
            >
              <div className={styles.cardIcon}>🗑️</div>
              <h3>Last Emptied</h3>
              <p>{new Date(canStatus.lastEmptied).toLocaleString()}</p>
              <div className={styles.cardHoverEffect}></div>
            </div>

            {/* Next Pickup Card */}
            <div 
              className={`${styles.infoCard} ${selectedCard === 'nextPickup' ? styles.selected : ''} ${hoveredCard === 'nextPickup' ? styles.hovered : ''}`}
              onClick={() => handleCardClick('nextPickup')}
              onMouseEnter={() => handleCardHover('nextPickup')}
              onMouseLeave={() => handleCardHover(null)}
            >
              <div className={styles.cardIcon}>📅</div>
              <h3>Next Pickup</h3>
              <p>{new Date(canStatus.nextPickup).toLocaleString()}</p>
              <div className={styles.cardHoverEffect}></div>
            </div>

            {/* Temperature Card */}
            <div 
              className={`${styles.infoCard} ${selectedCard === 'temperature' ? styles.selected : ''} ${hoveredCard === 'temperature' ? styles.hovered : ''}`}
              onClick={() => handleCardClick('temperature')}
              onMouseEnter={() => handleCardHover('temperature')}
              onMouseLeave={() => handleCardHover(null)}
            >
              <div className={styles.cardIcon}>🌡️</div>
              <h3>Temperature</h3>
              <p>{canStatus.temperature}°C</p>
              <div className={styles.cardHoverEffect}></div>
            </div>

            {/* Humidity Card */}
            <div 
              className={`${styles.infoCard} ${selectedCard === 'humidity' ? styles.selected : ''} ${hoveredCard === 'humidity' ? styles.hovered : ''}`}
              onClick={() => handleCardClick('humidity')}
              onMouseEnter={() => handleCardHover('humidity')}
              onMouseLeave={() => handleCardHover(null)}
            >
              <div className={styles.cardIcon}>💧</div>
              <h3>Humidity</h3>
              <p>{canStatus.humidity}%</p>
              <div className={styles.cardHoverEffect}></div>
            </div>
          </div>
        </div>
      )}

      {/* Loading and Modal Overlays */}
      {isLoading && renderLoadingAnimation()}
      {renderDetailsModal()}
    </div>
  );
};

export default SmartCan; 