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
} from '@mui/material';
import {
  Scanner as ScannerIcon,
  ExitToApp as LogoutIcon,
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        padding: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
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
              mb: 3,
            }}
          >
            Welcome to SmartScan
          </Typography>
          
          <Typography
            variant="subtitle1"
            sx={{
              mb: 4,
              color: 'text.secondary',
              textAlign: 'center',
            }}
          >
            Logged in as: {currentUser?.email}
          </Typography>

          <Grid container spacing={3} direction="column" alignItems="center">
            <Grid item xs={12}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/scan')}
                startIcon={<ScannerIcon />}
                sx={{
                  py: 2,
                  px: 4,
                  fontSize: '1.2rem',
                  background: 'linear-gradient(45deg, #1a237e, #0d47a1)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #0d47a1, #1a237e)',
                    transform: 'scale(1.02)',
                  },
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                Start Scanning
              </Button>
            </Grid>
            
            <Grid item xs={12}>
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
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}

export default Dashboard; 