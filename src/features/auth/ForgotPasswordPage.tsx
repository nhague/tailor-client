import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Box, Button, Container, TextField, Typography, Link as MuiLink } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setError('');
      setMessage('');
      await resetPassword(email);
      setMessage('Check your inbox for further instructions');
    } catch (err: any) {
      setError('Failed to reset password');
      console.error(err);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password | Amorn</title>
      </Helmet>
      <Box
        component="main"
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexGrow: 1,
          minHeight: '100%'
        }}
      >
        <Container maxWidth="sm">
          <Link to="/login">
            <Button
              startIcon={<ArrowBackIcon fontSize="small" />}
            >
              Login
            </Button>
          </Link>
          <form onSubmit={handleSubmit}>
            <Box sx={{ my: 3 }}>
              <Typography
                color="textPrimary"
                variant="h4"
              >
                Forgot Password
              </Typography>
              <Typography
                color="textSecondary"
                gutterBottom
                variant="body2"
              >
                Enter your email address to receive a reset link
              </Typography>
            </Box>
            <TextField
              fullWidth
              label="Email Address"
              margin="normal"
              name="email"
              type="email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {message && (
              <Typography color="success.main" variant="body2" sx={{ mt: 2 }}>
                {message}
              </Typography>
            )}
            {error && (
              <Typography color="error.main" variant="body2" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            <Box sx={{ py: 2 }}>
              <Button
                color="primary"
                fullWidth
                size="large"
                type="submit"
                variant="contained"
              >
                Send reset link
              </Button>
            </Box>
          </form>
        </Container>
      </Box>
    </>
  );
};

export default ForgotPasswordPage;