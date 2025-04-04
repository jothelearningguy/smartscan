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
        {/* Public routes */}
        <Route path="/login" element={withLoading(Login)()} />
        <Route path="/register" element={withLoading(Register)()} />
        
        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/scan" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scan"
          element={
            <ProtectedRoute>
              {withLoading(Scan)()}
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn"
          element={
            <ProtectedRoute>
              {withLoading(Learn)()}
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              {withLoading(Profile)()}
            </ProtectedRoute>
          }
        />
        <Route
          path="/collections"
          element={
            <ProtectedRoute>
              {withLoading(Collections)()}
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              {withLoading(Progress)()}
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              {withLoading(PhotoUpload)()}
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/scan" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes; 