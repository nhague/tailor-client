// File: src/pages/home.tsx
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Chip,
  Avatar,
  CardMedia,
  CircularProgress,
  IconButton,
  useTheme,
  useMediaQuery,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  ChevronRight as ChevronRightIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Order } from '../../types/order';
import { Appointment } from '../../types/appointment';
import { formatDistanceToNow } from 'date-fns';

interface HomePageProps {
  toggleTheme: () => void;
}

const HomePage = ({ toggleTheme }: HomePageProps) => {
  const { userProfile } = useAuth();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Quick action items for the home screen
  const quickActions = [
    { icon: '📏', label: 'Update Measurements', link: '/measurements/new' },
    { icon: '👔', label: 'New Order', link: '/orders/new' },
    { icon: '📅', label: 'Book Appointment', link: '/appointments/new' },
    { icon: '💬', label: 'Contact Tailor', link: '/messages' },
  ];

  // Fetch active orders, upcoming appointments, and recommended products
  useEffect(() => {
    const fetchData = async () => {
      if (!userProfile) return;

      try {
        // Fetch active orders
        const ordersQuery = query(
          collection(db, 'orders'),
          where('userId', '==', userProfile.uid),
          where('status', 'in', ['pending', 'processing', 'shipping']),
          orderBy('dateCreated', 'desc'),
          limit(5)
        );
        
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          dateCreated: doc.data().dateCreated?.toDate() || new Date(),
        })) as Order[];
        
        setActiveOrders(ordersData);

        // Fetch upcoming appointment
        const now = new Date();
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('userId', '==', userProfile.uid),
          where('dateTime', '>=', now),
          where('status', 'in', ['scheduled', 'confirmed']),
          orderBy('dateTime'),
          limit(1)
        );
        
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        if (!appointmentsSnapshot.empty) {
          const appointmentData = {
            id: appointmentsSnapshot.docs[0].id,
            ...appointmentsSnapshot.docs[0].data(),
            dateTime: appointmentsSnapshot.docs[0].data().dateTime?.toDate() || new Date(),
          } as Appointment;
          
          setUpcomingAppointment(appointmentData);
        }

        // For demo purposes, set some sample recommended products
        setRecommendedProducts([
          {
            id: 'prod1',
            name: 'Classic Navy Suit',
            imageUrl: '/api/placeholder/200/300',
            basePrice: 699,
            currency: 'USD',
          },
          {
            id: 'prod2',
            name: 'White Oxford Shirt',
            imageUrl: '/api/placeholder/200/300',
            basePrice: 129,
            currency: 'USD',
          },
          {
            id: 'prod3',
            name: 'Grey Wool Trousers',
            imageUrl: '/api/placeholder/200/300',
            basePrice: 199,
            currency: 'USD',
          },
          {
            id: 'prod4',
            name: 'Silk Tie Collection',
            imageUrl: '/api/placeholder/200/300',
            basePrice: 79,
            currency: 'USD',
          },
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching home data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [userProfile]);

  const toggleFavorite = (productId: string) => {
    setFavoriteItems((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.palette.info.main;
      case 'processing':
        return theme.palette.warning.main;
      case 'shipping':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Layout toggleTheme={toggleTheme}>
      <Helmet>
        <title>Home | Bespoke Tailor</title>
      </Helmet>

      <Box sx={{ pb: 6 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome, {userProfile ? userProfile.firstName : 'Client'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your premium tailoring experience awaits
          </Typography>
        </Box>

        {/* Tailor Location Banner */}
        <Card
          sx={{
            mb: 4,
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0.15,
              backgroundImage: 'url(/api/placeholder/800/200)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <CardContent sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ mr: 0.5, fontSize: '1rem' }} /> TAILOR LOCATION
                </Typography>
                <Typography variant="h5" sx={{ mb: 0.5 }}>
                  Bangkok, Thailand
                </Typography>
                <Typography variant="body2">
                  April 25-30, 2025 • Mandarin Oriental Hotel
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'white',
                  }
                }}
                component={Link}
                to="/appointments/new"
              >
                Book Now
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Typography variant="h5" sx={{ mb: 2 }}>
          Quick Actions
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {quickActions.map((action, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Card
                component={Link}
                to={action.link}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <Typography variant="h4" sx={{ mb: 1 }}>
                  {action.icon}
                </Typography>
                <Typography variant="body2" align="center">
                  {action.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Active Orders */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Your Orders</Typography>
            <Button
              component={Link}
              to="/orders"
              endIcon={<ChevronRightIcon />}
              sx={{ textTransform: 'none' }}
            >
              View All
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', overflow: 'auto', pb: 1, mx: -2, px: 2 }}>
              {[1, 2, 3].map((item) => (
                <Card key={item} sx={{ minWidth: 280, mr: 2, flexShrink: 0 }}>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={32} />
                    <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" height={20} width="70%" />
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : activeOrders.length > 0 ? (
            <Box sx={{ display: 'flex', overflow: 'auto', pb: 1, mx: -2, px: 2 }}>
              {activeOrders.map((order) => (
                <Card
                  key={order.id}
                  sx={{
                    minWidth: 280,
                    mr: 2,
                    flexShrink: 0,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                  component={Link}
                  to={`/orders/${order.id}`}
                >
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Order #{order.id.substring(0, 8)}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Placed {formatDistanceToNow(new Date(order.dateCreated), { addSuffix: true })}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip
                        label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        size="small"
                        sx={{
                          bgcolor: getOrderStatusColor(order.status),
                          color: 'white',
                          fontWeight: 500,
                        }}
                      />
                      <Typography variant="subtitle1">
                        {formatCurrency(order.total, order.currency)}
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Card sx={{ bgcolor: 'background.paper', mb: 4 }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" paragraph>
                  You don't have any active orders yet.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  component={Link}
                  to="/orders/new"
                >
                  Create New Order
                </Button>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Upcoming Appointment */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Upcoming Appointment
          </Typography>

          {loading ? (
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={20} width="70%" />
              </CardContent>
            </Card>
          ) : upcomingAppointment ? (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      {upcomingAppointment.purpose.charAt(0).toUpperCase() + upcomingAppointment.purpose.slice(1)} Appointment
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarTodayIcon
                        fontSize="small"
                        color="action"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2">
                        {new Date(upcomingAppointment.dateTime).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTimeIcon
                        fontSize="small"
                        color="action"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2">
                        {new Date(upcomingAppointment.dateTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })} - {new Date(new Date(upcomingAppointment.dateTime).getTime() + upcomingAppointment.duration * 60000).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOnIcon
                        fontSize="small"
                        color="action"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2">
                        {upcomingAppointment.location.type === 'shop' ? 'Tailor Shop, Phuket' : upcomingAppointment.location.address}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mb: 1 }}
                      component={Link}
                      to={`/appointments/${upcomingAppointment.id}`}
                    >
                      Details
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      component={Link}
                      to={`/appointments/${upcomingAppointment.id}/reschedule`}
                    >
                      Reschedule
                    </Button>
                  </Box>
                </Box>

                {upcomingAppointment.notes && (
                  <>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      {upcomingAppointment.notes}
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ bgcolor: 'background.paper' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" paragraph>
                  You don't have any upcoming appointments.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  component={Link}
                  to="/appointments/new"
                >
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Recommended Products */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Recommended For You</Typography>
            <Button
              component={Link}
              to="/catalog"
              endIcon={<ChevronRightIcon />}
              sx={{ textTransform: 'none' }}
            >
              View Catalog
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', overflow: 'auto', pb: 1, mx: -2, px: 2 }}>
              {[1, 2, 3, 4].map((item) => (
                <Card key={item} sx={{ width: 200, mr: 2, flexShrink: 0 }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={24} />
                    <Skeleton variant="text" width="50%" height={20} />
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', overflow: 'auto', pb: 1, mx: -2, px: 2 }}>
              {recommendedProducts.map((product) => (
                <Card
                  key={product.id}
                  sx={{
                    width: 200,
                    mr: 2,
                    flexShrink: 0,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.imageUrl}
                      alt={product.name}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'background.paper',
                        '&:hover': {
                          bgcolor: 'background.paper',
                        },
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                    >
                      {favoriteItems.has(product.id) ? (
                        <FavoriteIcon color="error" />
                      ) : (
                        <FavoriteBorderIcon />
                      )}
                    </IconButton>
                  </Box>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom noWrap>
                      {product.name}
                    </Typography>
                    <Typography variant="subtitle2" color="primary">
                      {formatCurrency(product.basePrice, product.currency)}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Layout>
  );
};

export default HomePage;