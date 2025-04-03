import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Button, Card, CardContent, List, ListItem, ListItemText, ListItemIcon, CircularProgress } from '@mui/material';
import {
  School as LearnIcon,
  CameraAlt as ScanIcon,
  Collections as CollectionsIcon,
  Timeline as ProgressIcon,
  History as HistoryIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AnimatedCard from '../components/AnimatedCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalScans: 0,
    learningProgress: 0,
    collections: 0,
    achievements: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    const fetchData = async () => {
      try {
        // TODO: Replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats({
          totalScans: 12,
          learningProgress: 75,
          collections: 5,
          achievements: 8,
        });
        setRecentActivity([
          { id: 1, type: 'scan', title: 'Scanned a new document', time: '2 minutes ago' },
          { id: 2, type: 'learn', title: 'Completed a learning module', time: '1 hour ago' },
          { id: 3, type: 'collection', title: 'Added to collection', time: '3 hours ago' },
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { title: 'Total Scans', value: stats.totalScans, icon: <ScanIcon />, color: '#6366F1' },
    { title: 'Learning Progress', value: `${stats.learningProgress}%`, icon: <LearnIcon />, color: '#EC4899' },
    { title: 'Collections', value: stats.collections, icon: <CollectionsIcon />, color: '#10B981' },
    { title: 'Achievements', value: stats.achievements, icon: <ProgressIcon />, color: '#F59E0B' },
  ];

  const quickActions = [
    { title: 'New Scan', icon: <ScanIcon />, path: '/scan' },
    { title: 'Learn', icon: <LearnIcon />, path: '/learn' },
    { title: 'Collections', icon: <CollectionsIcon />, path: '/collections' },
    { title: 'Progress', icon: <ProgressIcon />, path: '/progress' },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Welcome back!
      </Typography>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <AnimatedCard>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Box
                    sx={{
                      backgroundColor: `${stat.color}20`,
                      borderRadius: '50%',
                      p: 1,
                      mr: 2,
                    }}
                  >
                    {React.cloneElement(stat.icon, { sx: { color: stat.color } })}
                  </Box>
                  <Typography variant="h6" component="div">
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </AnimatedCard>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Quick Actions
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={action.icon}
              onClick={() => navigate(action.path)}
              sx={{
                height: '100px',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                textTransform: 'none',
                borderColor: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  backgroundColor: 'primary.light',
                },
              }}
            >
              {action.icon}
              <Typography variant="body1">{action.title}</Typography>
            </Button>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Recent Activity
      </Typography>
      <AnimatedCard>
        <List>
          {recentActivity.map((activity) => (
            <ListItem key={activity.id} divider>
              <ListItemIcon>
                <HistoryIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={activity.title}
                secondary={activity.time}
              />
            </ListItem>
          ))}
        </List>
      </AnimatedCard>
    </Box>
  );
};

export default Dashboard; 