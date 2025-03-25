import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AnalysisInterface.css';

const AnalysisInterface = ({ image, onClose, onSave }) => {
  const navigate = useNavigate();
  const [analysisType, setAnalysisType] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentSubject, setDocumentSubject] = useState('');
  const [documentCourse, setDocumentCourse] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [documentTags, setDocumentTags] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [flashcardFront, setFlashcardFront] = useState('');
  const [flashcardBack, setFlashcardBack] = useState('');

  const handleAnalyze = (type) => {
    setAnalysisType(type);
    setIsAnalyzing(true);
    // Simulate analysis - replace with actual API call
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  const startChat = () => {
    setChatMode(true);
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setChatMessages([...chatMessages, { type: 'user', content: chatMessage }]);
      setChatMessage('');
      // Simulate AI response - replace with actual API call
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          type: 'ai',
          content: 'I understand your question. Let me help you with that...'
        }]);
      }, 1000);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        title: documentTitle || 'Untitled Document',
        subject: documentSubject || 'Uncategorized',
        course: documentCourse || 'General',
        description: documentDescription,
        tags: documentTags.split(',').map(tag => tag.trim()).filter(tag => tag),
        image: image,
        content: 'Document content will be added here'
      });
    }
  };

  const handleCreateFlashcard = () => {
    // Handle flashcard creation - replace with actual API call
    console.log('Creating flashcard:', { front: flashcardFront, back: flashcardBack });
    setFlashcardFront('');
    setFlashcardBack('');
  };

  return (
    <div className="analysis-interface">
      <div className="analysis-container">
        <div className="image-preview">
          <img src={image} alt="Captured" />
        </div>

        {!analysisType && !chatMode && (
          <div className="analysis-options">
            <h2>What would you like to do?</h2>
            <div className="option-buttons">
              <button onClick={() => handleAnalyze('store')} className="option-btn store">
                <span className="icon">📁</span>
                Store & Organize
                <span className="description">Save to your study materials</span>
              </button>
              <button onClick={() => handleAnalyze('learn')} className="option-btn learn">
                <span className="icon">🎯</span>
                Start Learning Journey
                <span className="description">Create flashcards and study path</span>
              </button>
              <button onClick={startChat} className="option-btn chat">
                <span className="icon">💬</span>
                Chat with HeallyAI
                <span className="description">Get instant study help</span>
              </button>
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="analyzing-state">
            <div className="loader"></div>
            <p>Analyzing with HeallyAI...</p>
          </div>
        )}

        {chatMode && (
          <div className="chat-interface">
            <div className="chat-messages">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`message ${msg.type}`}>
                  {msg.content}
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type your question..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>
        )}

        {analysisType === 'store' && !isAnalyzing && (
          <div className="analysis-results">
            <h2>Document Organized!</h2>
            <div className="document-details">
              <div className="form-group">
                <label>Document Title</label>
                <input
                  type="text"
                  placeholder="Enter a descriptive title"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Course</label>
                <input
                  type="text"
                  placeholder="Enter course name (e.g., Biology 101)"
                  value={documentCourse}
                  onChange={(e) => setDocumentCourse(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Subject/Topic</label>
                <input
                  type="text"
                  placeholder="Enter subject or topic"
                  value={documentSubject}
                  onChange={(e) => setDocumentSubject(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Add a brief description of the document..."
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g., lecture notes, chapter 5, important"
                  value={documentTags}
                  onChange={(e) => setDocumentTags(e.target.value)}
                />
              </div>
            </div>
            <div className="result-actions">
              <button className="action-btn" onClick={handleSave}>
                Save to Library
              </button>
              <button className="action-btn secondary" onClick={() => setAnalysisType(null)}>
                New Analysis
              </button>
            </div>
          </div>
        )}

        {analysisType === 'learn' && !isAnalyzing && (
          <div className="learning-journey">
            <h2>Create Your Learning Journey</h2>
            <div className="learning-steps">
              <div className="learning-step">
                <h3>1. Key Concepts</h3>
                <p>Identify the main concepts and ideas from your document</p>
              </div>
              <div className="learning-step">
                <h3>2. Create Flashcards</h3>
                <p>Generate flashcards to test your understanding</p>
              </div>
              <div className="learning-step">
                <h3>3. Study Path</h3>
                <p>Follow a personalized study path to master the material</p>
              </div>
            </div>
            <div className="flashcard-preview">
              <h3>Create a Flashcard</h3>
              <div className="flashcard-content">
                <div className="flashcard-side">
                  <label>Front</label>
                  <textarea
                    placeholder="Enter the question or concept..."
                    value={flashcardFront}
                    onChange={(e) => setFlashcardFront(e.target.value)}
                  />
                </div>
                <div className="flashcard-side">
                  <label>Back</label>
                  <textarea
                    placeholder="Enter the answer or explanation..."
                    value={flashcardBack}
                    onChange={(e) => setFlashcardBack(e.target.value)}
                  />
                </div>
              </div>
              <div className="flashcard-actions">
                <button onClick={handleCreateFlashcard}>Create Flashcard</button>
                <button onClick={() => setAnalysisType(null)}>Start Over</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <button className="close-btn" onClick={onClose}>×</button>
    </div>
  );
};

export default AnalysisInterface; 