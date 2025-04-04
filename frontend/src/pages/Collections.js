import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { collectionService } from '../services/collectionService';

const Collections = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'rename', 'share', 'export', 'delete'
  const [newName, setNewName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const data = await collectionService.getAllCollections();
      setCollections(data);
    } catch (err) {
      setError('Failed to fetch collections');
      showSnackbar('Failed to fetch collections', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event, collection) => {
    setAnchorEl(event.currentTarget);
    setSelectedCollection(collection);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCollection(null);
  };

  const handleDialogOpen = (type) => {
    setDialogType(type);
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewName('');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleRename = async () => {
    try {
      await collectionService.updateCollection(selectedCollection.id, {
        title: newName
      });
      await fetchCollections();
      showSnackbar('Collection renamed successfully');
      handleDialogClose();
    } catch (err) {
      showSnackbar('Failed to rename collection', 'error');
    }
  };

  const handleShare = async () => {
    try {
      await collectionService.shareCollection(selectedCollection.id, {
        email: newName // In a real app, this would be an email input
      });
      showSnackbar('Collection shared successfully');
      handleDialogClose();
    } catch (err) {
      showSnackbar('Failed to share collection', 'error');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await collectionService.exportCollection(selectedCollection.id, 'pdf');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedCollection.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSnackbar('Collection exported successfully');
      handleDialogClose();
    } catch (err) {
      showSnackbar('Failed to export collection', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await collectionService.deleteCollection(selectedCollection.id);
      await fetchCollections();
      showSnackbar('Collection deleted successfully');
      handleDialogClose();
    } catch (err) {
      showSnackbar('Failed to delete collection', 'error');
    }
  };

  const handleDialogAction = () => {
    switch (dialogType) {
      case 'rename':
        handleRename();
        break;
      case 'share':
        handleShare();
        break;
      case 'export':
        handleExport();
        break;
      case 'delete':
        handleDelete();
        break;
      default:
        break;
    }
  };

  const filteredCollections = collections.filter(collection => {
    const matchesSearch = collection.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = currentTab === 0 || collection.type === ['all', 'document', 'object', 'photo'][currentTab];
    return matchesSearch && matchesTab;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Collections
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search collections..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <Tabs
        value={currentTab}
        onChange={(e, newValue) => setCurrentTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="All" />
        <Tab label="Documents" />
        <Tab label="3D Objects" />
        <Tab label="Photos" />
      </Tabs>

      <Grid container spacing={3}>
        {filteredCollections.map((collection) => (
          <Grid item xs={12} sm={6} md={4} key={collection.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={collection.thumbnail}
                alt={collection.title}
              />
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" component="div">
                    {collection.title}
                  </Typography>
                  <IconButton onClick={(e) => handleMenuClick(e, collection)}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip
                    label={`${collection.itemCount} items`}
                    size="small"
                    sx={{ bgcolor: `${collection.color}20`, color: collection.color }}
                  />
                  <Chip
                    label={collection.lastUpdated}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleDialogOpen('rename')}>Rename</MenuItem>
        <MenuItem onClick={() => handleDialogOpen('share')}>Share</MenuItem>
        <MenuItem onClick={() => handleDialogOpen('export')}>Export</MenuItem>
        <MenuItem onClick={() => handleDialogOpen('delete')} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>
          {dialogType === 'rename' && 'Rename Collection'}
          {dialogType === 'share' && 'Share Collection'}
          {dialogType === 'export' && 'Export Collection'}
          {dialogType === 'delete' && 'Delete Collection'}
        </DialogTitle>
        <DialogContent>
          {(dialogType === 'rename' || dialogType === 'share') && (
            <TextField
              autoFocus
              margin="dense"
              label={dialogType === 'rename' ? 'New Name' : 'Email Address'}
              fullWidth
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          )}
          {dialogType === 'delete' && (
            <Typography>
              Are you sure you want to delete this collection? This action cannot be undone.
            </Typography>
          )}
          {dialogType === 'export' && (
            <Typography>
              Choose a format to export your collection.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDialogAction} color="primary">
            {dialogType === 'delete' ? 'Delete' : 'Confirm'}
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

export default Collections; 