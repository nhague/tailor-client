import { createTheme, ThemeOptions } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// Define base theme options
const baseThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevent uppercase buttons
        },
      },
    },
  },
};

// Define light theme specific options
const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Example primary color
    },
    secondary: {
      main: '#dc004e', // Example secondary color
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
  },
};

// Define dark theme specific options (optional, but good practice)
const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
};

// Function to get the theme based on mode
export const getTheme = (mode: PaletteMode): ThemeOptions => {
  const themeOptions = mode === 'light' ? lightThemeOptions : darkThemeOptions;
  // Deep merge base options with mode-specific options
  return createTheme({ ...baseThemeOptions, ...themeOptions });
};

// Export the default theme (optional, if you need a direct theme object)
// export const defaultTheme = createTheme(getTheme('light'));