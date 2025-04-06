import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/DigitalBinder.css';

const DigitalBinder = ({ documents, onClose }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [showNotes, setShowNotes] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [notes, setNotes] = useState({});

  const tabs = [
    { id: 'all', label: 'All Documents' },
    { id: 'recent', label: 'Recently Added' },
    { id: 'courses', label: 'By Course' }
  ];

  // Get unique courses from documents
  const courses = ['all', ...new Set(documents.map(doc => doc.course))];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || doc.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const handleViewDocument = (doc) => {
    setSelectedDoc(doc);
    setShowNotes(true);
  };

  const handleSaveNotes = (docId, newNotes) => {
    setNotes(prev => ({
      ...prev,
      [docId]: newNotes
    }));
    setShowNotes(false);
  };

  return (
    <div className="digital-binder">
      <div className="binder-container">
        <div className="binder-spine">
          <div className="spine-label">My Study Materials</div>
          <div className="spine-rings">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="ring" />
            ))}
          </div>
        </div>
        
        <div className="binder-content">
          <div className="binder-header">
            <h1>Digital Study Binder</h1>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          <div className="binder-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'courses' && (
            <div className="course-filter">
              <select 
                value={selectedCourse} 
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="course-select"
              >
                {courses.map(course => (
                  <option key={course} value={course}>
                    {course === 'all' ? 'All Courses' : course}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search your documents..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="add-document" onClick={() => navigate('/scan')}>
              <span>+</span> Add Document
            </button>
          </div>

          <div className="documents-grid">
            {filteredDocuments.map(doc => (
              <div key={doc.id} className="document-card">
                <div className="document-preview">
                  <img src={doc.thumbnail} alt={doc.title} />
                </div>
                <div className="document-info">
                  <h3>{doc.title}</h3>
                  <span className="course-tag">{doc.course}</span>
                  <span className="subject">{doc.subject}</span>
                  <span className="date">{new Date(doc.date).toLocaleDateString()}</span>
                </div>
                <div className="document-actions">
                  <button className="action-btn view" onClick={() => handleViewDocument(doc)}>View & Notes</button>
                  <button className="action-btn edit">Edit</button>
                </div>
              </div>
            ))}

            <div className="document-card add-card" onClick={() => navigate('/scan')}>
              <div className="add-document-placeholder">
                <span className="plus">+</span>
                <span className="text">Scan New Document</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showNotes && selectedDoc && (
        <div className="notes-modal">
          <div className="notes-content">
            <div className="notes-header">
              <h2>{selectedDoc.title}</h2>
              <button className="close-btn" onClick={() => setShowNotes(false)}>×</button>
            </div>
            <div className="notes-preview">
              <img src={selectedDoc.thumbnail} alt={selectedDoc.title} />
            </div>
            <div className="notes-section">
              <h3>Study Notes</h3>
              <textarea
                value={notes[selectedDoc.id] || ''}
                onChange={(e) => setNotes(prev => ({ ...prev, [selectedDoc.id]: e.target.value }))}
                placeholder="Add your study notes here..."
                className="notes-textarea"
              />
            </div>
            <div className="notes-actions">
              <button className="action-btn" onClick={() => handleSaveNotes(selectedDoc.id, notes[selectedDoc.id])}>
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalBinder; 