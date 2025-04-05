import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import LoadingAnimation from './components/LoadingAnimation';
import AnimatedCard from './components/AnimatedCard';
import { useAuth } from './contexts/AuthContext';

// Lazy load all pages
const Learn = lazy(() => import('./pages/Learn'));
const Scan = lazy(() => import('./pages/Scan'));
const Collections = lazy(() => import('./pages/Collections'));
const Progress = lazy(() => import('./pages/Progress'));
const Profile = lazy(() => import('./pages/Profile'));
const PhotoUpload = lazy(() => import('./components/PhotoUpload'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// Higher-order component for loading state
const withLoading = (Component) => (props) => (
  <Suspense fallback={<LoadingAnimation />}>
    <AnimatedCard>
      <Component {...props} />
    </AnimatedCard>
  </Suspense>
);

// Loading component
const LoadingScreen = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
    }}
  >
    <CircularProgress />
  </Box>
);

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/scan" replace />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/upload" element={<PhotoUpload />} />
        <Route path="*" element={<Navigate to="/scan" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes; 