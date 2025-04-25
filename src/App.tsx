import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ReactQueryDevtools } from 'react-query/devtools';

// Import page components from new features directory
import LandingPage from './features/home/LandingPage';
import HomePage from './features/home/HomePage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage';
import MeasurementsPage from './features/measurements/MeasurementsPage';
import NewMeasurementPage from './features/measurements/NewMeasurementPage';
import CatalogPage from './features/catalog/CatalogPage';
import ProductDetailPage from './features/catalog/ProductDetailPage';
import MessagesPage from './features/messages/MessagesPage'; // Import the new Messages page
import OrdersPage from './features/orders/OrdersPage'; // Import the Orders page
import AppointmentsPage from './features/appointments/AppointmentsPage'; // Import the Appointments page

// Import Layout component
import Layout from './components/layout/Layout';
import AuthProvider from './contexts/AuthContext';

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <>
      <Helmet>
        <title>Bespoke Tailor</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover" />
        <meta name="description" content="Premium tailor services for international clients" />
        {/* Theme color meta tag will be handled by MUI ThemeProvider */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo192.png" />
      </Helmet>
      <AuthProvider>
        <Layout toggleTheme={toggleTheme}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/measurements" element={<MeasurementsPage />} />
            <Route path="/measurements/new" element={<NewMeasurementPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/catalog/:id" element={<ProductDetailPage />} />
            <Route path="/messages" element={<MessagesPage />} /> {/* Add the messages route */}
            <Route path="/orders" element={<OrdersPage />} /> {/* Add the orders route */}
            <Route path="/appointments" element={<AppointmentsPage />} /> {/* Add the appointments route */}
            {/* Add other routes as needed */}
          </Routes>
        </Layout>
      </AuthProvider>
      {import.meta.env.MODE === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </>
  );
}

export default App;