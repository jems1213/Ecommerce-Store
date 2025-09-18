import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { API_BASE } from '../../utils/apiClient';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  CircularProgress,
  Grid,
  Alert,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
  Button,
  useMediaQuery,
  ThemeProvider,
  createTheme
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  ShoppingBag as OrderIcon,
  CalendarToday as DateIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CompletedIcon,
  Pending as PendingIcon,
  Cancel as CancelledIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';

// Custom theme for the order component
const orderTheme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f9f9f9',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    subtitle1: {
      fontWeight: 500,
    },
    body1: {
      lineHeight: 1.6,
    },
  },
});

// Styled components
const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: '8px !important',
  overflow: 'hidden',
  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 5px 15px rgba(0,0,0,0.12)',
    transform: 'translateY(-2px)',
  },
  '&:before': {
    display: 'none',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  let color;
  switch ((status || '').toLowerCase()) {
    case 'completed':
    case 'delivered':
      color = theme.palette.success.main;
      break;
    case 'processing':
    case 'shipped':
      color = theme.palette.info.main;
      break;
    case 'pending':
      color = theme.palette.warning.main;
      break;
    case 'cancelled':
    case 'failed':
      color = theme.palette.error.main;
      break;
    default:
      color = theme.palette.grey[500];
  }
  return {
    backgroundColor: `${color}20`,
    color: color,
    fontWeight: 600,
    borderRadius: '4px',
    padding: theme.spacing(0.5),
    '& .MuiChip-label': {
      padding: theme.spacing(0, 1),
    },
  };
});

const OrderTotal = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: '8px',
  padding: theme.spacing(2),
  borderLeft: `4px solid ${theme.palette.primary.main}`,
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.main,
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  marginRight: theme.spacing(2),
}));

