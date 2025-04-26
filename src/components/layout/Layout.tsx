// File: src/components/layout/Layout.tsx
import { ReactNode, useEffect, useState } from 'react';
import { Box, Drawer, useMediaQuery, useTheme, CircularProgress } from '@mui/material'; // Import Drawer and CircularProgress
import Header from './Header';
import BottomNavigation from './BottomNavigation';
import Sidebar from './Sidebar'; // Keep Sidebar for content
import OfflineNotification from './OfflineNotification';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser, userProfile, loading } = useAuth(); // Add userProfile
  const navigate = useNavigate();
  const location = useLocation();
  const [isOffline, setIsOffline] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // State for mobile sidebar

  // Check if the route requires authentication
  const isAuthRoute = ['/login', '/register', '/forgot-password'].includes(location.pathname);

  // Check if user is authenticated and redirect if needed
  useEffect(() => {
    if (!loading) {
      // If the user is not logged in (no profile) and the route is not an auth route, redirect to login
      if (!userProfile && !isAuthRoute && location.pathname !== '/') { // Use !userProfile
        navigate('/login');
      }

      // If the user is logged in (has a profile) and tries to access an auth route, redirect to home
      if (userProfile && isAuthRoute) { // Use userProfile
        navigate('/home');
      }
    }
  }, [currentUser, loading, isAuthRoute, navigate, location]);

  // Listen for online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial state
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Function to toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Show loading state or authentication screens without the layout
  // Check if loading OR if no user profile exists AND we are on a protected route
  if (loading || (!userProfile && !isAuthRoute && location.pathname !== '/')) { // Use !userProfile
    // Show a centered loading spinner instead of null
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // For auth routes, don't show the header, sidebar, or bottom navigation
  if (isAuthRoute) {
    return <Box>{children}</Box>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {isOffline && <OfflineNotification />}

      <Header toggleMobileSidebar={toggleMobileSidebar} /> {/* Pass toggle function */}

      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Permanent Sidebar for Desktop */}
        {!isMobile && <Sidebar />}

        {/* Temporary Drawer for Mobile */}
        {isMobile && (
          <Drawer
            variant="temporary"
            open={isMobileSidebarOpen}
            onClose={toggleMobileSidebar} // Close on backdrop click or escape
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: 260, // Match Sidebar width
              },
            }}
          >
            {/* Render Sidebar content inside the temporary drawer */}
            <Sidebar />
          </Drawer>
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            pt: 10, // Space for fixed header
            pb: isMobile ? 8 : 3, // Space for bottom navigation on mobile
            overflow: 'auto',
            maxWidth: '100%',
          }}
        >
          {children}
        </Box>
      </Box>

      {isMobile && <BottomNavigation />}
    </Box>
  );
};

export default Layout;