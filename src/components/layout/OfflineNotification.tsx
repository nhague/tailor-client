import { Alert, Slide, Snackbar } from '@mui/material';
import { useState, useEffect } from 'react';

const OfflineNotification = () => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const handleOnline = () => setOpen(false);
    const handleOffline = () => setOpen(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      TransitionComponent={Slide}
    >
      <Alert
        severity="warning"
        variant="filled"
        sx={{
          width: '100%',
          '& .MuiAlert-icon': {
            fontSize: '1.25rem',
          },
        }}
      >
        You are offline. Some features may be unavailable.
      </Alert>
    </Snackbar>
  );
};

export default OfflineNotification;