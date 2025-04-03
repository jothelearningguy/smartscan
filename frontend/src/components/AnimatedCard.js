import React from 'react';
import { Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';

const AnimatedCard = ({ children, sx = {} }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      style={{ width: '100%' }}
    >
      <Card
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 4,
          bgcolor: 'background.paper',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            '&::before': {
              opacity: 1,
            },
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #6366F1, #EC4899)',
            opacity: 0,
            transition: 'opacity 0.3s ease-in-out',
          },
          ...sx,
        }}
      >
        <CardContent sx={{ p: 3 }}>{children}</CardContent>
      </Card>
    </motion.div>
  );
};

export default AnimatedCard; 