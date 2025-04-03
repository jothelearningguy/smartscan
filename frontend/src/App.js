import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import AppRoutes from './routes';

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box
            sx={{
              minHeight: '100vh',
              background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Navbar />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                mt: 8,
                position: 'relative',
                zIndex: 1,
              }}
            >
              <AppRoutes />
            </Box>
          </Box>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
