import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Stack,
  Divider,
} from '@mui/material';
import {
  Scanner as ScannerIcon,
  ExitToApp as LogoutIcon,
  Collections as CollectionsIcon,
  EmojiEvents as AchievementsIcon,
  Timeline as ProgressIcon,
} from '@mui/icons-material';

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        padding: 3,
        position: 'relative',
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/wave-pattern.svg)',
          opacity: 0.1,
          zIndex: 1,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Welcome Section */}
        <Paper
          elevation={24}
          sx={{
            p: 4,
            mb: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: '#1a237e',
              textAlign: 'center',
              mb: 2,
            }}
          >
            Welcome back, {currentUser?.email?.split('@')[0]}!
          </Typography>
        </Paper>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { title: 'Total Scans', value: '12', icon: <ScannerIcon /> },
            { title: 'Learning Progress', value: '75%', icon: <ProgressIcon /> },
            { title: 'Collections', value: '5', icon: <CollectionsIcon /> },
            { title: 'Achievements', value: '8', icon: <AchievementsIcon /> },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={8}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '15px',
                  backdropFilter: 'blur(10px)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                <Box sx={{ color: '#1a237e', mb: 1 }}>{stat.icon}</Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {stat.title}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions and Recent Activity */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={8}
              sx={{
                p: 3,
                height: '100%',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '15px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: '#1a237e' }}>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<ScannerIcon />}
                  onClick={() => navigate('/scan')}
                  sx={{
                    background: 'linear-gradient(45deg, #1a237e, #0d47a1)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #0d47a1, #1a237e)',
                    },
                  }}
                >
                  Start New Scan
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CollectionsIcon />}
                  onClick={() => navigate('/collections')}
                >
                  View Collections
                </Button>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={8}
              sx={{
                p: 3,
                height: '100%',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '15px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: '#1a237e' }}>
                Recent Activity
              </Typography>
              <Stack spacing={2}>
                {/* Add your recent activity items here */}
                <Typography variant="body2" color="text.secondary">
                  No recent activity to display
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Logout Button */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            sx={{
              mt: 2,
            }}
          >
            Logout
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default Dashboard; 