import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert
} from '@mui/material';

interface AddTotpDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, secret: string) => void;
}

const AddTotpDialog: React.FC<AddTotpDialogProps> = ({ open, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    
    if (!secret.trim()) {
      setError('Secret is required');
      return;
    }

    // Basic validation for TOTP secret (base32)
    const base32Regex = /^[A-Z2-7]+=*$/;
    if (!base32Regex.test(secret.toUpperCase().replace(/\s/g, ''))) {
      setError('Secret must be a valid base32 string (A-Z, 2-7)');
      return;
    }

    onAdd(name.trim(), secret.toUpperCase().replace(/\s/g, ''));
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setSecret('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New TOTP Code</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            autoFocus
            margin="normal"
            label="Service Name"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Google, GitHub, AWS"
          />
          
          <TextField
            margin="normal"
            label="Secret Key"
            fullWidth
            variant="outlined"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Base32 encoded secret (e.g., JBSWY3DPEHPK3PXP)"
            helperText="This is usually provided as a QR code or text when setting up 2FA"
            multiline
            rows={3}
          />

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            <strong>Note:</strong> The secret is the base32-encoded key provided by the service 
            when you enable two-factor authentication. It's usually shown as an alternative 
            to scanning the QR code.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Add TOTP
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTotpDialog;
