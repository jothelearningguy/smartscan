import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Snackbar,
  Link,
  Container,
  Fade,
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import OceanBackground from '../components/OceanBackground';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  React.useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { email: formData.email });
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      console.log('Login successful:', userCredential.user);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.message || 
        'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <OceanBackground />
      
      <Container maxWidth="sm">
        <Fade in={fadeIn} timeout={1000}>
          <Paper
            elevation={24}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              transform: 'translateY(0)',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
              },
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                mb: 3,
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #1a237e, #0d47a1)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                textAlign: 'center',
              }}
            >
              Welcome to SmartScan
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, textAlign: 'center' }}
            >
              Dive into the world of intelligent learning
            </Typography>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                autoComplete="email"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1a237e',
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                autoComplete="current-password"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1a237e',
                    },
                  },
                }}
              />
              <Button
                fullWidth
                variant="contained"
                type="submit"
                startIcon={<LoginIcon />}
                disabled={loading}
                sx={{
                  mt: 3,
                  background: 'linear-gradient(45deg, #1a237e, #0d47a1)',
                  transition: 'all 0.3s ease-in-out',
                  transform: 'scale(1)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #0d47a1, #1a237e)',
                    transform: 'scale(1.02)',
                  },
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center', width: '100%' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/register"
                  underline="hover"
                  sx={{
                    color: '#1a237e',
                    '&:hover': {
                      color: '#0d47a1',
                    },
                  }}
                >
                  Create one
                </Link>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Forgot your password?{' '}
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  underline="hover"
                  sx={{
                    color: '#1a237e',
                    '&:hover': {
                      color: '#0d47a1',
                    },
                  }}
                >
                  Reset it
                </Link>
              </Typography>
            </Box>

            <Snackbar
              open={!!error}
              autoHideDuration={6000}
              onClose={() => setError('')}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
              <Alert
                onClose={() => setError('')}
                severity="error"
                sx={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {error}
              </Alert>
            </Snackbar>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login; 