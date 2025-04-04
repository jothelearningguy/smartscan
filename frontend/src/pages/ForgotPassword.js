import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Snackbar,
  Link,
} from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
import AnimatedCard from '../components/AnimatedCard';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSuccess('Password reset instructions have been sent to your email.');
      setEmail('');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send reset instructions. Please try again.');
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
        p: 3,
        background: 'linear-gradient(135deg, #F5F9FF 0%, #E3F2FD 100%)',
      }}
    >
      <AnimatedCard>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
            Reset Password
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Enter your email address and we'll send you instructions to reset your password.
          </Typography>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              startIcon={<EmailIcon />}
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Remember your password?{' '}
              <Link component={RouterLink} to="/login" underline="hover">
                Sign in
              </Link>
            </Typography>
          </Box>

          <Snackbar
            open={!!error || !!success}
            autoHideDuration={6000}
            onClose={() => {
              setError('');
              setSuccess('');
            }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              onClose={() => {
                setError('');
                setSuccess('');
              }}
              severity={success ? 'success' : 'error'}
            >
              {success || error}
            </Alert>
          </Snackbar>
        </Paper>
      </AnimatedCard>
    </Box>
  );
};

export default ForgotPassword; 