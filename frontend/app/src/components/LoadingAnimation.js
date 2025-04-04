import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;

const LoadingAnimation = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        gap: 2,
      }}
    >
      <CircularProgress
        size={60}
        thickness={4}
        sx={{
          color: 'primary.main',
          animation: `${pulseAnimation} 2s ease-in-out infinite`,
        }}
      />
      <Typography
        variant="h6"
        color="text.secondary"
        sx={{
          animation: `${pulseAnimation} 2s ease-in-out infinite`,
          animationDelay: '0.5s',
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingAnimation; 