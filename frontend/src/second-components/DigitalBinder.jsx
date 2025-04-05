import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, List, ListItem, ListItemText, 
  ListItemSecondaryAction, IconButton, Typography, Box,
  Divider
} from '@mui/material';
import {
  Share as ShareIcon,
  Group as GroupIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const DigitalBinder = () => {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const createGroup = () => {
    if (!newGroupName.trim()) return;
    
    const newGroup = {
      id: Date.now(),
      name: newGroupName,
      members: [],
      collections: [],
      createdAt: new Date().toISOString()
    };
    
    setGroups(prev => [...prev, newGroup]);
    setNewGroupName('');
    setShowCreateGroup(false);
  };

  const shareCollection = (collectionId) => {
    if (!selectedGroup) return;
    
    setGroups(prev => prev.map(group => 
      group.id === selectedGroup.id
        ? { ...group, collections: [...group.collections, collectionId] }
        : group
    ));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#00ff88' }}>
          Digital Binder
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateGroup(true)}
          sx={{ bgcolor: '#00ff88', '&:hover': { bgcolor: '#00cc6a' } }}
        >
          Create Study Group
        </Button>
      </Box>

      {/* Study Groups Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ color: '#00ff88', mb: 2 }}>
          Study Groups
        </Typography>
        <List>
          {groups.map((group) => (
            <ListItem
              key={group.id}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <ListItemText
                primary={group.name}
                secondary={`${group.members.length} members • ${group.collections.length} collections`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => setSelectedGroup(group)}
                  sx={{ color: '#00ff88' }}
                >
                  <ShareIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Collections Section */}
      <Box>
        <Typography variant="h6" sx={{ color: '#00ff88', mb: 2 }}>
          Your Collections
        </Typography>
        <Grid container spacing={2}>
          {collections.map((collection) => (
            <Grid item xs={12} sm={6} md={4} key={collection.id}>
              <Card
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0, 255, 136, 0.2)'
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#00ff88', mb: 1 }}>
                    {collection.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                    {collection.items.length} items
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ShareIcon />}
                      onClick={() => shareCollection(collection.id)}
                      sx={{
                        borderColor: '#00ff88',
                        color: '#00ff88',
                        '&:hover': {
                          borderColor: '#00cc6a',
                          bgcolor: 'rgba(0, 255, 136, 0.1)'
                        }
                      }}
                    >
                      Share
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DeleteIcon />}
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                          bgcolor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Create Group Dialog */}
      <Dialog open={showCreateGroup} onClose={() => setShowCreateGroup(false)}>
        <DialogTitle>Create Study Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateGroup(false)}>Cancel</Button>
          <Button onClick={createGroup} color="primary">Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DigitalBinder; 