import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Paper,
  Fab,
  Box,
  Chip,
  IconButton,
  Slide,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { 
  Add as AddIcon, 
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import AddTotpDialog from '../components/AddTotpDialog';
import TotpDetailView from '../components/TotpDetailView';

interface TotpItem {
  id: string;
  name: string;
  secret: string;
  currentOtp?: string;
}

interface DashboardProps {
  totpItems: TotpItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ totpItems: initialItems }) => {
  const router = useRouter();
  const [totpItems, setTotpItems] = useState<TotpItem[]>(initialItems);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<TotpItem | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<TotpItem | null>(null);
  const [slideIn, setSlideIn] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);

  // Update timer every second
  useEffect(() => {
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = 30 - (now % 30);
      setTimeLeft(timeLeft);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Generate OTP for hovered item
  useEffect(() => {
    if (hoveredItem) {
      const generateOtp = async () => {
        const response = await fetch(`/api/totp/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret: totpItems.find(item => item.id === hoveredItem)?.secret })
        });
        
        if (response.ok) {
          const { otp } = await response.json();
          setTotpItems(prev => prev.map(item => 
            item.id === hoveredItem ? { ...item, currentOtp: otp } : item
          ));
        }
      };
      
      generateOtp();
    }
  }, [hoveredItem, totpItems]);

  const handleItemClick = (item: TotpItem) => {
    setSelectedItem(item);
    setSlideIn(true);
  };

  const handleBackClick = () => {
    setSlideIn(false);
    setTimeout(() => setSelectedItem(null), 300);
  };

  const handleAddTotp = async (name: string, secret: string) => {
    const response = await fetch('/api/totp/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, secret })
    });

    if (response.ok) {
      const newItem = await response.json();
      setTotpItems(prev => [...prev, newItem]);
      setAddDialogOpen(false);
    }
  };

  const handleDeleteClick = (item: TotpItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    const response = await fetch('/api/totp/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemToDelete.id })
    });

    if (response.ok) {
      setTotpItems(prev => prev.filter(item => item.id !== itemToDelete.id));
    }
    
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleLogout = () => {
    // In a real app, you'd clear session/tokens here
    router.push('/login');
  };

  if (selectedItem) {
    return (
      <Slide direction="left" in={slideIn} mountOnEnter unmountOnExit>
        <Box>
          <IconButton 
            onClick={handleBackClick}
            sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1000 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <TotpDetailView item={selectedItem} />
        </Box>
      </Slide>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            TOTP Authenticator
          </Typography>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            color="inherit"
          >
            Logout
          </Button>
        </Box>
        
        {/* Global Timer Indicator */}
        <Paper sx={{ p: 2, mb: 2, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body1">
              Codes refresh in: <strong>{timeLeft}s</strong>
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(timeLeft / 30) * 100}
              sx={{ 
                width: '120px', 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'primary.dark',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'white'
                }
              }}
            />
          </Box>
        </Paper>
        
        <Paper sx={{ mt: 2 }}>
          <List>
            {totpItems.map((item) => (
              <ListItem
                key={item.id}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => handleItemClick(item)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
              >
                <ListItemText
                  primary={item.name}
                  secondary={hoveredItem === item.id && item.currentOtp ? 
                    `OTP: ${item.currentOtp}` : 
                    'Hover to see OTP'
                  }
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {hoveredItem === item.id && item.currentOtp && (
                    <Chip 
                      label={item.currentOtp} 
                      variant="outlined" 
                      color="primary"
                      sx={{ fontFamily: 'monospace', fontSize: '1.1rem' }}
                    />
                  )}
                  <IconButton 
                    edge="end" 
                    aria-label="delete"
                    onClick={(e) => handleDeleteClick(item, e)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
            
            {totpItems.length === 0 && (
              <ListItem>
                <ListItemText 
                  primary="No TOTP codes added yet"
                  secondary="Click the + button to add your first TOTP code"
                />
              </ListItem>
            )}
          </List>
        </Paper>

        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setAddDialogOpen(true)}
        >
          <AddIcon />
        </Fab>

        <AddTotpDialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          onAdd={handleAddTotp}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete TOTP Code</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Here you would typically check authentication
  // For now, we'll load items from the API
  
  try {
    // In a real app, you'd make an internal API call or direct database query
    const fs = require('fs');
    const path = require('path');
    const STORAGE_FILE = path.join(process.cwd(), 'totp-items.json');
    
    let totpItems = [];
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      totpItems = JSON.parse(data);
    }

    return {
      props: {
        totpItems
      }
    };
  } catch (error) {
    console.error('Error loading TOTP items:', error);
    return {
      props: {
        totpItems: []
      }
    };
  }
};

export default Dashboard;
