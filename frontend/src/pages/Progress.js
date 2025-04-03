import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  School as SchoolIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import progressService from '../services/progressService';

const Progress = () => {
  const [learningStats, setLearningStats] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const [progressData, achievementsData, activitiesData] = await Promise.all([
        progressService.getLearningProgress(),
        progressService.getAchievements(),
        progressService.getRecentActivities()
      ]);

      setLearningStats([
        {
          title: 'Learning Progress',
          value: `${progressData.overallProgress}%`,
          progress: progressData.overallProgress,
          icon: <SchoolIcon />,
          color: '#1E88E5',
        },
        {
          title: 'Scanning Skills',
          value: `${progressData.skillsProgress}%`,
          progress: progressData.skillsProgress,
          icon: <StarIcon />,
          color: '#26A69A',
        },
        {
          title: 'Achievement Rate',
          value: `${progressData.achievementRate}%`,
          progress: progressData.achievementRate,
          icon: <TrophyIcon />,
          color: '#FFA726',
        },
      ]);

      setAchievements(achievementsData);
      setRecentActivities(activitiesData);
    } catch (err) {
      setError('Failed to fetch progress data');
      showSnackbar('Failed to fetch progress data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAchievementClick = async (achievementId) => {
    try {
      await progressService.completeAchievement(achievementId);
      await fetchProgressData();
      showSnackbar('Achievement completed!');
    } catch (err) {
      showSnackbar('Failed to complete achievement', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Learning Progress
      </Typography>

      <Grid container spacing={3}>
        {/* Learning Statistics */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Learning Statistics
              </Typography>
              {learningStats.map((stat, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ bgcolor: `${stat.color}20`, color: stat.color, mr: 1 }}>
                      {stat.icon}
                    </Avatar>
                    <Typography variant="subtitle1">{stat.title}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ mr: 1 }}>
                      {stat.value}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={stat.progress}
                      sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Achievements */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Achievements
              </Typography>
              {achievements.map((achievement) => (
                <Box
                  key={achievement.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: achievement.achieved ? `${achievement.color}10` : 'transparent',
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: achievement.achieved ? achievement.color : 'grey.300',
                      color: achievement.achieved ? 'white' : 'grey.600',
                      mr: 2,
                    }}
                  >
                    <TrophyIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1">{achievement.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {achievement.description}
                    </Typography>
                  </Box>
                  {!achievement.achieved && (
                    <IconButton
                      onClick={() => handleAchievementClick(achievement.id)}
                      color="primary"
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Activities
              </Typography>
              <List>
                {recentActivities.map((activity, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <TimeIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.title}
                      secondary={activity.timestamp}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Progress; 