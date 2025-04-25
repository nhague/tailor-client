// File: src/pages/catalog/[id].tsx - Complete Implementation

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Divider,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Breadcrumbs,
  Link as MuiLink,
  Skeleton,
  ImageList,
  ImageListItem,
  Dialog,
  DialogContent,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  CheckCircle as CheckCircleIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Product } from '../../types/product';

interface ProductPageProps {
  toggleTheme: () => void;
}

const ProductPage = ({ toggleTheme }: ProductPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [customizations, setCustomizations] = useState<Record<string, string>>({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        const productDoc = await getDoc(doc(db, 'products', id as string));
        
        if (productDoc.exists()) {
          setProduct({ id: productDoc.id, ...productDoc.data() } as Product);
        } else {
          // For demo, provide sample product
          const sampleProduct = getSampleProduct(id as string);
          if (sampleProduct) {
            setProduct(sampleProduct);
          } else {
            // Product not found, redirect to catalog
            navigate('/catalog');
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        
        // For demo, provide sample product
        const sampleProduct = getSampleProduct(id as string);
        if (sampleProduct) {
          setProduct(sampleProduct);
        }
        
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, router]);

  // Sample product data for demo
  const getSampleProduct = (productId: string): Product | null => {
    const sampleProducts = {
      'suit1': {
        id: 'suit1',
        type: 'suit',
        name: 'Classic Navy Wool Suit',
        description: 'A timeless navy suit crafted from premium Italian wool. Perfect for business meetings and formal occasions. Features a two-button closure, notch lapels, and a tailored fit that flatters most body types. The wool fabric is breathable and comfortable year-round.',
        basePrice: 699,
        currency: 'USD',
        imageUrls: [
          '/api/placeholder/600/800',
          '/api/placeholder/600/800',
          '/api/placeholder/600/800',
          '/api/placeholder/600/800',
        ],
        available: true,
        featured: true,
        season: ['all-season'],
        gender: 'male',
        customizationOptions: {
          lapelStyles: ['notch', 'peak', 'shawl'],
          ventStyles: ['center', 'side', 'none'],
          pocketStyles: ['flap', 'jetted', 'patch'],
          buttonOptions: ['two-button', 'three-button'],
          liningOptions: ['full', 'half', 'quarter'],
          monogramOptions: true,
          specialInstructions: true,
        },
      },
      'shirt1': {
        id: 'shirt1',
        type: 'shirt',
        name: 'White Oxford Dress Shirt',
        description: 'A crisp white Oxford shirt, essential for every gentleman\'s wardrobe. Made from Egyptian cotton for superior comfort. Features a spread collar and barrel cuffs. The fabric has a slight texture that adds visual interest while maintaining a formal appearance. Perfect for business or formal occasions.',
        basePrice: 129,
        currency: 'USD',
        imageUrls: [
          '/api/placeholder/600/800',
          '/api/placeholder/600/800',
          '/api/placeholder/600/800',
        ],
        available: true,
        featured: true,
        season: ['all-season'],
        gender: 'male',
        customizationOptions: {
          collarStyles: ['spread', 'button-down', 'cutaway'],
          cuffStyles: ['barrel', 'French', 'convertible'],
          placketStyles: ['standard', 'hidden', 'front'],
          monogramOptions: true,
          specialInstructions: true,
        },
      },
    };

    return sampleProducts[productId as keyof typeof sampleProducts] || null;
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleCustomizationChange = (option: string, value: string) => {
    setCustomizations((prev) => ({
      ...prev,
      [option]: value,
    }));
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? (product?.imageUrls.length || 1) - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev === (product?.imageUrls.length || 1) - 1 ? 0 : prev + 1));
  };

  const handleImageClick = () => {
    setImageDialogOpen(true);
  };

  const handleAddToOrder = () => {
    // In a real app, we would add this to a cart or directly to an order
    navigate('/orders/new?product=' + product?.id);
  };

  // Product features and benefits for demo
  const productFeatures = [
    'Premium Italian wool fabric',
    'Hand-finished details',
    'Natural stretch for comfort',
    'Fully customizable design',
    'Perfect for business and formal occasions',
  ];

  return (
    <Layout toggleTheme={toggleTheme}>
      <Helmet>
        <title>{loading ? 'Product Details' : `${product?.name} | Bespoke Tailor`}</title>
      </Helmet>

      <Box sx={{ pb: 6 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link to="/">
            <MuiLink underline="hover" color="inherit">
              Home
            </MuiLink>
          </Link>
          <Link to="/catalog">
            <MuiLink underline="hover" color="inherit">
              Catalog
            </MuiLink>
          </Link>
          <Typography color="text.primary">
            {loading ? 'Loading...' : product?.name || 'Product Details'}
          </Typography>
        </Breadcrumbs>

        {loading ? (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 2 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="text" height={40} width="80%" sx={{ mb: 1 }} />
              <Skeleton variant="text" height={24} width="40%" sx={{ mb: 2 }} />
              <Skeleton variant="text" height={100} sx={{ mb: 2 }} />
              <Skeleton variant="text" height={32} width="30%" sx={{ mb: 3 }} />
              <Skeleton variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 2 }} />
              <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
            </Grid>
          </Grid>
        ) : product ? (
          <Grid container spacing={4}>
            {/* Product Images */}
            <Grid item xs={12} md={6}>
              <Card sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={product.imageUrls[selectedImage]}
                  alt={product.name}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    cursor: 'zoom-in',
                  }}
                  onClick={handleImageClick}
                />
                
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: 'background.paper',
                    '&:hover': {
                      bgcolor: 'background.paper',
                    },
                  }}
                  onClick={toggleFavorite}
                >
                  {isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                </IconButton>
                
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: 1,
                  }}
                >
                  <IconButton onClick={handlePrevImage}>
                    <NavigateBeforeIcon />
                  </IconButton>
                  <IconButton onClick={handleNextImage}>
                    <NavigateNextIcon />
                  </IconButton>
                </Box>
              </Card>
              
              {/* Thumbnail Images */}
              <ImageList cols={4} sx={{ mt: 2 }}>
                {product.imageUrls.map((img, index) => (
                  <ImageListItem 
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    sx={{ 
                      cursor: 'pointer',
                      border: selectedImage === index ? `2px solid ${theme.palette.primary.main}` : 'none',
                      borderRadius: 1,
                      overflow: 'hidden',
                    }}
                  >
                    <img src={img} alt={`${product.name} - view ${index + 1}`} loading="lazy" />
                  </ImageListItem>
                ))}
              </ImageList>
            </Grid>

            {/* Product Details */}
            <Grid item xs={12} md={6}>
              <Typography variant="displaySmall" component="h1" gutterBottom>
                {product.name}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="titleLarge" color="primary" sx={{ mr: 2 }}>
                  {formatCurrency(product.basePrice, product.currency)}
                </Typography>
                {product.featured && <Chip label="Featured" color="primary" size="small" />}
              </Box>
              
              <Typography variant="bodyLarge" paragraph>
                {product.description}
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="titleMedium" gutterBottom>
                  Key Features:
                </Typography>
                <List dense>
                  {productFeatures.map((feature, index) => (
                    <ListItem key={index} disableGutters>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Customization Options */}
              <Typography variant="titleLarge" gutterBottom>
                Customization Options
              </Typography>

              <Box sx={{ mb: 3 }}>
                {product.customizationOptions.lapelStyles && (
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="titleMedium">Lapel Style</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormControl component="fieldset">
                        <RadioGroup
                          value={customizations.lapelStyle || ''}
                          onChange={(e) => handleCustomizationChange('lapelStyle', e.target.value)}
                        >
                          {product.customizationOptions.lapelStyles.map((style) => (
                            <FormControlLabel
                              key={style}
                              value={style}
                              control={<Radio />}
                              label={style.charAt(0).toUpperCase() + style.slice(1)}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </AccordionDetails>
                  </Accordion>
                )}

                {product.customizationOptions.ventStyles && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="titleMedium">Vent Style</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormControl component="fieldset">
                        <RadioGroup
                          value={customizations.ventStyle || ''}
                          onChange={(e) => handleCustomizationChange('ventStyle', e.target.value)}
                        >
                          {product.customizationOptions.ventStyles.map((style) => (
                            <FormControlLabel
                              key={style}
                              value={style}
                              control={<Radio />}
                              label={style.charAt(0).toUpperCase() + style.slice(1)}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </AccordionDetails>
                  </Accordion>
                )}

                {product.customizationOptions.collarStyles && (
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="titleMedium">Collar Style</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormControl component="fieldset">
                        <RadioGroup
                          value={customizations.collarStyle || ''}
                          onChange={(e) => handleCustomizationChange('collarStyle', e.target.value)}
                        >
                          {product.customizationOptions.collarStyles.map((style) => (
                            <FormControlLabel
                              key={style}
                              value={style}
                              control={<Radio />}
                              label={style.charAt(0).toUpperCase() + style.slice(1)}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </AccordionDetails>
                  </Accordion>
                )}

                {product.customizationOptions.cuffStyles && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="titleMedium">Cuff Style</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormControl component="fieldset">
                        <RadioGroup
                          value={customizations.cuffStyle || ''}
                          onChange={(e) => handleCustomizationChange('cuffStyle', e.target.value)}
                        >
                          {product.customizationOptions.cuffStyles.map((style) => (
                            <FormControlLabel
                              key={style}
                              value={style}
                              control={<Radio />}
                              label={style.charAt(0).toUpperCase() + style.slice(1)}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </AccordionDetails>
                  </Accordion>
                )}

                {product.customizationOptions.monogramOptions && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="titleMedium">Monogram</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TextField
                        label="Monogram Text"
                        placeholder="Enter up to 3 characters"
                        value={customizations.monogram || ''}
                        onChange={(e) => handleCustomizationChange('monogram', e.target.value.substring(0, 3))}
                        fullWidth
                        margin="normal"
                        inputProps={{ maxLength: 3 }}
                        helperText="Optional. Will be embroidered according to the item type."
                      />
                    </AccordionDetails>
                  </Accordion>
                )}

                {product.customizationOptions.specialInstructions && (
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="titleMedium">Special Instructions</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TextField
                        label="Special Instructions"
                        placeholder="Any specific requirements or notes for the tailor?"
                        value={customizations.specialInstructions || ''}
                        onChange={(e) => handleCustomizationChange('specialInstructions', e.target.value)}
                        fullWidth
                        multiline
                        rows={4}
                        margin="normal"
                      />
                    </AccordionDetails>
                  </Accordion>
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Alert severity="info" sx={{ mb: 3 }}>
                To place an order, you'll need to have your measurements on file. Make sure your measurements are up to date for the best fit.
              </Alert>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleAddToOrder}
                sx={{ py: 1.5 }}
              >
                Add to Order
              </Button>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="headlineMedium" gutterBottom>
              Product Not Found
            </Typography>
            <Typography variant="bodyLarge" paragraph>
              The product you're looking for doesn't exist or has been removed.
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/catalog"
            >
              Browse Catalog
            </Button>
          </Box>
        )}

        {/* Full-size image dialog */}
        <Dialog
          open={imageDialogOpen}
          onClose={() => setImageDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <IconButton
            onClick={() => setImageDialogOpen(false)}
            sx={{ position: 'absolute', top: 8, right: 8, color: 'white', zIndex: 1 }}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent sx={{ p: 0, position: 'relative' }}>
            {product && (
              <Box
                component="img"
                src={product.imageUrls[selectedImage]}
                alt={product.name}
                sx={{
                  width: '100%',
                  height: 'auto',
                }}
              />
            )}
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <IconButton onClick={handlePrevImage} sx={{ bgcolor: 'rgba(255, 255, 255, 0.7)' }}>
                <NavigateBeforeIcon />
              </IconButton>
              <IconButton onClick={handleNextImage} sx={{ bgcolor: 'rgba(255, 255, 255, 0.7)' }}>
                <NavigateNextIcon />
              </IconButton>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default ProductPage;