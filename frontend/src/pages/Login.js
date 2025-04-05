import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      // Simulated login - replace with your actual login logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/scan');
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Simulated demo login
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/scan');
    } catch (error) {
      console.error('Demo login error:', error);
      setError('Failed to login with demo account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to SmartScan
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to continue to your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

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
              disabled={loading}
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
              disabled={loading}
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
              sx={{ mt: 3 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <Typography variant="body2" sx={{ mt: 2 }}>
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register">
              Register here
            </Link>
          </Typography>

          <Box sx={{ mt: 2, width: '100%' }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleDemoLogin}
              disabled={loading}
            >
              Try Demo Account
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 