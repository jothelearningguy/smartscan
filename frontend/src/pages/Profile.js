import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
  Camera as CameraIcon,
  History as HistoryIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Help as HelpIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import profileService from '../services/profileService';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoScan: true,
    saveHistory: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'password', 'delete'
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileData, preferencesData] = await Promise.all([
        profileService.getProfile(),
        profileService.getPreferences()
      ]);
      setProfile(profileData);
      setSettings(preferencesData);
    } catch (err) {
      setError('Failed to fetch profile data');
      showSnackbar('Failed to fetch profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (setting) => {
    try {
      const newSettings = { ...settings, [setting]: !settings[setting] };
      await profileService.updatePreferences(newSettings);
      setSettings(newSettings);
      showSnackbar('Settings updated successfully');
    } catch (err) {
      showSnackbar('Failed to update settings', 'error');
    }
  };

  const handleDialogOpen = (type) => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handlePasswordChange = async () => {
    try {
      if (formData.newPassword !== formData.confirmPassword) {
        showSnackbar('New passwords do not match', 'error');
        return;
      }
      await profileService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      showSnackbar('Password changed successfully');
      handleDialogClose();
    } catch (err) {
      showSnackbar('Failed to change password', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await profileService.deleteAccount();
      showSnackbar('Account deleted successfully');
      handleDialogClose();
      // Redirect to login page or handle logout
    } catch (err) {
      showSnackbar('Failed to delete account', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const preferences = [
    {
      icon: <NotificationsIcon />,
      title: 'Notifications',
      description: 'Receive notifications about your scans and achievements',
      setting: 'notifications',
    },
    {
      icon: <DarkModeIcon />,
      title: 'Dark Mode',
      description: 'Switch between light and dark theme',
      setting: 'darkMode',
    },
    {
      icon: <CameraIcon />,
      title: 'Auto Scan',
      description: 'Automatically start scanning when camera is ready',
      setting: 'autoScan',
    },
    {
      icon: <HistoryIcon />,
      title: 'Save History',
      description: 'Keep track of your scanning history',
      setting: 'saveHistory',
    },
  ];

  const quickActions = [
    {
      icon: <SecurityIcon />,
      title: 'Security Settings',
      description: 'Manage your account security',
      action: () => handleDialogOpen('password'),
    },
    {
      icon: <LanguageIcon />,
      title: 'Language',
      description: 'Change your preferred language',
      action: () => {}, // Implement language selection
    },
    {
      icon: <HelpIcon />,
      title: 'Help & Support',
      description: 'Get help with using the app',
      action: () => {}, // Implement help center
    },
    {
      icon: <DeleteIcon />,
      title: 'Delete Account',
      description: 'Permanently delete your account',
      action: () => handleDialogOpen('delete'),
      color: 'error',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading profile...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={profile?.avatar}
                  sx={{ width: 80, height: 80, mr: 2 }}
                >
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ mb: 1 }}>
                    {profile?.name}
                  </Typography>
                  <Typography color="text.secondary">
                    {profile?.email}
                  </Typography>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6">{profile?.statistics?.scans || 0}</Typography>
                  <Typography color="text.secondary">Total Scans</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6">{profile?.statistics?.collections || 0}</Typography>
                  <Typography color="text.secondary">Collections</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="h6">{profile?.statistics?.achievements || 0}</Typography>
                  <Typography color="text.secondary">Achievements</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Preferences
              </Typography>
              <List>
                {preferences.map((pref) => (
                  <ListItem key={pref.setting}>
                    <ListItemIcon>{pref.icon}</ListItemIcon>
                    <ListItemText
                      primary={pref.title}
                      secondary={pref.description}
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings[pref.setting]}
                        onChange={() => handleSettingChange(pref.setting)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Quick Actions
              </Typography>
              <List>
                {quickActions.map((action) => (
                  <ListItem
                    key={action.title}
                    button
                    onClick={action.action}
                    sx={{ color: action.color }}
                  >
                    <ListItemIcon sx={{ color: action.color }}>
                      {action.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={action.title}
                      secondary={action.description}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog open={openDialog && dialogType === 'password'} onClose={handleDialogClose}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Current Password"
            type="password"
            fullWidth
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
          />
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Confirm New Password"
            type="password"
            fullWidth
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handlePasswordChange} color="primary">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={openDialog && dialogType === 'delete'} onClose={handleDialogClose}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteAccount} color="error">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

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

export default Profile; 