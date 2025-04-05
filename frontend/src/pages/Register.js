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
import { PersonAdd as RegisterIcon } from '@mui/icons-material';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Simulated registration - replace with your actual registration logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/scan');
    } catch (error) {
      console.error('Registration error:', error);
      setError('Failed to create an account. Please try again.');
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
            Create Account
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Sign up to start using SmartScan
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
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
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
              startIcon={loading ? <CircularProgress size={20} /> : <RegisterIcon />}
              sx={{ mt: 3 }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <Typography variant="body2" sx={{ mt: 2 }}>
            Already have an account?{' '}
            <Link component={RouterLink} to="/login">
              Sign in here
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 