// File: src/components/layout/Sidebar.tsx
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Collapse,
} from '@mui/material';
import {
  Home as HomeIcon,
  Menu as CatalogIcon,
  SquareFoot as MeasurementsIcon,
  ShoppingBag as OrdersIcon,
  Message as MessageIcon,
  Event as AppointmentsIcon,
  Group as GroupsIcon,
  Favorite as FavoritesIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  History as HistoryIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 260;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();
  const [openOrders, setOpenOrders] = useState(false);
  const [openMeasurements, setOpenMeasurements] = useState(false);

  const handleClick = (path: string) => {
    navigate(path);
  };

  const handleOrdersClick = () => {
    setOpenOrders(!openOrders);
  };

  const handleMeasurementsClick = () => {
    setOpenMeasurements(!openMeasurements);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          top: '64px', // Assuming header height is 64px
          height: 'calc(100% - 64px)',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', pt: 2 }}>
        <Box sx={{ px: 2, mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Welcome
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
            {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'User'}
          </Typography>
          {userProfile?.customerTier && (
            <Typography variant="body2" color="text.secondary">
              {userProfile.customerTier.charAt(0).toUpperCase() + userProfile.customerTier.slice(1)} Member
            </Typography>
          )}
        </Box>

        <Divider />

        <List component="nav" sx={{ pt: 1 }}>
          <ListItem button onClick={() => handleClick('/home')} selected={location.pathname === '/home'}>
            <ListItemIcon>
              <HomeIcon color={location.pathname === '/home' ? 'primary' : undefined} />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>

          <ListItem button onClick={() => handleClick('/catalog')} selected={location.pathname.startsWith('/catalog')}>
            <ListItemIcon>
              <CatalogIcon color={location.pathname.startsWith('/catalog') ? 'primary' : undefined} />
            </ListItemIcon>
            <ListItemText primary="Catalog" />
          </ListItem>

          <ListItem button onClick={handleMeasurementsClick}>
            <ListItemIcon>
              <MeasurementsIcon color={location.pathname.startsWith('/measurements') ? 'primary' : undefined} />
            </ListItemIcon>
            <ListItemText primary="Measurements" />
            {openMeasurements ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openMeasurements} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem
                button
                onClick={() => handleClick('/measurements')}
                selected={location.pathname === '/measurements'}
                sx={{ pl: 4 }}
              >
                <ListItemIcon>
                  <HistoryIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="My Measurements" />
              </ListItem>
              <ListItem
                button
                onClick={() => handleClick('/measurements/new')}
                selected={location.pathname === '/measurements/new'}
                sx={{ pl: 4 }}
              >
                <ListItemIcon>
                  <AddIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Add New" />
              </ListItem>
            </List>
          </Collapse>

          <ListItem button onClick={handleOrdersClick}>
            <ListItemIcon>
              <OrdersIcon color={location.pathname.startsWith('/orders') ? 'primary' : undefined} />
            </ListItemIcon>
            <ListItemText primary="Orders" />
            {openOrders ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openOrders} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem
                button
                onClick={() => handleClick('/orders')}
                selected={location.pathname === '/orders'}
                sx={{ pl: 4 }}
              >
                <ListItemIcon>
                  <HistoryIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="My Orders" />
              </ListItem>
              <ListItem
                button
                onClick={() => handleClick('/orders/new')}
                selected={location.pathname === '/orders/new'}
                sx={{ pl: 4 }}
              >
                <ListItemIcon>
                  <AddIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="New Order" />
              </ListItem>
            </List>
          </Collapse>

          <ListItem button onClick={() => handleClick('/appointments')} selected={location.pathname.startsWith('/appointments')}>
            <ListItemIcon>
              <AppointmentsIcon color={location.pathname.startsWith('/appointments') ? 'primary' : undefined} />
            </ListItemIcon>
            <ListItemText primary="Appointments" />
          </ListItem>

          <ListItem button onClick={() => handleClick('/messages')} selected={location.pathname.startsWith('/messages')}>
            <ListItemIcon>
              <MessageIcon color={location.pathname.startsWith('/messages') ? 'primary' : undefined} />
            </ListItemIcon>
            <ListItemText primary="Messages" />
          </ListItem>

          <ListItem button onClick={() => handleClick('/groups')} selected={location.pathname.startsWith('/groups')}>
            <ListItemIcon>
              <GroupsIcon color={location.pathname.startsWith('/groups') ? 'primary' : undefined} />
            </ListItemIcon>
            <ListItemText primary="Group Orders" />
          </ListItem>

          <ListItem button onClick={() => handleClick('/favorites')} selected={location.pathname.startsWith('/favorites')}>
            <ListItemIcon>
              <FavoritesIcon color={location.pathname.startsWith('/favorites') ? 'primary' : undefined} />
            </ListItemIcon>
            <ListItemText primary="Favorites" />
          </ListItem>

          <Divider sx={{ my: 2 }} />

          <ListItem button onClick={() => handleClick('/settings')} selected={location.pathname.startsWith('/settings')}>
            <ListItemIcon>
              <SettingsIcon color={location.pathname.startsWith('/settings') ? 'primary' : undefined} />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;