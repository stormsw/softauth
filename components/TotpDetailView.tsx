import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Chip,
  CircularProgress,
  LinearProgress
} from '@mui/material';

interface TotpItem {
  id: string;
  name: string;
  secret: string;
}

interface TotpDetailViewProps {
  item: TotpItem;
}

const TotpDetailView: React.FC<TotpDetailViewProps> = ({ item }) => {
  const [currentOtp, setCurrentOtp] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateOtpAndQr = async () => {
      try {
        // Generate current OTP
        const otpResponse = await fetch('/api/totp/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret: item.secret })
        });
        
        if (otpResponse.ok) {
          const { otp } = await otpResponse.json();
          setCurrentOtp(otp);
        }

        // Generate QR code
        const qrResponse = await fetch('/api/totp/qrcode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: item.name, 
            secret: item.secret,
            issuer: 'SoftAuth'
          })
        });
        
        if (qrResponse.ok) {
          const { qrCodeUrl: url } = await qrResponse.json();
          setQrCodeUrl(url);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error generating OTP/QR:', error);
        setLoading(false);
      }
    };

    generateOtpAndQr();
  }, [item]);

  useEffect(() => {
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const timeLeft = 30 - (now % 30);
      setTimeLeft(timeLeft);
      
      // Regenerate OTP when timer resets
      if (timeLeft === 30) {
        const generateNewOtp = async () => {
          const response = await fetch('/api/totp/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secret: item.secret })
          });
          
          if (response.ok) {
            const { otp } = await response.json();
            setCurrentOtp(otp);
          }
        };
        generateNewOtp();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [item.secret]);

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {item.name}
          </Typography>
          
          {/* Current OTP Display */}
          <Box sx={{ my: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Current Code
            </Typography>
            <Chip 
              label={currentOtp || '------'}
              sx={{ 
                fontSize: '2rem', 
                height: '60px',
                fontFamily: 'monospace',
                letterSpacing: '0.1em'
              }}
              color="primary"
              variant="outlined"
            />
          </Box>

          {/* Timer */}
          <Box sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Refreshes in {timeLeft} seconds
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(timeLeft / 30) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          {/* QR Code */}
          {qrCodeUrl && (
            <Box sx={{ my: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Setup QR Code
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <img 
                  src={qrCodeUrl} 
                  alt="TOTP QR Code" 
                  style={{ maxWidth: '200px', height: 'auto' }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Scan this QR code with your authenticator app
              </Typography>
            </Box>
          )}

          {/* Secret Key */}
          <Box sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Secret Key
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'monospace', 
                wordBreak: 'break-all',
                backgroundColor: 'grey.100',
                p: 1,
                borderRadius: 1
              }}
            >
              {item.secret}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default TotpDetailView;
