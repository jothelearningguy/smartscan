import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Camera as CameraIcon,
  DocumentScanner as DocumentIcon,
  CloudUpload as UploadIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  PlayCircle as PlayCircleIcon,
  School as SchoolIcon,
  Collections as CollectionsIcon,
  Timeline as TimelineIcon,
  Person as ProfileIcon,
  Lightbulb as LightbulbIcon,
  MenuBook as MenuBookIcon,
  TextFields as TextFieldsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Learn = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const steps = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of SmartScan',
      icon: <SchoolIcon />,
      color: '#1E88E5',
    },
    {
      title: 'Scanning Basics',
      description: 'Master the art of scanning',
      icon: <CameraIcon />,
      color: '#26A69A',
    },
    {
      title: 'Advanced Features',
      description: 'Unlock powerful capabilities',
      icon: <LightbulbIcon />,
      color: '#FFA726',
    },
    {
      title: 'Practice',
      description: 'Put your skills to the test',
      icon: <PlayCircleIcon />,
      color: '#7E57C2',
    },
  ];

  const lessons = {
    'Getting Started': [
      {
        title: 'Welcome to SmartScan',
        description: 'Learn how SmartScan can transform your learning experience',
        duration: '2 min',
        type: 'video',
      },
      {
        title: 'Your Learning Dashboard',
        description: 'Navigate through your personalized learning space',
        duration: '3 min',
        type: 'interactive',
      },
    ],
    'Scanning Basics': [
      {
        title: 'Scanning Documents',
        description: 'Learn how to scan textbooks and notes effectively',
        duration: '4 min',
        type: 'video',
      },
      {
        title: 'Object Recognition',
        description: 'Master scanning real-world objects for learning',
        duration: '5 min',
        type: 'video',
      },
    ],
    'Advanced Features': [
      {
        title: 'Text Extraction',
        description: 'Convert scanned text into editable content',
        duration: '3 min',
        type: 'video',
      },
      {
        title: 'Smart Collections',
        description: 'Organize your scanned content efficiently',
        duration: '4 min',
        type: 'interactive',
      },
    ],
    'Practice': [
      {
        title: 'Scanning Challenge',
        description: 'Test your scanning skills with real-world scenarios',
        duration: '10 min',
        type: 'interactive',
      },
      {
        title: 'Knowledge Check',
        description: "Review what you've learned",
        duration: '5 min',
        type: 'quiz',
      },
    ],
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
    setDialogOpen(true);
  };

  const handleStartLesson = () => {
    setDialogOpen(false);
    // Navigate to the appropriate lesson page
    navigate(`/learn/${selectedLesson.title.toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, color: 'primary.main' }}>
        Your Learning Journey
      </Typography>

      {/* Progress Stepper */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((step, index) => (
            <Step key={step.title}>
              <StepLabel>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: step.color, mb: 1 }}>
                    {step.icon}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {step.title}
                  </Typography>
                </Box>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Current Section Content */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          {steps[activeStep].title}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {steps[activeStep].description}
        </Typography>

        <Grid container spacing={2}>
          {lessons[steps[activeStep].title].map((lesson, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  },
                }}
                onClick={() => handleLessonClick(lesson)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: steps[activeStep].color, mr: 2 }}>
                      {lesson.type === 'video' ? <PlayCircleIcon /> : <SchoolIcon />}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {lesson.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {lesson.duration}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {lesson.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowForwardIcon sx={{ transform: 'rotate(180deg)' }} />}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={activeStep === steps.length - 1}
            endIcon={<ArrowForwardIcon />}
          >
            Next
          </Button>
        </Box>
      </Paper>

      {/* Lesson Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedLesson?.type === 'video' ? <PlayCircleIcon color="primary" /> : <SchoolIcon color="primary" />}
            {selectedLesson?.title}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            {selectedLesson?.description}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Duration: {selectedLesson?.duration}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleStartLesson}>
            Start Lesson
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Learn; 