// File: src/components/layout/Header.tsx
import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  Avatar,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Person as ProfileIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

interface HeaderProps {
  toggleTheme: () => void;
  toggleMobileSidebar: () => void; // Add the new prop type
}

const Header = ({ toggleTheme, toggleMobileSidebar }: HeaderProps) => { // Destructure the prop
  const { currentUser, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
    handleMenuClose();
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    handleMenuClose();
  };

  return (
    <AppBar position="fixed" color="primary" elevation={0}>
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleMobileSidebar} // Call the toggle function
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Link to="/home">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontFamily: 'Beatrice, Arial, sans-serif',
                fontWeight: 'medium',
                flexGrow: 1,
              }}
            >
              Amorn Tailors
            </Typography>
          </Box>
        </Link>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex' }}>
          <IconButton
            color="inherit"
            aria-label="show notifications"
            onClick={handleNotificationsOpen}
          >
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            {userProfile?.profileImageUrl ? (
              <Avatar
                alt={`${userProfile.firstName} ${userProfile.lastName}`}
                src={userProfile.profileImageUrl}
                sx={{ width: 32, height: 32 }}
              />
            ) : (
              <AccountCircle />
            )}
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 2,
            sx: {
              minWidth: 200,
              mt: 1.5,
              '& .MuiMenuItem-root': {
                padding: theme.spacing(1, 2),
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
              {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentUser?.email}
            </Typography>
          </Box>

          <MenuItem onClick={handleProfileClick}>
            <ListItemIcon>
              <ProfileIcon fontSize="small" />
            </ListItemIcon>
            My Profile
          </MenuItem>

          <MenuItem onClick={handleSettingsClick}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>

          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>

        <Menu
          anchorEl={notificationsAnchor}
          id="notifications-menu"
          keepMounted
          open={Boolean(notificationsAnchor)}
          onClose={handleNotificationsClose}
          PaperProps={{
            elevation: 2,
            sx: {
              minWidth: 300,
              maxWidth: 350,
              mt: 1.5,
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1 }}>
              Notifications
            </Typography>

            {/* Sample notifications - would be dynamic in real app */}
            <Typography variant="body2" sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
              Your order #12345 has been shipped.
            </Typography>
            <Typography variant="body2" sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
              Appointment confirmed for June 15th at 2:00 PM.
            </Typography>
            <Typography variant="body2" sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
              The tailor is visiting Bangkok next week!
            </Typography>
            <Typography variant="body2" sx={{ py: 1 }}>
              You received a new message from your tailor.
            </Typography>

            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Link to="/notifications">
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{ cursor: 'pointer', textDecoration: 'none' }}
                  onClick={handleNotificationsClose}
                >
                  View all notifications
                </Typography>
              </Link>
            </Box>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;