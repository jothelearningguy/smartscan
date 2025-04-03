import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

const AnimatedBackground = ({ children }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {/* Animated gradient background */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, #6366F1, #EC4899)',
          opacity: 0.1,
          zIndex: 0,
        }}
        animate={{
          background: [
            'linear-gradient(45deg, #6366F1, #EC4899)',
            'linear-gradient(135deg, #EC4899, #6366F1)',
            'linear-gradient(45deg, #6366F1, #EC4899)',
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />

      {/* Frosted glass effect */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backdropFilter: 'blur(100px)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          width: '100%',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AnimatedBackground; 