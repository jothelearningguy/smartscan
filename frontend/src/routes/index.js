import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import HeroSection from '../components/HeroSection';
import AnimatedCard from '../components/AnimatedCard';
import LoadingAnimation from '../components/LoadingAnimation';

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const Learn = React.lazy(() => import('../pages/Learn'));
const Scan = React.lazy(() => import('../pages/Scan'));
const ObjectScanner = React.lazy(() => import('../pages/ObjectScanner'));
const DocumentScanner = React.lazy(() => import('../pages/DocumentScanner'));
const PhotoUpload = React.lazy(() => import('../pages/PhotoUpload'));
const PhotoDetail = React.lazy(() => import('../pages/PhotoDetail'));
const Collections = React.lazy(() => import('../pages/Collections'));
const Progress = React.lazy(() => import('../pages/Progress'));
const Profile = React.lazy(() => import('../pages/Profile'));

// Wrap routes with loading animation
const withLoading = (Component) => (props) => (
  <React.Suspense fallback={<LoadingAnimation />}>
    <Component {...props} />
  </React.Suspense>
);

const AppRoutes = () => {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 3,
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '100vw',
        overflow: 'auto',
        margin: 0,
        boxSizing: 'border-box',
      }}
    >
      <Routes>
        <Route
          path="/"
          element={
            <AnimatedCard>
              {withLoading(Dashboard)()}
            </AnimatedCard>
          }
        />
        <Route
          path="/learn"
          element={
            <AnimatedCard>
              {withLoading(Learn)()}
            </AnimatedCard>
          }
        />
        <Route
          path="/scan"
          element={
            <AnimatedCard>
              {withLoading(Scan)()}
            </AnimatedCard>
          }
        />
        <Route
          path="/scan/object"
          element={
            <AnimatedCard>
              {withLoading(ObjectScanner)()}
            </AnimatedCard>
          }
        />
        <Route
          path="/scan/document"
          element={
            <AnimatedCard>
              {withLoading(DocumentScanner)()}
            </AnimatedCard>
          }
        />
        <Route
          path="/scan/upload"
          element={
            <AnimatedCard>
              {withLoading(PhotoUpload)()}
            </AnimatedCard>
          }
        />
        <Route
          path="/photo/:id"
          element={
            <AnimatedCard>
              {withLoading(PhotoDetail)()}
            </AnimatedCard>
          }
        />
        <Route
          path="/collections"
          element={
            <AnimatedCard>
              {withLoading(Collections)()}
            </AnimatedCard>
          }
        />
        <Route
          path="/progress"
          element={
            <AnimatedCard>
              {withLoading(Progress)()}
            </AnimatedCard>
          }
        />
        <Route
          path="/profile"
          element={
            <AnimatedCard>
              {withLoading(Profile)()}
            </AnimatedCard>
          }
        />
      </Routes>
    </Box>
  );
};

export default AppRoutes; 