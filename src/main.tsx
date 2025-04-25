import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HelmetProvider } from 'react-helmet-async';

import createEmotionCache from './utils/createEmotionCache';
import { getTheme } from './config/theme';
import { store } from './store';
import AuthProvider from './contexts/AuthContext';
import { registerServiceWorker } from './utils/registerServiceWorker';

const clientSideEmotionCache = createEmotionCache();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

const theme = getTheme('light'); // Initial theme mode

root.render(
  <React.StrictMode>
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <HelmetProvider>
              <BrowserRouter>
                <AuthProvider>
                  <App />
                </AuthProvider>
              </BrowserRouter>
            </HelmetProvider>
          </QueryClientProvider>
        </Provider>
      </ThemeProvider>
    </CacheProvider>
  </React.StrictMode>
);

// Service worker registration should be handled within a component, e.g., App.tsx
// useEffect(() => {
//   if (typeof window !== 'undefined') {
//     registerServiceWorker();
//   }
// }, []);