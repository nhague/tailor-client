// File: src/features/orders/OrdersPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Paper,
  useMediaQuery,
  ListItemIcon, // Added for Sort Menu icons
} from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent } from '@mui/lab';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon, // Keep if needed elsewhere, not used in provided snippet
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Sort as SortIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as ClockIcon,
  Inventory as InventoryIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  ArrowUpward as ArrowUpwardIcon, // Added for Sort Menu
  ArrowDownward as ArrowDownwardIcon, // Added for Sort Menu
} from '@mui/icons-material';
import { styled, useTheme, Theme } from '@mui/material/styles';
import { format, formatDistance } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Order, OrderItem, OrderStatus, OrderTimelineEvent, ShippingAddress } from 'src/types/order'; // Assuming these types exist
import { UserProfile } from 'src/types/user'; // Assuming UserProfile type

// Define necessary nested types if not fully covered in src/types/order.ts
// Example: If OrderItem customizations are not typed
interface OrderItemCustomizations {
  [key: string]: string | number | boolean;
}

// Define Filter state type
interface OrderFilters {
  status: OrderStatus[];
  dateRange: 'all' | 'last30' | 'last90' | 'last180';
  priceRange: 'all' | 'under200' | '200to500' | 'over500';
}

const OrdersPage: React.FC = () => {
  const theme: Theme = useTheme();
  const isMobile: boolean = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser, userProfile } = useAuth(); // Assuming useAuth provides typed currentUser and userProfile
  const navigate = useNavigate();
  const location = useLocation();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tabValue, setTabValue] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState<boolean>(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<keyof Pick<Order, 'dateCreated' | 'total' | 'status'>>('dateCreated');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<OrderFilters>({
    status: [],
    dateRange: 'all',
    priceRange: 'all',
  });

  // --- Data Fetching ---
  const fetchOrders = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      setOrders([]); // Clear orders if no user
      return;
    }
    setLoading(true);
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', currentUser.uid),
        // We apply sorting later after filtering client-side for this example
        // If performance becomes an issue with large datasets, server-side sorting is better
        // orderBy(sortBy, sortDirection)
        orderBy('dateCreated', 'desc') // Default sort by date initially
      );

      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(doc => {
          const data = doc.data();
          // Helper function to safely convert Firestore Timestamp to Date
          const toDate = (timestamp: any): Date | undefined => {
              if (timestamp instanceof Timestamp) {
                  return timestamp.toDate();
              }
              // Handle cases where it might already be a Date (e.g., from local state update)
              if (timestamp instanceof Date) {
                  return timestamp;
              }
              // Handle potential string dates if necessary, though Firestore Timestamps are preferred
              if (typeof timestamp === 'string') {
                  try {
                      return new Date(timestamp);
                  } catch (e) { return undefined; }
              }
              // Handle Firestore v8 seconds/nanoseconds object if needed (though v9 Timestamps are standard)
              if (timestamp && typeof timestamp.seconds === 'number') {
                 return new Timestamp(timestamp.seconds, timestamp.nanoseconds || 0).toDate();
              }
              return undefined; // Return undefined if conversion is not possible
          };

          return {
              id: doc.id,
              userId: data.userId,
              dateCreated: toDate(data.dateCreated) || new Date(), // Fallback to now if undefined
              status: data.status as OrderStatus,
              items: (data.items || []).map((item: any) => ({
                  ...item,
                  // Ensure nested types if needed, e.g., price is number
                  price: Number(item.price || 0),
                  quantity: Number(item.quantity || 1),
                  customizations: item.customizations || {},
              })) as OrderItem[],
              measurementId: data.measurementId,
              shippingAddress: data.shippingAddress || {},
              billingAddress: data.billingAddress || {},
              paymentInfo: {
                  ...data.paymentInfo,
                  amount: Number(data.paymentInfo?.amount || 0),
                  depositAmount: Number(data.paymentInfo?.depositAmount || 0),
                  remainingAmount: Number(data.paymentInfo?.remainingAmount || 0),
              },
              shipping: {
                  ...data.shipping,
                  estimatedDelivery: toDate(data.shipping?.estimatedDelivery),
                  deliveryDate: toDate(data.shipping?.deliveryDate),
                  shippingCost: Number(data.shipping?.shippingCost || 0),
              },
              subtotal: Number(data.subtotal || 0),
              tax: Number(data.tax || 0),
              discount: data.discount ? {
                  ...data.discount,
                  amount: Number(data.discount.amount || 0),
              } : undefined,
              total: Number(data.total || 0),
              currency: data.currency || 'USD',
              timeline: (data.timeline || []).map((event: any) => ({
                  ...event,
                  status: event.status as OrderStatus,
                  date: toDate(event.date) || new Date(),
              })) as OrderTimelineEvent[],
          } as Order;
      });

      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Handle error state appropriately, e.g., show a message to the user
    } finally {
      setLoading(false);
    }
  }, [currentUser/*, sortBy, sortDirection*/]); // Remove sort dependencies if sorting client-side

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]); // Depend on the memoized fetch function

  // --- URL Param Handling ---
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const orderId = searchParams.get('orderId');

    if (orderId && orders.length > 0) {
      const order = orders.find(o => o.id === orderId);
      if (order && !orderDetailsOpen) { // Only open if not already open
        setSelectedOrder(order);
        setOrderDetailsOpen(true);
      }
    } else if (!orderId && orderDetailsOpen) {
        // Close dialog if orderId is removed from URL
        handleCloseDetails();
    }
    // Intentionally limit dependencies: only react when URL or orders list changes significantly
  }, [location.search, orders]); // eslint-disable-line react-hooks/exhaustive-deps


  // --- Event Handlers ---
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortSelect = (sortField: keyof Pick<Order, 'dateCreated' | 'total' | 'status'>) => {
    if (sortField === sortBy) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(sortField);
      setSortDirection('desc');
    }
    handleSortClose();
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleStatusFilterChange = (status: OrderStatus) => {
    setFilters(prev => {
      const updatedStatuses = prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status];
      return { ...prev, status: updatedStatuses };
    });
  };

  const handleDateRangeChange = (range: OrderFilters['dateRange']) => {
    setFilters(prev => ({ ...prev, dateRange: range }));
    // Keep filter menu open while selecting multiple options if desired
    // handleFilterClose();
  };

  const handlePriceRangeChange = (range: OrderFilters['priceRange']) => {
    setFilters(prev => ({ ...prev, priceRange: range }));
    // Keep filter menu open while selecting multiple options if desired
    // handleFilterClose();
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      dateRange: 'all',
      priceRange: 'all',
    });
    // Keep filter menu open after clearing if desired
    // handleFilterClose();
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('orderId', order.id);
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  };

  // Use useCallback to prevent unnecessary re-renders if passed as prop
  const handleCloseDetails = useCallback(() => {
    setOrderDetailsOpen(false);
    setSelectedOrder(null);
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('orderId');
    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
  }, [location.pathname, location.search, navigate]);


  const handleTrackOrder = (trackingNumber: string | undefined, carrier: string | undefined) => {
    if (!trackingNumber || !carrier) return;
    const url = carrier.toLowerCase() === 'ups'
        ? `https://www.ups.com/track?tracknum=${trackingNumber}`
        : `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
    window.open(url, '_blank');
  };

  const handleCancelOrder = () => {
    if (!selectedOrder || !['pending', 'processing'].includes(selectedOrder.status)) return;
    setCancelDialogOpen(true);
  };

  const confirmCancelOrder = async () => {
    if (!selectedOrder) return;

    // --- Real Implementation Placeholder ---
    // try {
    //   // 1. Update Firestore document status to 'canceled'
    //   // const orderRef = doc(db, 'orders', selectedOrder.id);
    //   // await updateDoc(orderRef, {
    //   //   status: 'canceled',
    //   //   timeline: arrayUnion({ // Add cancellation event to timeline
    //   //     status: 'canceled',
    //   //     date: Timestamp.now(),
    //   //     note: 'Order canceled by customer'
    //   //   })
    //   // });
    //
    //   // 2. Update local state AFTER successful Firestore update
    //   const updatedTimelineEvent: OrderTimelineEvent = {
    //     status: 'canceled',
    //     date: new Date(),
    //     note: 'Order canceled by customer'
    //   };
    //   const updatedOrder: Order = {
    //       ...selectedOrder,
    //       status: 'canceled',
    //       timeline: [...selectedOrder.timeline, updatedTimelineEvent]
    //   };
    //   setOrders(prevOrders => prevOrders.map(o => o.id === selectedOrder.id ? updatedOrder : o));
    //   setSelectedOrder(updatedOrder);
    //   setCancelDialogOpen(false);
    //
    // } catch (error) {
    //   console.error("Error canceling order:", error);
    //   // Show error message to user
    //   setCancelDialogOpen(false); // Close dialog even on error
    // }
    // --- End Real Implementation Placeholder ---

    // --- Demo Implementation (Update local state only) ---
    const updatedTimelineEvent: OrderTimelineEvent = {
      status: 'canceled',
      date: new Date(),
      note: 'Order canceled by customer'
    };
    const updatedOrder: Order = {
        ...selectedOrder,
        status: 'canceled',
        timeline: [...selectedOrder.timeline, updatedTimelineEvent]
    };
    setOrders(prevOrders => prevOrders.map(o => o.id === selectedOrder.id ? updatedOrder : o));
    setSelectedOrder(updatedOrder); // Update the selected order in the dialog
    setCancelDialogOpen(false);
    // --- End Demo Implementation ---
  };

  // --- UI Helpers ---
  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case 'pending': return theme.palette.info.main;
      case 'processing': return theme.palette.warning.main;
      case 'shipping': return theme.palette.secondary.main; // Or another distinct color
      case 'delivered': return theme.palette.success.main;
      case 'canceled': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: OrderStatus): React.ReactElement => {
    switch (status) {
      case 'pending': return <ClockIcon />;
      case 'processing': return <InventoryIcon />;
      case 'shipping': return <ShippingIcon />;
      case 'delivered': return <CheckCircleIcon />;
      case 'canceled': return <CloseIcon />;
      default: return <InventoryIcon />; // Fallback icon
    }
  };

  const formatCurrency = (amount: number | undefined, currency: string | undefined): string => {
    if (amount === undefined || amount === null) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  // --- Filtering and Sorting Logic ---
  const filteredAndSortedOrders = React.useMemo(() => {
    const filtered = orders.filter(order => {
      // Tab filter
      if (tabValue === 1 && !['pending', 'processing'].includes(order.status)) return false;
      if (tabValue === 2 && order.status !== 'shipping') return false;
      if (tabValue === 3 && order.status !== 'delivered') return false;
      if (tabValue === 4 && order.status !== 'canceled') return false;

      // Search filter
      if (searchQuery) {
        const queryLower = searchQuery.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(queryLower);
        const matchesItem = order.items.some(item =>
          item.productName?.toLowerCase().includes(queryLower) ||
          item.fabricName?.toLowerCase().includes(queryLower)
        );
        if (!matchesId && !matchesItem) return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(order.status)) return false;

      // Date range filter
      if (filters.dateRange !== 'all') {
        const now = new Date().getTime();
        const orderTime = order.dateCreated.getTime();
        const daysDiff = Math.floor((now - orderTime) / (1000 * 60 * 60 * 24));

        if (filters.dateRange === 'last30' && daysDiff > 30) return false;
        if (filters.dateRange === 'last90' && daysDiff > 90) return false;
        if (filters.dateRange === 'last180' && daysDiff > 180) return false;
      }

      // Price range filter
      if (filters.priceRange !== 'all') {
        const price = order.total;
        if (filters.priceRange === 'under200' && price >= 200) return false;
        if (filters.priceRange === '200to500' && (price < 200 || price >= 500)) return false; // Note: >= 500
        if (filters.priceRange === 'over500' && price < 500) return false; // Note: < 500
      }

      return true;
    });

    // Sorting
    return [...filtered].sort((a, b) => {
      let compareA: string | number | Date;
      let compareB: string | number | Date;

      switch (sortBy) {
        case 'dateCreated':
          compareA = a.dateCreated.getTime();
          compareB = b.dateCreated.getTime();
          break;
        case 'total':
          compareA = a.total;
          compareB = b.total;
          break;
        case 'status':
          // Define a sort order for statuses if needed, otherwise alphabetical
          const statusOrder: Record<OrderStatus, number> = { pending: 1, processing: 2, shipping: 3, delivered: 4, canceled: 5 };
          compareA = statusOrder[a.status] ?? 99;
          compareB = statusOrder[b.status] ?? 99;
          break;
        default: // Fallback to dateCreated
          compareA = a.dateCreated.getTime();
          compareB = b.dateCreated.getTime();
      }

      // Handle potential undefined values if necessary, though types should prevent this
      compareA = compareA ?? (typeof compareB === 'number' ? 0 : '');
      compareB = compareB ?? (typeof compareA === 'number' ? 0 : '');


      if (typeof compareA === 'string' && typeof compareB === 'string') {
          return sortDirection === 'asc'
              ? compareA.localeCompare(compareB)
              : compareB.localeCompare(compareA);
      } else if (typeof compareA === 'number' && typeof compareB === 'number') {
          return sortDirection === 'asc'
              ? compareA - compareB
              : compareB - compareA;
      }
      // Fallback comparison (should ideally not be reached with proper typing)
      return 0;
    });
  }, [orders, tabValue, searchQuery, filters, sortBy, sortDirection]);


  // --- Render ---
  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}> {/* Adjust height based on actual header height */}
      {/* Header (Assuming Layout provides header, otherwise add here) */}
      {/* Example Header if not in Layout: */}
       <Box
         component="header"
         sx={{
           p: 2,
           // Use theme colors
           backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.primary.main,
           color: theme.palette.primary.contrastText,
           boxShadow: theme.shadows[3],
           zIndex: theme.zIndex.appBar, // Use theme zIndex
         }}
       >
         <Typography variant="h5" component="h1" sx={{ fontFamily: theme.typography.h5.fontFamily }}>
           My Orders
         </Typography>
       </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: { xs: 1, sm: 2, md: 3 } }}> {/* Responsive padding */}
        {/* Top Section - Tabs, Search, Filters */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md="auto"> {/* Adjust grid sizing */}
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons={isMobile ? "auto" : false}
                allowScrollButtonsMobile // Ensure scroll buttons show on mobile
                indicatorColor="primary"
                textColor="primary"
                sx={{ borderBottom: 1, borderColor: 'divider' }} // Add subtle divider
              >
                <Tab label="All Orders" />
                <Tab label="In Progress" />
                <Tab label="Shipping" />
                <Tab label="Delivered" />
                <Tab label="Canceled" />
              </Tabs>
            </Grid>
            <Grid item xs={12} md> {/* Adjust grid sizing */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end'} }}>
                <TextField
                  placeholder="Search ID, Product..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  size="small"
                  sx={{ flexGrow: { xs: 1, md: 0 }, minWidth: '200px' }} // Control growth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<SortIcon />}
                  onClick={handleSortClick}
                  size="small"
                  aria-controls="sort-menu"
                  aria-haspopup="true"
                >
                  Sort
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={handleFilterClick}
                  size="small"
                  aria-controls="filter-menu"
                  aria-haspopup="true"
                  // Use primary color if filters are active
                  color={filters.status.length > 0 || filters.dateRange !== 'all' || filters.priceRange !== 'all' ? "primary" : "inherit"}
                >
                  Filter {filters.status.length > 0 || filters.dateRange !== 'all' || filters.priceRange !== 'all' ? `(${filters.status.length + (filters.dateRange !== 'all' ? 1:0) + (filters.priceRange !== 'all' ? 1:0)})` : ''}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => navigate('/orders/new')} // Verified path
                >
                  New Order
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Sort Menu */}
        <Menu
          id="sort-menu"
          anchorEl={sortAnchorEl}
          open={Boolean(sortAnchorEl)}
          onClose={handleSortClose}
        >
          <MenuItem
            onClick={() => handleSortSelect('dateCreated')}
            selected={sortBy === 'dateCreated'}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              {sortBy === 'dateCreated' && (sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
            </ListItemIcon>
            Date
          </MenuItem>
          <MenuItem
            onClick={() => handleSortSelect('total')}
            selected={sortBy === 'total'}
          >
             <ListItemIcon sx={{ minWidth: 32 }}>
              {sortBy === 'total' && (sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
            </ListItemIcon>
            Price
          </MenuItem>
          <MenuItem
            onClick={() => handleSortSelect('status')}
            selected={sortBy === 'status'}
          >
             <ListItemIcon sx={{ minWidth: 32 }}>
              {sortBy === 'status' && (sortDirection === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
            </ListItemIcon>
            Status
          </MenuItem>
        </Menu>

        {/* Filter Menu */}
        <Menu
          id="filter-menu"
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
          PaperProps={{ sx: { width: 320, maxHeight: '80vh' } }} // Limit height
          MenuListProps={{ sx: { overflowY: 'auto' } }} // Make content scrollable
        >
          <Typography variant="subtitle1" sx={{ p: 2, pb: 1 }}>
            Filter by Status
          </Typography>
          <Box sx={{ px: 2, pb: 1 }}>
            <Grid container spacing={1}>
              {(['pending', 'processing', 'shipping', 'delivered', 'canceled'] as OrderStatus[]).map((status) => (
                <Grid item key={status}>
                  <Chip
                    label={status.charAt(0).toUpperCase() + status.slice(1)}
                    onClick={() => handleStatusFilterChange(status)}
                    color={filters.status.includes(status) ? "primary" : "default"}
                    variant={filters.status.includes(status) ? "filled" : "outlined"}
                    size="small" // Smaller chips
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle1" sx={{ px: 2, py: 1 }}>
            Filter by Date
          </Typography>
          <MenuItem dense onClick={() => handleDateRangeChange('all')} selected={filters.dateRange === 'all'}>All time</MenuItem>
          <MenuItem dense onClick={() => handleDateRangeChange('last30')} selected={filters.dateRange === 'last30'}>Last 30 days</MenuItem>
          <MenuItem dense onClick={() => handleDateRangeChange('last90')} selected={filters.dateRange === 'last90'}>Last 90 days</MenuItem>
          <MenuItem dense onClick={() => handleDateRangeChange('last180')} selected={filters.dateRange === 'last180'}>Last 180 days</MenuItem>

          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle1" sx={{ px: 2, py: 1 }}>
            Filter by Price
          </Typography>
          <MenuItem dense onClick={() => handlePriceRangeChange('all')} selected={filters.priceRange === 'all'}>All prices</MenuItem>
          <MenuItem dense onClick={() => handlePriceRangeChange('under200')} selected={filters.priceRange === 'under200'}>Under {formatCurrency(200, 'USD')}</MenuItem>
          <MenuItem dense onClick={() => handlePriceRangeChange('200to500')} selected={filters.priceRange === '200to500'}>{formatCurrency(200, 'USD')} - {formatCurrency(500, 'USD')}</MenuItem>
          <MenuItem dense onClick={() => handlePriceRangeChange('over500')} selected={filters.priceRange === 'over500'}>Over {formatCurrency(500, 'USD')}</MenuItem>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', borderTop: 1, borderColor: 'divider', position: 'sticky', bottom: 0, bgcolor: 'background.paper' }}>
            <Button
              size="small"
              onClick={clearFilters}
              disabled={filters.status.length === 0 && filters.dateRange === 'all' && filters.priceRange === 'all'}
            >
              Clear Filters
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleFilterClose} // Apply closes the menu
            >
              Apply
            </Button>
          </Box>
        </Menu>

        {/* Orders List */}
        <Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredAndSortedOrders.length === 0 ? (
            <Paper sx={{ py: 4, textAlign: 'center', mt: 2, bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom>No orders found</Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {searchQuery || filters.status.length > 0 || filters.dateRange !== 'all' || filters.priceRange !== 'all'
                  ? "Try adjusting your search or filters."
                  : "You haven't placed any orders yet."}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/orders/new')} // Verified path
              >
                Place Your First Order
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {filteredAndSortedOrders.map((order) => (
                <Grid item xs={12} key={order.id}>
                  <Card sx={{
                    position: 'relative',
                    transition: theme.transitions.create(['transform', 'box-shadow']), // Use theme transitions
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4], // Use theme shadows
                    },
                  }}>
                    <CardContent sx={{ pb: '16px !important' }}> {/* Ensure padding consistency */}
                      <Grid container spacing={2} alignItems="center">
                        {/* Order Summary */}
                        <Grid item xs={12} sm={6} md={3}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              Order #{order.id.slice(-6)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {format(order.dateCreated, 'MMM d, yyyy')}
                            </Typography>
                            <Chip
                              label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              size="small"
                              sx={{
                                mt: 1,
                                bgcolor: getStatusColor(order.status),
                                color: theme.palette.getContrastText(getStatusColor(order.status)), // Ensure contrast
                                fontWeight: 'medium', // Use theme font weights
                              }}
                              icon={
                                <Box sx={{
                                  color: 'inherit', // Inherit color for icon
                                  display: 'flex',
                                  alignItems: 'center',
                                  mr: 0.5, // Add space between icon and label
                                  '& .MuiSvgIcon-root': { fontSize: '1rem' }
                                }}>
                                  {getStatusIcon(order.status)}
                                </Box>
                              }
                            />
                          </Box>
                        </Grid>

                        {/* Order Items */}
                        <Grid item xs={12} sm={6} md={4}>
                           {/* Limit displayed items and show "+X more" chip */}
                           <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {order.items.slice(0, 1).map((item, i) => (
                                    <Box key={item.productId || i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                                        <Box
                                            component="img"
                                            src={item.imageUrl || '/api/placeholder/60/80'} // Provide fallback
                                            alt={item.productName}
                                            sx={{
                                                width: 60,
                                                height: 80,
                                                objectFit: 'cover',
                                                borderRadius: theme.shape.borderRadius * 0.5, // Use theme border radius
                                                flexShrink: 0,
                                            }}
                                        />
                                        <Box sx={{ overflow: 'hidden' }}>
                                            <Typography variant="subtitle2" noWrap title={item.productName}>
                                                {item.productName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" noWrap title={item.fabricName}>
                                                {item.fabricName}
                                            </Typography>
                                            <Typography variant="body2">
                                                {formatCurrency(item.price, order.currency)} &times; {item.quantity}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                                {order.items.length > 1 && (
                                    <Chip
                                        label={`+${order.items.length - 1}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ alignSelf: 'center', ml: 'auto' }} // Position chip nicely
                                    />
                                )}
                            </Box>
                        </Grid>

                        {/* Order Total & Shipping */}
                        <Grid item xs={6} sm={6} md={3}>
                          <Box>
                            <Typography variant="subtitle2">
                              Total: {formatCurrency(order.total, order.currency)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                              {order.status === 'shipping' || order.status === 'delivered' ? (
                                <>
                                  <ShippingIcon fontSize="small" />
                                  {order.shipping.carrier || 'Shipped'} {order.shipping.deliveryDate ? `- Delivered ${format(order.shipping.deliveryDate, 'MMM d')}` : ''}
                                </>
                              ) : (
                                <>
                                  <ClockIcon fontSize="small" />
                                  Est. Delivery: {order.shipping.estimatedDelivery ? format(order.shipping.estimatedDelivery, 'MMM d, yyyy') : 'TBD'}
                                </>
                              )}
                            </Typography>
                            {order.paymentInfo.depositAmount > 0 && !order.paymentInfo.paidInFull && (
                              <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <PaymentIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  Deposit: {formatCurrency(order.paymentInfo.depositAmount, order.currency)}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Grid>

                        {/* Actions */}
                        <Grid item xs={6} sm={6} md={2}>
                          <Box sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-end', // Align actions to the right
                            gap: 1, // Add gap between buttons
                          }}>
                            <Button
                              variant="contained" // Make details primary action
                              size="small"
                              endIcon={<ChevronRightIcon />}
                              onClick={() => handleViewDetails(order)}
                            >
                              Details
                            </Button>
                            {order.status === 'shipping' && order.shipping.trackingNumber && (
                              <Button
                                variant="outlined" // Secondary action
                                size="small"
                                onClick={() => handleTrackOrder(order.shipping.trackingNumber, order.shipping.carrier)}
                                startIcon={<ShippingIcon />}
                              >
                                Track
                              </Button>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>

      {/* Order Details Dialog */}
      <Dialog
        open={orderDetailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        scroll="paper" // Allow content scrolling independently
      >
        {selectedOrder && (
          <>
            <DialogTitle sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper', // Use theme background
              position: 'sticky', top: 0, zIndex: 1 // Make title sticky
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isMobile && (
                  <IconButton edge="start" color="inherit" onClick={handleCloseDetails} aria-label="close" sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                  </IconButton>
                )}
                <Box>
                  <Typography variant="h6">Order #{selectedOrder.id.slice(-6)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Placed on {format(selectedOrder.dateCreated, 'MMMM d, yyyy')}
                  </Typography>
                </Box>
              </Box>
              {!isMobile && (
                <IconButton edge="end" color="inherit" onClick={handleCloseDetails} aria-label="close">
                  <CloseIcon />
                </IconButton>
              )}
            </DialogTitle>

            <DialogContent dividers sx={{ p: { xs: 1, sm: 2, md: 3 }, bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100] }}> {/* Use theme colors */}
              {/* Order Status Stepper/Timeline */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Order Status
                </Typography>
                {/* Simplified Status Display */}
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Chip
                        label={selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        sx={{
                            bgcolor: getStatusColor(selectedOrder.status),
                            color: theme.palette.getContrastText(getStatusColor(selectedOrder.status)),
                            fontWeight: 'medium',
                        }}
                        icon={
                            <Box sx={{ color: 'inherit', display: 'flex', alignItems: 'center', mr: 0.5, '& .MuiSvgIcon-root': { fontSize: '1.1rem' } }}>
                                {getStatusIcon(selectedOrder.status)}
                            </Box>
                        }
                    />
                    {selectedOrder.timeline.length > 0 && (
                        <Typography variant="body2" color="text.secondary">
                            Last update: {formatDistance(selectedOrder.timeline[selectedOrder.timeline.length - 1].date, new Date(), { addSuffix: true })}
                        </Typography>
                    )}
                 </Box>

                {/* Optional: Keep Stepper if preferred */}
                {/* <Stepper alternativeLabel activeStep={['pending', 'processing', 'shipping', 'delivered'].indexOf(selectedOrder.status)} sx={{ mb: 3 }}> ... </Stepper> */}

                {selectedOrder.status === 'shipping' && selectedOrder.shipping.trackingNumber && (
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<ShippingIcon />}
                      onClick={() => handleTrackOrder(selectedOrder.shipping.trackingNumber, selectedOrder.shipping.carrier)}
                    >
                      Track Shipment
                    </Button>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {selectedOrder.shipping.carrier} - {selectedOrder.shipping.trackingNumber}
                    </Typography>
                  </Box>
                )}
                {selectedOrder.status === 'canceled' && (
                  <Box sx={{ p: 2, bgcolor: 'error.lighter', color: 'error.dark', borderRadius: 1, textAlign: 'center', mt: 2 }}>
                    <Typography variant="subtitle1">This order has been canceled.</Typography>
                  </Box>
                )}
              </Paper>

              <Grid container spacing={3}>
                {/* Order Items */}
                <Grid item xs={12} md={7}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Items ({selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)})
                    </Typography>
                    <List disablePadding>
                      {selectedOrder.items.map((item, index) => (
                        <React.Fragment key={item.productId || index}>
                          <ListItem disablePadding sx={{ py: 1.5, alignItems: 'flex-start' }}> {/* Align items top */}
                            <Box
                              component="img"
                              src={item.imageUrl || '/api/placeholder/80/100'} // Fallback
                              alt={item.productName}
                              sx={{ width: 80, height: 100, objectFit: 'cover', borderRadius: 1, mr: 2, flexShrink: 0 }}
                            />
                            <ListItemText
                              primary={<Typography variant="subtitle2">{item.productName}</Typography>}
                              secondary={
                                <>
                                  <Typography variant="body2" color="text.secondary">{item.fabricName}</Typography>
                                  <Typography variant="body2" color="text.secondary">Qty: {item.quantity}</Typography>
                                  {Object.entries(item.customizations || {}).length > 0 && (
                                    <Box sx={{ mt: 1 }}>
                                      <Typography variant="caption" color="text.secondary" display="block">Customizations:</Typography>
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                        {Object.entries(item.customizations).map(([key, value]) => (
                                          <Chip
                                            key={key}
                                            label={`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontSize: '0.7rem', height: 'auto', '& .MuiChip-label': { py: 0.2, px: 0.8 } }}
                                          />
                                        ))}
                                      </Box>
                                    </Box>
                                  )}
                                </>
                              }
                              sx={{ mr: 1 }} // Add margin before price
                            />
                            <Typography variant="subtitle2" sx={{ textAlign: 'right', ml: 'auto' }}> {/* Align price right */}
                              {formatCurrency(item.price * item.quantity, selectedOrder.currency)}
                            </Typography>
                          </ListItem>
                          {index < selectedOrder.items.length - 1 && <Divider component="li" />} {/* Use component="li" for semantics */}
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                </Grid>

                {/* Order Summary & Details */}
                <Grid item xs={12} md={5}>
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Order Summary</Typography>
                    <Grid container spacing={0.5}> {/* Use grid for alignment */}
                      <Grid item xs={6}><Typography variant="body2">Subtotal</Typography></Grid>
                      <Grid item xs={6} sx={{ textAlign: 'right' }}><Typography variant="body2">{formatCurrency(selectedOrder.subtotal, selectedOrder.currency)}</Typography></Grid>

                      <Grid item xs={6}><Typography variant="body2">Shipping</Typography></Grid>
                      <Grid item xs={6} sx={{ textAlign: 'right' }}><Typography variant="body2">{formatCurrency(selectedOrder.shipping.shippingCost, selectedOrder.currency)}</Typography></Grid>

                      <Grid item xs={6}><Typography variant="body2">Tax</Typography></Grid>
                      <Grid item xs={6} sx={{ textAlign: 'right' }}><Typography variant="body2">{formatCurrency(selectedOrder.tax, selectedOrder.currency)}</Typography></Grid>

                      {selectedOrder.discount && (
                        <>
                          <Grid item xs={6}><Typography variant="body2">Discount {selectedOrder.discount.code && `(${selectedOrder.discount.code})`}</Typography></Grid>
                          <Grid item xs={6} sx={{ textAlign: 'right' }}><Typography variant="body2" color="success.main">-{formatCurrency(selectedOrder.discount.amount, selectedOrder.currency)}</Typography></Grid>
                        </>
                      )}
                    </Grid>
                    <Divider sx={{ my: 1.5 }} />
                    <Grid container spacing={0.5}>
                      <Grid item xs={6}><Typography variant="subtitle1">Total</Typography></Grid>
                      <Grid item xs={6} sx={{ textAlign: 'right' }}><Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{formatCurrency(selectedOrder.total, selectedOrder.currency)}</Typography></Grid>

                      {!selectedOrder.paymentInfo.paidInFull && selectedOrder.paymentInfo.depositAmount > 0 && (
                        <>
                          <Grid item xs={6}><Typography variant="body2">Deposit Paid</Typography></Grid>
                          <Grid item xs={6} sx={{ textAlign: 'right' }}><Typography variant="body2">{formatCurrency(selectedOrder.paymentInfo.depositAmount, selectedOrder.currency)}</Typography></Grid>
                          <Grid item xs={6}><Typography variant="body2">Balance Due</Typography></Grid>
                          <Grid item xs={6} sx={{ textAlign: 'right' }}><Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(selectedOrder.paymentInfo.remainingAmount, selectedOrder.currency)}</Typography></Grid>
                        </>
                      )}
                    </Grid>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                      <Typography variant="body1">
                        {selectedOrder.paymentInfo.method === 'credit_card' ? 'Credit Card' : selectedOrder.paymentInfo.method || 'N/A'}
                        {selectedOrder.paymentInfo.last4 && ` (**** ${selectedOrder.paymentInfo.last4})`}
                      </Typography>
                    </Box>
                  </Paper>

                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Shipping Address</Typography>
                    <Typography variant="body1">{(selectedOrder.shippingAddress as ShippingAddress).firstName} {(selectedOrder.shippingAddress as ShippingAddress).lastName}</Typography>
                    <Typography variant="body1">{(selectedOrder.shippingAddress as ShippingAddress).addressLine1}</Typography>
                    {(selectedOrder.shippingAddress as ShippingAddress).addressLine2 && <Typography variant="body1">{(selectedOrder.shippingAddress as ShippingAddress).addressLine2}</Typography>}
                    <Typography variant="body1">{(selectedOrder.shippingAddress as ShippingAddress).city}, {(selectedOrder.shippingAddress as ShippingAddress).state} {(selectedOrder.shippingAddress as ShippingAddress).postalCode}</Typography>
                    <Typography variant="body1">{(selectedOrder.shippingAddress as ShippingAddress).country}</Typography>
                  </Paper>

                  {/* Cancel Order Button */}
                  {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && (
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Button variant="outlined" color="error" onClick={handleCancelOrder}>
                        Cancel Order
                      </Button>
                    </Box>
                  )}
                </Grid>
              </Grid>

              {/* Order Timeline */}
              {selectedOrder.timeline.length > 0 && (
                <Paper sx={{ p: 2, mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Order Timeline
                  </Typography>
                  <Timeline position={isMobile ? "right" : "alternate"} sx={{ [`& .MuiTimelineItem-root::before`]: { flex: isMobile ? 0 : 1, padding: isMobile ? 0 : '6px 16px' } }}>
                    {selectedOrder.timeline.map((event, index) => (
                      <TimelineItem key={index}>
                        {!isMobile && (
                          <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.2 }}> {/* Adjust flex */}
                            {format(event.date, 'MMM d, yy')}
                            <br />
                            {format(event.date, 'h:mm a')}
                          </TimelineOppositeContent>
                        )}
                        <TimelineSeparator>
                          <TimelineDot sx={{ bgcolor: getStatusColor(event.status), boxShadow: theme.shadows[1] }}>
                            {getStatusIcon(event.status)}
                          </TimelineDot>
                          {index < selectedOrder.timeline.length - 1 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent sx={{ py: '12px', px: 2 }}>
                          <Typography variant="subtitle2" component="span">
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </Typography>
                          <Typography variant="body2">{event.note}</Typography>
                           {isMobile && (
                               <Typography variant="caption" display="block" color="text.secondary" sx={{mt: 0.5}}>
                                   {format(event.date, 'MMM d, yyyy, h:mm a')}
                               </Typography>
                           )}
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>
                </Paper>
              )}
            </DialogContent>

            <DialogActions sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap', // Allow wrapping on small screens
              gap: 1,
              position: 'sticky', bottom: 0, zIndex: 1, // Make actions sticky
              bgcolor: 'background.paper' // Use theme background
            }}>
              <Button startIcon={<ArrowBackIcon />} onClick={handleCloseDetails}>
                Back to Orders
              </Button>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {selectedOrder.status === 'delivered' && (
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/orders/reorder/${selectedOrder.id}`)} // Assuming reorder route
                  >
                    Reorder
                  </Button>
                )}
                <Button
                  variant="contained"
                  onClick={() => navigate(`/messages?orderId=${selectedOrder.id}`)} // Verified path
                >
                  Contact Support
                </Button>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Cancel Order Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        aria-labelledby="cancel-dialog-title"
      >
        <DialogTitle id="cancel-dialog-title">Cancel Order Confirmation</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to cancel order #{selectedOrder?.id.slice(-6)}? This action cannot be undone.
          </Typography>
          {selectedOrder?.status === 'processing' && (
            <Typography variant="body2" color="warning.dark" sx={{ mt: 2 }}>
              Note: This order is already being processed. Cancellation might be subject to review or fees depending on progress.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Keep Order
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmCancelOrder}
            autoFocus
          >
            Confirm Cancellation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersPage;