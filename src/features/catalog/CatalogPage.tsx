import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Drawer,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  useMediaQuery,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
  Badge,
  Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom'; // Use react-router-dom Link
import Layout from '../../components/layout/Layout'; // Update import path
import { useAuth } from '../../contexts/AuthContext'; // Update import path
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase'; // Update import path
import { Product } from '../../types/product'; // Update import path
import { Helmet } from 'react-helmet-async'; // Use react-helmet-async for head management

const CatalogPage = () => {
  const { userProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [favoriteItems, setFavoriteItems] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState({
    categories: [] as string[],
    priceRange: '',
    fabricTypes: [] as string[],
    seasons: [] as string[],
    colors: [] as string[],
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsQuery = query(collection(db, 'products'), where('available', '==', true));
        const productsSnapshot = await getDocs(productsQuery);

        const productsData = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        setProducts(productsData);
        setFilteredProducts(productsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);

        // For demo purposes, add some sample products
        const sampleProducts = [
          {
            id: 'suit1',
            type: 'suit',
            name: 'Classic Navy Wool Suit',
            description: 'A timeless navy suit crafted from premium Italian wool. Perfect for business meetings and formal occasions.',
            basePrice: 699,
            currency: 'USD' as const,
            imageUrls: ['/api/placeholder/400/500'],
            available: true,
            featured: true,
            season: ['all-season'],
            gender: 'male' as const,
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
          {
            id: 'shirt1',
            type: 'shirt',
            name: 'White Oxford Dress Shirt',
            description: 'A crisp white Oxford shirt, essential for every gentleman\'s wardrobe. Made from Egyptian cotton for superior comfort.',
            basePrice: 129,
            currency: 'USD' as const,
            imageUrls: ['/api/placeholder/400/500'],
            available: true,
            featured: true,
            season: ['all-season'],
            gender: 'male' as const,
            customizationOptions: {
              collarStyles: ['spread', 'button-down', 'cutaway'],
              cuffStyles: ['barrel', 'French', 'convertible'],
              placketStyles: ['standard', 'hidden', 'front'],
              monogramOptions: true,
              specialInstructions: true,
            },
          },
          {
            id: 'trousers1',
            type: 'trousers',
            name: 'Grey Wool Trousers',
            description: 'Elegant grey wool trousers with a perfect drape. Versatile enough for business or formal occasions.',
            basePrice: 189,
            currency: 'USD' as const,
            imageUrls: ['/api/placeholder/400/500'],
            available: true,
            featured: false,
            season: ['fall', 'winter'],
            gender: 'male' as const,
            customizationOptions: {
              waistbandStyles: ['standard', 'extended'],
              pleats: ['flat-front', 'single-pleat', 'double-pleat'],
              backPocketStyles: ['button', 'no-button'],
              frontPocketStyles: ['on-seam', 'slant'],
              monogramOptions: true,
              specialInstructions: true,
            },
          },
          {
            id: 'jacket1',
            type: 'jacket',
            name: 'Navy Blazer',
            description: 'A versatile navy blazer that works for business casual or smart casual occasions.',
            basePrice: 499,
            currency: 'USD' as const,
            imageUrls: ['/api/placeholder/400/500'],
            available: true,
            featured: false,
            season: ['all-season'],
            gender: 'male' as const,
            customizationOptions: {
              lapelStyles: ['notch', 'peak'],
              ventStyles: ['center', 'side', 'none'],
              pocketStyles: ['flap', 'patch'],
              buttonOptions: ['two-button', 'three-button'],
              liningOptions: ['full', 'half'],
              monogramOptions: true,
              specialInstructions: true,
            },
          },
          {
            id: 'dress1',
            type: 'dress',
            name: 'Silk Evening Dress',
            description: 'Elegant silk evening dress perfect for formal occasions and gala events.',
            basePrice: 399,
            currency: 'USD' as const,
            imageUrls: ['/api/placeholder/400/500'],
            available: true,
            featured: true,
            season: ['spring', 'summer'],
            gender: 'female' as const,
            customizationOptions: {
              necklineStyles: ['v-neck', 'scoop', 'boat'],
              sleeveStyles: ['sleeveless', 'short', 'three-quarter', 'long'],
              backStyles: ['open', 'closed'],
              hemStyles: ['knee', 'midi', 'full-length'],
              monogramOptions: false,
              specialInstructions: true,
            },
          },
        ];

        setProducts(sampleProducts);
        setFilteredProducts(sampleProducts);
      }
    };

    fetchProducts();

    // Fetch user favorites
    // Implementation would connect to Firestore to get user's favorite items
  }, []);

  // Filter products when search query or filters change
  useEffect(() => {
    if (loading) return;

    let filtered = [...products];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.type.toLowerCase().includes(query)
      );
    }

    // Apply category filters
    if (activeFilters.categories.length > 0) {
      filtered = filtered.filter((product) =>
        activeFilters.categories.includes(product.type)
      );
    }

    // Apply price range filter
    if (activeFilters.priceRange) {
      const [min, max] = activeFilters.priceRange.split('-').map(Number);
      filtered = filtered.filter(
        (product) => product.basePrice >= min && (max ? product.basePrice <= max : true)
      );
    }

    // Apply season filters
    if (activeFilters.seasons.length > 0) {
      filtered = filtered.filter((product) =>
        product.season.some((s) => activeFilters.seasons.includes(s))
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, activeFilters, products, loading]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

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

  const handleFilterChange = (filterType: keyof typeof activeFilters, value: string | string[]) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };

      if (filterType === 'priceRange') {
        newFilters.priceRange = value as string;
      } else {
        const currentFilter = newFilters[filterType] as string[];
        if (Array.isArray(value)) {
          newFilters[filterType] = value;
        } else if (currentFilter.includes(value)) {
          newFilters[filterType] = currentFilter.filter((item) => item !== value);
        } else {
          newFilters[filterType] = [...currentFilter, value];
        }
      }

      return newFilters;
    });
  };

  const clearFilters = () => {
    setActiveFilters({
      categories: [],
      priceRange: '',
      fabricTypes: [],
      seasons: [],
      colors: [],
    });
    setSearchQuery('');
  };

  const activeFiltersCount = Object.values(activeFilters).reduce(
    (count, filter) => count + (Array.isArray(filter) ? filter.length : (filter ? 1 : 0)),
    0
  );

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: string | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Filter options
  const categories = [
    { value: 'suit', label: 'Suits' },
    { value: 'shirt', label: 'Shirts' },
    { value: 'trousers', label: 'Trousers' },
    { value: 'jacket', label: 'Jackets' },
    { value: 'dress', label: 'Dresses' },
  ];

  const priceRanges = [
    { value: '0-199', label: 'Under $200' },
    { value: '200-499', label: '$200 - $499' },
    { value: '500-999', label: '$500 - $999' },
    { value: '1000-', label: '$1000+' },
  ];

  const seasons = [
    { value: 'all-season', label: 'All Season' },
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
    { value: 'fall', label: 'Fall' },
    { value: 'winter', label: 'Winter' },
  ];

  return (
    <>
      <Helmet>
        <title>Catalog | Bespoke Tailor</title>
      </Helmet>

      <Box sx={{ pb: 6 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Product Catalog
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse our collection of premium custom clothing
          </Typography>
        </Box>

        {/* Search and Filter Section */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={
                  <Badge badgeContent={activeFiltersCount} color="primary">
                    <FilterListIcon />
                  </Badge>
                }
                onClick={() => setFilterDrawerOpen(true)}
              >
                Filter
              </Button>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={handleViewModeChange}
                  aria-label="view mode"
                >
                  <ToggleButton value="grid" aria-label="grid view">
                    <GridViewIcon />
                  </ToggleButton>
                  <ToggleButton value="list" aria-label="list view">
                    <ViewListIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Applied Filters */}
        {activeFiltersCount > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {activeFilters.categories.map((category) => (
              <Chip
                key={category}
                label={categories.find((c) => c.value === category)?.label || category}
                onDelete={() => {
                  const newCategories = activeFilters.categories.filter((c) => c !== category);
                  handleFilterChange('categories', newCategories);
                }}
              />
            ))}
            {activeFilters.priceRange && (
              <Chip
                label={priceRanges.find((p) => p.value === activeFilters.priceRange)?.label || activeFilters.priceRange}
                onDelete={() => handleFilterChange('priceRange', '')}
              />
            )}
            {activeFilters.seasons.map((season) => (
              <Chip
                key={season}
                label={seasons.find((s) => s.value === season)?.label || season}
                onDelete={() => {
                  const newSeasons = activeFilters.seasons.filter((s) => s !== season);
                  handleFilterChange('seasons', newSeasons);
                }}
              />
            ))}
            <Chip label="Clear All" onClick={clearFilters} />
          </Box>
        )}

        {/* Products Grid/List */}
        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={viewMode === 'grid' ? 4 : 12} key={item}>
                {viewMode === 'grid' ? (
                  <Card>
                    <Skeleton variant="rectangular" height={300} />
                    <CardContent>
                      <Skeleton variant="text" height={32} />
                      <Skeleton variant="text" width="60%" height={24} />
                      <Skeleton variant="text" width="40%" height={24} />
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <Grid container>
                      <Grid item xs={4}>
                        <Skeleton variant="rectangular" height={200} />
                      </Grid>
                      <Grid item xs={8}>
                        <CardContent>
                          <Skeleton variant="text" height={32} />
                          <Skeleton variant="text" width="60%" height={24} />
                          <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
                          <Skeleton variant="text" width="30%" height={24} />
                        </CardContent>
                      </Grid>
                    </Grid>
                  </Card>
                )}
              </Grid>
            ))}
          </Grid>
        ) : filteredProducts.length > 0 ? (
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={viewMode === 'grid' ? 4 : 12} key={product.id}>
                {viewMode === 'grid' ? (
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
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
                        height={300}
                        image={product.imageUrls[0]}
                        alt={product.name}
                        sx={{ objectFit: 'cover' }}
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
                      {product.featured && (
                        <Chip
                          label="Featured"
                          color="primary"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                          }}
                        />
                      )}
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" component="h2" gutterBottom noWrap>
                        {product.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          height: '40px',
                        }}
                      >
                        {product.description}
                      </Typography>
                      <Typography variant="subtitle1" color="primary">
                        {formatCurrency(product.basePrice, product.currency)}
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        component={Link}
                        to={`/catalog/${product.id}`} // Use react-router-dom 'to' prop
                      >
                        View Details
                      </Button>
                    </Box>
                  </Card>
                ) : (
                  <Card
                    sx={{
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <Grid container>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ position: 'relative', height: '100%' }}>
                          <CardMedia
                            component="img"
                            height={isMobile ? 200 : '100%'}
                            image={product.imageUrls[0]}
                            alt={product.name}
                            sx={{ objectFit: 'cover' }}
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
                          {product.featured && (
                            <Chip
                              label="Featured"
                              color="primary"
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                              }}
                            />
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <CardContent>
                          <Typography variant="h6" component="h2" gutterBottom>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {product.description}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mt: 2,
                            }}
                          >
                            <Typography variant="h6" color="primary">
                              {formatCurrency(product.basePrice, product.currency)}
                            </Typography>
                            <Button
                              variant="contained"
                              component={Link}
                              to={`/catalog/${product.id}`} // Use react-router-dom 'to' prop
                            >
                              View Details
                            </Button>
                          </Box>
                        </CardContent>
                      </Grid>
                    </Grid>
                  </Card>
                )}
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" gutterBottom>
              No Products Found
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              We couldn't find any products matching your search or filters.
            </Typography>
            <Button variant="outlined" onClick={clearFilters}>
              Clear Filters
            </Button>
          </Box>
        )}
      </Box>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: isMobile ? '100%' : 360,
            padding: 3,
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Categories Filter */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Categories
            </Typography>
            <FormGroup>
              {categories.map((category) => (
                <FormControlLabel
                  key={category.value}
                  control={
                    <Checkbox
                      checked={activeFilters.categories.includes(category.value)}
                      onChange={() => {
                        const newCategories = [...activeFilters.categories];
                        if (newCategories.includes(category.value)) {
                          const index = newCategories.indexOf(category.value);
                          newCategories.splice(index, 1);
                        } else {
                          newCategories.push(category.value);
                        }
                        handleFilterChange('categories', newCategories);
                      }}
                    />
                  }
                  label={category.label}
                />
              ))}
            </FormGroup>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Price Range Filter */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Price Range
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={activeFilters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
              >
                {priceRanges.map((range) => (
                  <FormControlLabel
                    key={range.value}
                    value={range.value}
                    control={<Radio />}
                    label={range.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Season Filter */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Season
            </Typography>
            <FormGroup>
              {seasons.map((season) => (
                <FormControlLabel
                  key={season.value}
                  control={
                    <Checkbox
                      checked={activeFilters.seasons.includes(season.value)}
                      onChange={() => {
                        const newSeasons = [...activeFilters.seasons];
                        if (newSeasons.includes(season.value)) {
                          const index = newSeasons.indexOf(season.value);
                          newSeasons.splice(index, 1);
                        } else {
                          newSeasons.push(season.value);
                        }
                        handleFilterChange('seasons', newSeasons);
                      }}
                    />
                  }
                  label={season.label}
                />
              ))}
            </FormGroup>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" onClick={clearFilters}>
              Clear All
            </Button>
            <Button
              variant="contained"
              onClick={() => setFilterDrawerOpen(false)}
            >
              Apply Filters
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default CatalogPage;