const Order = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const isMobile = useMediaQuery('(max-width:900px)');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your orders');
          setLoading(false);
          navigate('/login');
          return;
        }

        const response = await api.get('/api/orders', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const fetchedOrders = response.data?.data?.orders || response.data?.orders || [];
        const validOrders = fetchedOrders.filter(order => order._id && typeof order._id === 'string');

        setOrders(validOrders);
        if (validOrders.length > 0) {
          setExpanded(validOrders[0]._id);
        }
      } catch (err) {
        console.error('Orders fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : null);
  };

  const getStatusIcon = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'completed':
      case 'delivered':
        return <CompletedIcon />;
      case 'processing':
      case 'shipped':
        return <PendingIcon />;
      case 'pending':
        return <PendingIcon />;
      case 'cancelled':
      case 'failed':
        return <CancelledIcon />;
      default:
        return <ErrorIcon />;
    }
  };

  const renderLoadingSkeletons = () => (
    <Box>
      {[1, 2, 3].map((item) => (
        <motion.div
          key={item}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: item * 0.1 }}
        >
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Skeleton variant="text" width={150} height={30} />
              <Skeleton variant="rectangular" width={100} height={30} sx={{ borderRadius: 1 }} />
            </Box>
            <Skeleton variant="text" width={200} />
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
              </Grid>
            </Grid>
          </Paper>
        </motion.div>
      ))}
    </Box>
  );

  
    const renderOrderItem = (item, index) => (
      <TableRow
        component={motion.tr}
        key={index}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <TableCell>
          <Box display="flex" alignItems="center">
            <motion.div whileHover={{ scale: 1.05 }}>
              <img
                src={item.image || '/placeholder-shoe.jpg'}
                alt={item.name || 'Product'}
                style={{
                  width: 60,
                  height: 60,
                  objectFit: 'cover',
                  marginRight: 12,
                  borderRadius: 4,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                onError={(e) => {
                  e.target.src = '/placeholder-shoe.jpg';
                }}
              />
            </motion.div>
            <Box>
              <Typography variant="body1" fontWeight={500}>
                {item.name || 'Unknown Product'}
              </Typography>
              {item.size && (
                <Typography variant="body2" color="text.secondary">
                  Size: {item.size}
                </Typography>
              )}
              {item.color && (
                <Typography variant="body2" color="text.secondary">
                  Color: {item.color}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                SKU: {item.shoeId?.toString().substring(0, 8).toUpperCase() || 'N/A'}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell align="right">₹{(item.price || 0).toFixed(2)}</TableCell>
        <TableCell align="center">{item.quantity || 0}</TableCell>
        <TableCell align="right">
          ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
        </TableCell>
      </TableRow>
   
  );

  const renderOrderDetails = (order) => {
    const orderDate = order.createdAt
      ? new Date(order.createdAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      : 'Date not available';

    const totalItems = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

    return (
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: 'background.paper' }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <IconWrapper>
                    <OrderIcon />
                  </IconWrapper>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Order Details
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {orderDate}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Items ({totalItems})
                </Typography>

                {order.items?.length > 0 ? (
                  <TableContainer component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="center">Qty</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {order.items.map(renderOrderItem)}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No items found in this order
                  </Typography>
                )}

                <Box mt={4}>
                  <OrderTotal component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body1">Subtotal:</Typography>
                      <Typography variant="body1">₹{(order.total || 0).toFixed(2)}</Typography>
                    </Box>
                    {order.paymentMethod === 'cod' && (
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body1">COD Fee:</Typography>
                        <Typography variant="body1">₹50.00</Typography>
                      </Box>
                    )}
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body1">Shipping:</Typography>
                      <Typography variant="body1">₹0.00</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="space-between" mt={2}>
                      <Typography variant="h6" fontWeight={600}>
                        Total Amount:
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        ₹{(order.paymentMethod === 'cod' ? (order.total || 0) + 50 : order.total || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </OrderTotal>
                </Box>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: 'background.paper' }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <IconWrapper>
                    <PersonIcon />
                  </IconWrapper>
                  <Typography variant="h6" fontWeight={600}>
                    Customer Information
                  </Typography>
                </Box>
                {order.user ? (
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Name"
                        secondary={`${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || 'Not specified'}
                        secondaryTypographyProps={{ color: 'text.secondary' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Email"
                        secondary={order.user.email || 'Not specified'}
                        secondaryTypographyProps={{ color: 'text.secondary' }}
                      />
                    </ListItem>
                  </List>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No customer information available
                  </Typography>
                )}
              </Paper>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: 'background.paper' }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <IconWrapper>
                    <PaymentIcon />
                  </IconWrapper>
                  <Typography variant="h6" fontWeight={600}>
                    Payment Information
                  </Typography>
                </Box>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Method"
                      secondary={order.paymentMethod ? order.paymentMethod.toUpperCase() : 'Not specified'}
                      secondaryTypographyProps={{ color: 'text.secondary' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Status"
                      secondaryTypographyProps={{ component: 'div' }} // Add this line
                      secondary={
                        <Box display="flex" alignItems="center">
                          {getStatusIcon(order.paymentStatus)}
                          <Box ml={1} component="span"> {/* Add component="span" */}
                            <StatusChip
                              label={(order.paymentStatus || 'pending').toUpperCase()}
                              status={order.paymentStatus}
                              size="small"
                            />
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </Paper>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2, backgroundColor: 'background.paper' }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <IconWrapper>
                    <ShippingIcon />
                  </IconWrapper>
                  <Typography variant="h6" fontWeight={600}>
                    Shipping Information
                  </Typography>
                </Box>
                {order.shippingInfo ? (
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Name"
                        secondary={order.shippingInfo.name || 'Not specified'}
                        secondaryTypographyProps={{ color: 'text.secondary' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Address"
                        secondary={[order.shippingInfo.address, order.shippingInfo.city, order.shippingInfo.state, order.shippingInfo.zip, order.shippingInfo.country]
                          .filter(Boolean)
                          .join(', ') || 'Not specified'}
                        secondaryTypographyProps={{ color: 'text.secondary' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Phone"
                        secondary={order.shippingInfo.phone || 'Not specified'}
                        secondaryTypographyProps={{ color: 'text.secondary' }}
                      />
                    </ListItem>
                  </List>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No shipping information available
                  </Typography>
                )}
                {order.trackingNumber && (
                  <Box mt={2}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      onClick={() => window.open(`https://tracking.com/?tracking=${order.trackingNumber}`, '_blank')}
                    >
                      Track Shipment
                    </Button>
                  </Box>
                )}
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </AccordionDetails>
    );
  };

  if (loading) {
    return (
      <ThemeProvider theme={orderTheme}>
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: '0 auto' }}>
          <Typography variant="h4" gutterBottom>
            Your Orders
          </Typography>
          {renderLoadingSkeletons()}
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={orderTheme}>
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="h6">Error Loading Orders</Typography>
              <Typography>{error}</Typography>
            </Alert>
            <Button
              variant="contained"
              color="primary"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </motion.div>
        </Box>
      </ThemeProvider>
    );
  }

  if (orders.length === 0) {
    return (
      <ThemeProvider theme={orderTheme}>
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Alert severity="info" sx={{ mb: 3, mt: 12 }}>
              <Typography variant="h6">No Orders Found</Typography>
              <Typography>You haven't placed any orders yet.</Typography>
            </Alert>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/shop')}
              sx={{ mt: 2 }}
            >
              Browse Products
            </Button>
          </motion.div>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={orderTheme}>
      <Box sx={{
        p: { xs: 2, md: 4 },
        maxWidth: 1200,
        margin: '0 auto',
        minHeight: '80vh'
      }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h4" gutterBottom sx={{ mb: 4, mt: 12 }}>
            Your Orders
          </Typography>
        </motion.div>

        <AnimatePresence>
          {orders.map((order) => {
            const orderDate = order.createdAt
              ? new Date(order.createdAt).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
              : 'Date not available';

            return (
              <motion.div
                key={order._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <StyledAccordion
                  expanded={expanded === order._id}
                  onChange={handleAccordionChange(order._id)}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      backgroundColor: expanded === order._id ? 'primary.light' : 'background.paper',
                      transition: 'background-color 0.3s ease',
                    }}
                  >
                    <Box width="100%">
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center">
                          <ReceiptIcon color="primary" sx={{ mr: 1.5 }} />
                          <Typography variant="h6" fontWeight={600}>
                            Order #{order._id ? order._id.substring(0, 8).toUpperCase() : 'N/A'}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <Box display="flex" alignItems="center" mr={3}>
                            <DateIcon color="action" fontSize="small" sx={{ mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              {orderDate}
                            </Typography>
                          </Box>
                          <StatusChip
                            label={(order.status || 'processing').toUpperCase()}
                            status={order.status}
                            icon={getStatusIcon(order.status)}
                          />
                        </Box>
                      </Box>
                      {!isMobile && expanded !== order._id && (
                        <Box display="flex" justifyContent="space-between" mt={1}>
                          <Typography variant="body2" color="text.secondary">
                            {order.items?.length || 0} items • Total: ₹{(order.total || 0).toFixed(2)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Payment: {order.paymentMethod?.toUpperCase() || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </AccordionSummary>
                  {renderOrderDetails(order)}
                </StyledAccordion>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </Box>
    </ThemeProvider>
  );
};

export default Order;
