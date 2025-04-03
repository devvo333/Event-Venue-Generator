import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  Snackbar
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Link as LinkIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`share-tabpanel-${index}`}
      aria-labelledby={`share-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

interface QRCodeSharingProps {
  isOpen: boolean;
  onClose: () => void;
  layoutId?: string;
  venueId?: string;
  layoutName?: string;
  venueName?: string;
}

interface QRCodeProps {
  text: string;
  size?: number;
}

const QRCode: React.FC<QRCodeProps> = ({ text, size = 200 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const drawQR = async () => {
      if (!canvasRef.current) return;
      const QRCode = (await import('qrcode')).default;
      try {
        await QRCode.toCanvas(canvasRef.current, text, {
          width: size,
          margin: 2,
          errorCorrectionLevel: 'H'
        });
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };
    drawQR();
  }, [text, size]);

  return <canvas ref={canvasRef} />;
};

const QRCodeSharing: React.FC<QRCodeSharingProps> = ({
  isOpen,
  onClose,
  layoutId,
  venueId,
  layoutName = 'Venue Layout',
  venueName = 'Venue'
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sharableUrl, setSharableUrl] = useState<string>('');

  // Create sharable URLs for different experiences
  useEffect(() => {
    try {
      const baseUrl = window.location.origin;
      let url = '';
      
      switch (tabValue) {
        case 0: // AR Viewer
          url = `${baseUrl}/ar-viewer/${layoutId || ''}${venueId ? `?venueId=${venueId}` : ''}`;
          break;
        case 1: // Virtual Walkthrough
          url = `${baseUrl}/virtual-walkthrough/${layoutId || ''}${venueId ? `?venueId=${venueId}` : ''}`;
          break;
        case 2: // VR Preview
          url = `${baseUrl}/vr-preview/${layoutId || ''}${venueId ? `?venueId=${venueId}` : ''}`;
          break;
        default:
          url = `${baseUrl}/ar-viewer/${layoutId || ''}${venueId ? `?venueId=${venueId}` : ''}`;
      }
      
      setSharableUrl(url);
    } catch (err) {
      console.error('Error creating sharable URL:', err);
      setError('Failed to create sharable URL');
    }
  }, [layoutId, venueId, tabValue]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(sharableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      setError('Failed to copy URL to clipboard');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${layoutName || venueName} - Event Venue Generator`,
          text: `Check out this venue in ${tabValue === 0 ? 'AR' : tabValue === 1 ? 'Virtual Walkthrough' : 'VR'}!`,
          url: sharableUrl
        });
      } else {
        setError('Web Share API not supported on this device. Copy the link instead.');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      if (err.name !== 'AbortError') {
        setError('Failed to share');
      }
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`${layoutName || venueName} - Event Venue Generator`);
    const body = encodeURIComponent(`Check out this venue in ${tabValue === 0 ? 'AR' : tabValue === 1 ? 'Virtual Walkthrough' : 'VR'}!\n\n${sharableUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${layoutName || venueName}-${tabValue === 0 ? 'AR' : tabValue === 1 ? 'Walkthrough' : 'VR'}-QR.png`;
      link.href = url;
      link.click();
    }
  };

  const getTabLabel = (index: number) => {
    switch (index) {
      case 0:
        return 'AR Viewer';
      case 1:
        return 'Virtual Walkthrough';
      case 2:
        return 'VR Preview';
      default:
        return 'Share';
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        aria-labelledby="share-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="share-dialog-title">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center">
              <QrCodeIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Share {layoutName || venueName}</Typography>
            </Box>
            <IconButton edge="end" aria-label="close" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <Divider />
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="AR View" icon={<QrCodeIcon />} />
            <Tab label="Walkthrough" icon={<QrCodeIcon />} />
            <Tab label="VR Preview" icon={<QrCodeIcon />} />
          </Tabs>
        </Box>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TabPanel value={tabValue} index={0}>
            <Typography variant="subtitle1" gutterBottom>
              Scan this QR code to view {layoutName || venueName} in AR
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Point your mobile device at this code to open the AR viewer.
            </Typography>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Typography variant="subtitle1" gutterBottom>
              Scan this QR code to experience {layoutName || venueName} in a virtual walkthrough
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              This allows you to explore the venue from a first-person perspective.
            </Typography>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Typography variant="subtitle1" gutterBottom>
              Scan this QR code to experience {layoutName || venueName} in VR
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              For the best experience, open this on a device connected to a VR headset.
            </Typography>
          </TabPanel>
          
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            flexDirection="column"
            my={2}
          >
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                bgcolor: '#ffffff', 
                display: 'inline-block',
                borderRadius: 2
              }}
            >
              {sharableUrl ? (
                <div id="qr-code">
                  <QRCode text={sharableUrl} size={200} />
                </div>
              ) : (
                <Box sx={{ p: 10, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress />
                </Box>
              )}
            </Paper>
            
            <Typography variant="body2" color="text.secondary" mt={1}>
              {getTabLabel(tabValue)} QR Code
            </Typography>
          </Box>
          
          <Box mt={3}>
            <Typography variant="subtitle2" gutterBottom>
              Share via Link
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'stretch', mb: 2 }}>
              <TextField
                variant="outlined"
                fullWidth
                size="small"
                value={sharableUrl}
                InputProps={{
                  readOnly: true,
                }}
              />
              <Tooltip title="Copy link">
                <IconButton
                  onClick={handleCopyUrl}
                  color={copied ? 'success' : 'primary'}
                  sx={{ ml: 1, border: 1, borderColor: 'divider' }}
                >
                  <CopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box display="flex" justifyContent="center" gap={2} mt={3}>
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={handleShare}
              >
                Share
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<EmailIcon />}
                onClick={handleEmailShare}
              >
                Email
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={downloadQRCode}
              >
                Download QR
              </Button>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Link copied to clipboard"
        action={
          <IconButton size="small" color="inherit" onClick={() => setCopied(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </>
  );
};

export default QRCodeSharing; 