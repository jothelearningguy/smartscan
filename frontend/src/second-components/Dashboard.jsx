import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Collections as CollectionsIcon,
  Group as GroupIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#00ff88' }}>
            SmartScan
          </Typography>
          <IconButton
            onClick={handleMenu}
            sx={{ color: '#00ff88' }}
          >
            <Avatar sx={{ bgcolor: '#00ff88', color: '#001e3c' }}>
              {user?.email?.[0].toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" sx={{ color: '#00ff88', mb: 4 }}>
              Welcome, {user?.email}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0, 255, 136, 0.2)',
                },
                cursor: 'pointer',
              }}
              onClick={() => navigate('/scan')}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CameraIcon sx={{ color: '#00ff88', mr: 1 }} />
                  <Typography variant="h6" sx={{ color: '#00ff88' }}>
                    Scan Document
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Scan and analyze documents with AI-powered features
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0, 255, 136, 0.2)',
                },
                cursor: 'pointer',
              }}
              onClick={() => navigate('/collections')}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CollectionsIcon sx={{ color: '#00ff88', mr: 1 }} />
                  <Typography variant="h6" sx={{ color: '#00ff88' }}>
                    My Collections
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Access and manage your scanned documents
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0, 255, 136, 0.2)',
                },
                cursor: 'pointer',
              }}
              onClick={() => navigate('/groups')}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <GroupIcon sx={{ color: '#00ff88', mr: 1 }} />
                  <Typography variant="h6" sx={{ color: '#00ff88' }}>
                    Study Groups
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Collaborate with classmates and share resources
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard; 