// File: src/pages/login.tsx
import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Paper,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Google as GoogleIcon,
  Apple as AppleIcon,
  Facebook as FacebookIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await signIn(data.email, data.password);
      navigate('/home');
    } catch (err: any) {
      console.error('Login error', err);
      setError(
        err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found'
          ? 'Invalid email or password'
          : 'An error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      navigate('/home');
    } catch (err: any) {
      console.error('Google sign-in error', err);
      setError('An error occurred with Google sign-in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | Bespoke Tailor</title>
      </Helmet>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="displaySmall" component="h1" sx={{ mb: 2, fontFamily: 'Beatrice' }}>
              Welcome Back
            </Typography>

            <Typography variant="bodyMedium" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
              Sign in to your account to continue
            </Typography>

            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%' }}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    autoComplete="email"
                    autoFocus
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Controller
                  name="rememberMe"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} color="primary" />}
                      label="Remember me"
                    />
                  )}
                />

                <Link to="/forgot-password">
                  <MuiLink variant="bodyMedium" color="primary" sx={{ textDecoration: 'none' }}>
                    Forgot password?
                  </MuiLink>
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={isLoading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Box>

            <Divider sx={{ width: '100%', my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  onClick={handleGoogleSignIn}
                  startIcon={<GoogleIcon />}
                  disabled={isLoading}
                  sx={{
                    py: 1.25,
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.23)' : 'rgba(0,0,0,0.23)',
                  }}
                >
                  Sign in with Google
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  startIcon={<AppleIcon />}
                  disabled={isLoading}
                  sx={{
                    py: 1.25,
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.23)' : 'rgba(0,0,0,0.23)',
                  }}
                >
                  Sign in with Apple
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  startIcon={<FacebookIcon />}
                  disabled={isLoading}
                  sx={{
                    py: 1.25,
                    border: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.23)' : 'rgba(0,0,0,0.23)',
                  }}
                >
                  Sign in with Facebook
                </Button>
              </Grid>
            </Grid>

            <Typography variant="body2" align="center">
              Don't have an account?{' '}
              <Link to="/register">
                <MuiLink variant="body2" color="primary" sx={{ textDecoration: 'none', fontWeight: 500 }}>
                  Sign up now
                </MuiLink>
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default LoginPage;