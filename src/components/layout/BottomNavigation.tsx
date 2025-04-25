// File: src/components/layout/BottomNavigation.tsx
import { useState, useEffect } from 'react';
import {
  BottomNavigation as MuiBottomNavigation,
  BottomNavigationAction,
  Paper
} from '@mui/material';
import {
  Home as HomeIcon,
  Menu as CatalogIcon,
  SquareFoot as MeasurementsIcon,
  ShoppingBag as OrdersIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(0);

  // Set the active tab based on the current route
  useEffect(() => {
    if (location.pathname.includes('/home')) {
      setValue(0);
    } else if (location.pathname.includes('/catalog')) {
      setValue(1);
    } else if (location.pathname.includes('/measurements')) {
      setValue(2);
    } else if (location.pathname.includes('/orders')) {
      setValue(3);
    } else if (location.pathname.includes('/messages')) {
      setValue(4);
    }
  }, [location.pathname]);

  const handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);

    switch (newValue) {
      case 0:
        navigate('/home');
        break;
      case 1:
        navigate('/catalog');
        break;
      case 2:
        navigate('/measurements');
        break;
      case 3:
        navigate('/orders');
        break;
      case 4:
        navigate('/messages');
        break;
      default:
        break;
    }
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        borderTop: 1,
        borderColor: 'divider',
      }}
      elevation={3}
    >
      <MuiBottomNavigation
        showLabels
        value={value}
        onChange={handleChange}
        sx={{
          '& .Mui-selected': {
            color: 'primary.main',
          },
        }}
      >
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Catalog" icon={<CatalogIcon />} />
        <BottomNavigationAction label="Measurements" icon={<MeasurementsIcon />} />
        <BottomNavigationAction label="Orders" icon={<OrdersIcon />} />
        <BottomNavigationAction label="Messages" icon={<MessageIcon />} />
      </MuiBottomNavigation>
    </Paper>
  );
};

export default BottomNavigation;