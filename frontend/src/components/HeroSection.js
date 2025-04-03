import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { keyframes } from '@mui/system';
import {
  Scan as ScanIcon,
  Collections as CollectionsIcon,
  School as SchoolIcon,
} from '@mui/icons-material';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const HeroSection = () => {
  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        py: 8,
        px: 3,
      }}
    >
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              animation: `${fadeInUp} 1s ease-out`,
            }}
          >
            <Typography
              variant="h1"
              sx={{
                mb: 3,
                background: 'linear-gradient(45deg, #6366F1, #EC4899)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                fontWeight: 800,
              }}
            >
              Transform Your Learning Experience
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ mb: 4, animation: `${fadeInUp} 1s ease-out 0.2s backwards` }}
            >
              Scan, analyze, and organize your study materials with AI-powered tools
              that make learning more efficient and enjoyable.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                animation: `${fadeInUp} 1s ease-out 0.4s backwards`,
              }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<ScanIcon />}
                sx={{
                  background: 'linear-gradient(45deg, #6366F1, #EC4899)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #4F46E5, #DB2777)',
                  },
                }}
              >
                Start Scanning
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<CollectionsIcon />}
              >
                View Collections
              </Button>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              position: 'relative',
              animation: `${fadeInUp} 1s ease-out 0.6s backwards`,
            }}
          >
            <Box
              sx={{
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -20,
                  left: -20,
                  right: -20,
                  bottom: -20,
                  background: 'linear-gradient(45deg, #6366F1, #EC4899)',
                  opacity: 0.1,
                  borderRadius: '50%',
                  filter: 'blur(40px)',
                  zIndex: -1,
                },
              }}
            >
              <SchoolIcon
                sx={{
                  fontSize: 400,
                  color: 'primary.main',
                  opacity: 0.8,
                }}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HeroSection; 