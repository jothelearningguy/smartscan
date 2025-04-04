import React from 'react';
import { Box } from '@mui/material';

const OceanBackground = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: -1,
        background: 'linear-gradient(180deg, #1a237e 0%, #0d47a1 100%)',
      }}
    >
      {/* Animated waves */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100px',
          background: 'url("/wave.svg")',
          backgroundSize: '1000px 100px',
          animation: 'wave 30s linear infinite',
          opacity: 0.3,
          '@keyframes wave': {
            '0%': {
              backgroundPositionX: 0,
            },
            '100%': {
              backgroundPositionX: '1000px',
            },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100px',
          background: 'url("/wave.svg")',
          backgroundSize: '1000px 100px',
          animation: 'wave 15s linear infinite',
          opacity: 0.2,
          '@keyframes wave': {
            '0%': {
              backgroundPositionX: 0,
            },
            '100%': {
              backgroundPositionX: '-1000px',
            },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100px',
          background: 'url("/wave.svg")',
          backgroundSize: '1000px 100px',
          animation: 'wave 10s linear infinite',
          opacity: 0.1,
          '@keyframes wave': {
            '0%': {
              backgroundPositionX: 0,
            },
            '100%': {
              backgroundPositionX: '1000px',
            },
          },
        }}
      />

      {/* Animated bubbles */}
      {[...Array(10)].map((_, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            width: '20px',
            height: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            animation: `float ${Math.random() * 10 + 5}s linear infinite`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            '@keyframes float': {
              '0%': {
                transform: 'translateY(100vh) scale(0)',
                opacity: 0,
              },
              '50%': {
                opacity: 0.5,
              },
              '100%': {
                transform: 'translateY(-100px) scale(1)',
                opacity: 0,
              },
            },
          }}
        />
      ))}
    </Box>
  );
};

export default OceanBackground; 