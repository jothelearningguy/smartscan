import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e',
      light: '#534bae',
      dark: '#000051',
    },
    secondary: {
      main: '#0d47a1',
      light: '#5472d3',
      dark: '#002171',
    },
    background: {
      default: '#f5f5f5',
      paper: 'rgba(255, 255, 255, 0.9)',
    },
    text: {
      primary: '#1a237e',
      secondary: '#0d47a1',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      background: 'linear-gradient(45deg, #1a237e, #0d47a1)',
      backgroundClip: 'text',
      textFillColor: 'transparent',
    },
    h2: {
      fontWeight: 700,
      background: 'linear-gradient(45deg, #1a237e, #0d47a1)',
      backgroundClip: 'text',
      textFillColor: 'transparent',
    },
    h3: {
      fontWeight: 700,
      background: 'linear-gradient(45deg, #1a237e, #0d47a1)',
      backgroundClip: 'text',
      textFillColor: 'transparent',
    },
    h4: {
      fontWeight: 700,
      background: 'linear-gradient(45deg, #1a237e, #0d47a1)',
      backgroundClip: 'text',
      textFillColor: 'transparent',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 24px',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #1a237e, #0d47a1)',
          '&:hover': {
            background: 'linear-gradient(45deg, #0d47a1, #1a237e)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#1a237e',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(26, 35, 126, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.18)',
        },
      },
    },
  },
});

export default theme; 