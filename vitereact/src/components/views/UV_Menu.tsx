import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { X } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Product {
  product_id: string;
  product_name: string;
  short_description: string;
  long_description: string | null;
  category: 'pastries' | 'breads' | 'cakes' | 'corporate';
  price: number;
  compare_at_price: number | null;
  primary_image_url: string;
  additional_images: string | null;
  availability_status: 'in_stock' | 'out_of_stock' | 'discontinued';
  stock_quantity: number | null;
  low_stock_threshold: number | null;
  dietary_tags: string | null;
  custom_tags: string | null;
  is_featured: boolean;
  available_for_corporate: boolean;
  available_from_date: string | null;
  available_until_date: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductLocationAssignment {
  assignment_id: string;
  product_id: string;
  location_name: string;
  assigned_at: string;
}

interface ProductsResponse {
  data: Product[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

// ============================================================================
// UV_MENU COMPONENT
// ============================================================================

const UV_Menu: React.FC = () => {
  // ============================================================================
  // ROUTE & URL PARAMETER EXTRACTION
  // ============================================================================
  
  const { location_name } = useParams<{ location_name: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // ============================================================================
  // GLOBAL STATE ACCESS (Individual Selectors - CRITICAL!)
  // ============================================================================
  
  const addToCart = useAppStore(state => state.add_to_cart);
  const setCartLocation = useAppStore(state => state.set_cart_location);
  const setFulfillmentMethod = useAppStore(state => state.set_fulfillment_method);
  const showToast = useAppStore(state => state.show_toast);
  const cartItems = useAppStore(state => state.cart_state.items);
  const selectedLocation = useAppStore(state => state.cart_state.selected_location);

  // ============================================================================
  // LOCAL STATE VARIABLES
  // ============================================================================

  const [view_mode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter_drawer_open, setFilterDrawerOpen] = useState(false);
  const [search_input, setSearchInput] = useState(searchParams.get('search') || '');

  // ============================================================================
  // FETCH LOCATIONS TO CONVERT SLUG TO NAME
  // ============================================================================

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/locations`
      );
      return response.data;
    },
    staleTime: 60000,
  });

  // Helper to convert slug to location name
  const slugToLocationName = (slug: string): string => {
    if (!locations) return slug;
    const location = locations.find((loc: any) => 
      loc.location_name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
    );
    return location ? location.location_name : slug;
  };

  // ============================================================================
  // PARSE URL PARAMETERS INTO STATE
  // ============================================================================

  const location_slug = location_name || 'london-flagship';
  const current_location_name = slugToLocationName(location_slug);
  const current_fulfillment_method = searchParams.get('fulfillment') || null;

  const active_filters = useMemo(() => ({
    category: searchParams.get('category') || null,
    price_min: searchParams.get('price_min') ? parseFloat(searchParams.get('price_min')!) : null,
    price_max: searchParams.get('price_max') ? parseFloat(searchParams.get('price_max')!) : null,
    dietary_tags: searchParams.get('dietary_tags')?.split(',').filter(Boolean) || [],
    availability_status: searchParams.get('availability_status') || null,
    search_query: searchParams.get('search') || '',
  }), [searchParams]);

  const sort_config = useMemo(() => ({
    sort_by: searchParams.get('sort_by') || 'created_at',
    sort_order: searchParams.get('sort_order') || 'desc',
  }), [searchParams]);

  const pagination_state = useMemo(() => {
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    return {
      products_per_page: limit,
      current_page: Math.floor(offset / limit) + 1,
    };
  }, [searchParams]);

  // ============================================================================
  // API CALL: FETCH PRODUCT-LOCATION ASSIGNMENTS
  // ============================================================================

  const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['product-locations', current_location_name],
    queryFn: async () => {
      const response = await axios.get<ProductLocationAssignment[]>(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/product-locations`,
        {
          params: {
            location_name: current_location_name,
            limit: 1000,
          },
        }
      );
      return response.data;
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });

  const assigned_product_ids = useMemo(() => {
    if (!assignmentsData) return [];
    // Handle both array response and object with data property
    const assignments = Array.isArray(assignmentsData) ? assignmentsData : (assignmentsData as any).data || [];
    return assignments.map((a: ProductLocationAssignment) => a.product_id);
  }, [assignmentsData]);

  // ============================================================================
  // API CALL: FETCH PRODUCTS WITH FILTERS
  // ============================================================================

  const { data: productsData, isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useQuery({
    queryKey: [
      'products',
      current_location_name,
      active_filters,
      sort_config,
      pagination_state,
      assigned_product_ids,
    ],
    queryFn: async () => {
      const params: any = {
        is_archived: false,
        limit: pagination_state.products_per_page,
        offset: (pagination_state.current_page - 1) * pagination_state.products_per_page,
        sort_by: sort_config.sort_by,
        sort_order: sort_config.sort_order,
      };

      if (active_filters.search_query) params.query = active_filters.search_query;
      if (active_filters.category) params.category = active_filters.category;
      if (active_filters.availability_status) params.availability_status = active_filters.availability_status;
      if (active_filters.price_min !== null) params.min_price = active_filters.price_min;
      if (active_filters.price_max !== null) params.max_price = active_filters.price_max;

      const response = await axios.get<ProductsResponse>(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/products`,
        { params }
      );

      return response.data;
    },
    enabled: assigned_product_ids.length > 0, // Only fetch when assignments loaded
    staleTime: 30000, // 30 seconds
    select: (data) => {
      // Transform data: filter by location assignments and dietary tags
      let filtered = data.data || [];

      // Filter by assigned products
      if (assigned_product_ids.length > 0) {
        filtered = filtered.filter(p => assigned_product_ids.includes(p.product_id));
      }

      // Filter by dietary tags (client-side)
      if (active_filters.dietary_tags.length > 0) {
        filtered = filtered.filter(product => {
          if (!product.dietary_tags) return false;
          
          // Parse JSON array of dietary tags
          let productTags: string[] = [];
          try {
            productTags = JSON.parse(product.dietary_tags);
          } catch {
            // Fallback to comma-separated parsing if not JSON
            productTags = product.dietary_tags.split(',').map(t => t.trim());
          }
          
          // Normalize tags for comparison (convert underscores to hyphens and lowercase)
          const normalizedProductTags = productTags.map(t => t.toLowerCase().replace(/_/g, '-'));
          const normalizedFilterTags = active_filters.dietary_tags.map(t => t.toLowerCase().replace(/_/g, '-'));
          
          // Check if all filter tags are present in product tags
          return normalizedFilterTags.every(filterTag => normalizedProductTags.includes(filterTag));
        });
      }

      // Convert numeric strings to numbers (CRITICAL - prevent toFixed errors)
      const transformedProducts = filtered.map(p => ({
        ...p,
        price: Number(p.price || 0),
        compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
        stock_quantity: p.stock_quantity ? Number(p.stock_quantity) : null,
      }));

      return {
        products: transformedProducts,
        total: data.total,
        limit: data.limit,
        offset: data.offset,
      };
    },
  });

  const products = productsData?.products || [];
  const total_products_count = productsData?.total || 0;

  // ============================================================================
  // DEBOUNCED SEARCH HANDLER
  // ============================================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search_input !== active_filters.search_query) {
        updateFilter('search', search_input);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search_input]);

  // ============================================================================
  // FILTER & URL UPDATE FUNCTIONS
  // ============================================================================

  const updateFilter = (key: string, value: any) => {
    const newParams = new URLSearchParams(searchParams);
    
    // Validate price range: min_price should not exceed max_price
    if (key === 'price_min' || key === 'price_max') {
      const currentMinPrice = key === 'price_min' ? value : active_filters.price_min;
      const currentMaxPrice = key === 'price_max' ? value : active_filters.price_max;
      
      if (currentMinPrice !== null && currentMaxPrice !== null && currentMinPrice > currentMaxPrice) {
        showToast('error', 'Minimum price cannot be greater than maximum price');
        return; // Don't update the filter
      }
    }
    
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      newParams.delete(key);
    } else if (Array.isArray(value)) {
      newParams.set(key, value.join(','));
    } else {
      newParams.set(key, value.toString());
    }

    // Reset to page 1 when filters change
    if (key !== 'offset' && key !== 'limit') {
      newParams.delete('offset');
    }

    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    const newParams = new URLSearchParams();
    if (current_fulfillment_method) {
      newParams.set('fulfillment', current_fulfillment_method);
    }
    setSearchParams(newParams);
    setSearchInput('');
  };

  const toggleDietaryTag = (tag: string) => {
    const current = active_filters.dietary_tags;
    const newTags = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    updateFilter('dietary_tags', newTags);
  };

  const goToPage = (page: number) => {
    const offset = (page - 1) * pagination_state.products_per_page;
    updateFilter('offset', offset);
  };

  // ============================================================================
  // ADD TO CART HANDLER
  // ============================================================================

  const handleAddToCart = (product: Product) => {
    // Validate availability
    if (product.availability_status !== 'in_stock') {
      showToast('error', 'This product is currently out of stock');
      return;
    }

    // Check if cart has different location
    if (selectedLocation && selectedLocation !== current_location_name) {
      showToast('warning', 'Cart cleared - items from different location removed');
      // Clear cart handled in store action
    }

    // Set cart location if first item
    if (cartItems.length === 0) {
      setCartLocation(current_location_name);
      if (current_fulfillment_method) {
        setFulfillmentMethod(current_fulfillment_method as 'collection' | 'delivery');
      }
    }

    // Add to cart
    addToCart({
      product_id: product.product_id,
      product_name: product.product_name,
      price: product.price,
      quantity: 1,
      subtotal: product.price,
      primary_image_url: product.primary_image_url,
    });

    // Animate cart icon (handled by toast)
    showToast('success', `${product.product_name} added to cart!`);
  };

  // ============================================================================
  // DIETARY TAG OPTIONS
  // ============================================================================

  const dietary_tag_options = [
    { value: 'vegan', label: 'Vegan' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'gluten_free', label: 'Gluten Free' },
    { value: 'dairy_free', label: 'Dairy Free' },
    { value: 'nut_free', label: 'Nut Free' },
    { value: 'organic', label: 'Organic' },
  ];

  // ============================================================================
  // PAGINATION CALCULATIONS
  // ============================================================================

  const total_pages = Math.ceil(total_products_count / pagination_state.products_per_page);
  const has_previous = pagination_state.current_page > 1;
  const has_next = pagination_state.current_page < total_pages;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <div className="min-h-screen bg-kake-cream-50">
        {/* Header Section */}
        <div className="bg-white border-b border-kake-caramel-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-kake-chocolate-400 mb-4">
              <Link to="/" className="hover:text-kake-caramel-500 transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link to={`/location/${location_slug}`} className="hover:text-kake-caramel-500 transition-colors">
                {current_location_name.charAt(0).toUpperCase() + current_location_name.slice(1)}
              </Link>
              <span>/</span>
              <span className="text-kake-chocolate-500 font-medium">Menu</span>
            </nav>

            {/* Title & View Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl font-bold text-kake-chocolate-500">
                  {current_location_name.charAt(0).toUpperCase() + current_location_name.slice(1)} Menu
                </h1>
                {current_fulfillment_method && (
                  <p className="text-kake-chocolate-400 mt-1">
                    {current_fulfillment_method === 'delivery' ? '🚚 Delivery' : '🏪 Collection'}
                  </p>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 bg-kake-cream-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    view_mode === 'grid'
                      ? 'bg-white text-kake-chocolate-500 shadow-soft'
                      : 'text-kake-chocolate-400 hover:text-kake-chocolate-500'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    view_mode === 'list'
                      ? 'bg-white text-kake-chocolate-500 shadow-soft'
                      : 'text-kake-chocolate-400 hover:text-kake-chocolate-500'
                  }`}
                >
                  List
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for desserts..."
                  value={search_input}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-kake-cream-50 border-2 border-kake-cream-300 rounded-xl focus:border-kake-caramel-500 focus:ring-4 focus:ring-kake-caramel-100 focus:outline-none transition-all text-kake-chocolate-500 placeholder:text-kake-chocolate-300"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-kake-chocolate-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {search_input && (
                  <button
                    onClick={() => {
                      setSearchInput('');
                      updateFilter('search', '');
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-kake-chocolate-300 hover:text-kake-chocolate-500"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Results Count & Sort */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-kake-chocolate-400">
                {productsLoading || assignmentsLoading ? (
                  <span>Loading products...</span>
                ) : (
                  <span>
                    Showing <span className="font-semibold text-kake-chocolate-500">{products.length}</span> of{' '}
                    <span className="font-semibold text-kake-chocolate-500">{total_products_count}</span> products
                    {active_filters.search_query && (
                      <> for &quot;<span className="font-semibold text-kake-chocolate-500">{active_filters.search_query}</span>&quot;</>
                    )}
                  </span>
                )}
              </p>

              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2">
                <label htmlFor="sort" className="text-sm text-kake-chocolate-400 hidden sm:block">
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={`${sort_config.sort_by}_${sort_config.sort_order}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('_');
                    updateFilter('sort_by', sortBy);
                    updateFilter('sort_order', sortOrder);
                  }}
                  className="px-3 py-2 bg-white border border-kake-cream-300 rounded-lg text-sm text-kake-chocolate-500 focus:border-kake-caramel-500 focus:ring-2 focus:ring-kake-caramel-100 focus:outline-none"
                >
                  <option value="created_at_desc">Newest First</option>
                  <option value="product_name_asc">Name (A-Z)</option>
                  <option value="product_name_desc">Name (Z-A)</option>
                  <option value="price_asc">Price (Low to High)</option>
                  <option value="price_desc">Price (High to Low)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: Filter Panel + Products Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Filter Panel - Mobile Drawer Button */}
            <div className="lg:hidden mb-4">
              <Drawer open={filter_drawer_open} onOpenChange={setFilterDrawerOpen}>
                <DrawerTrigger asChild>
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-kake-cream-300 rounded-xl text-sm font-medium text-kake-chocolate-500 hover:bg-kake-cream-50 transition-colors shadow-soft"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="h-5 w-5 text-kake-caramel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      Filters {Object.values(active_filters).filter(v => v !== null && v !== '' && (!Array.isArray(v) || v.length > 0)).length > 0 && `(${Object.values(active_filters).filter(v => v !== null && v !== '' && (!Array.isArray(v) || v.length > 0)).length})`}
                    </span>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <div className="flex items-center justify-between">
                      <DrawerTitle>Filter Products</DrawerTitle>
                      <DrawerClose asChild>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                          <X className="h-5 w-5" />
                        </button>
                      </DrawerClose>
                    </div>
                  </DrawerHeader>
                  <div className="overflow-y-auto max-h-[70vh] px-4 pb-6">
                    {/* Mobile Filter Content */}
                    <div className="space-y-6">
                      {Object.values(active_filters).some(v => v !== null && v !== '' && (!Array.isArray(v) || v.length > 0)) && (
                        <button
                          onClick={clearAllFilters}
                          className="w-full px-4 py-2 bg-kake-caramel-500 text-white rounded-xl hover:bg-kake-caramel-600 transition-colors font-medium shadow-caramel"
                        >
                          Clear All Filters
                        </button>
                      )}

                      {/* Category Filter */}
                      <div>
                        <h3 className="text-sm font-semibold text-kake-chocolate-500 mb-3">Category</h3>
                        <div className="space-y-2">
                          {['pastries', 'breads', 'cakes', 'corporate'].map((cat) => (
                            <label key={cat} className="flex items-center cursor-pointer">
                              <input
                                type="radio"
                                name="category-mobile"
                                checked={active_filters.category === cat}
                                onChange={() => updateFilter('category', active_filters.category === cat ? null : cat)}
                                className="h-4 w-4 text-kake-caramel-500 border-kake-cream-300 focus:ring-kake-caramel-500"
                              />
                              <span className="ml-3 text-sm text-kake-chocolate-400 capitalize">{cat}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Price Range Filter */}
                      <div>
                        <h3 className="text-sm font-semibold text-kake-chocolate-500 mb-3">Price Range</h3>
                        <div className="space-y-3">
                          <div>
                            <label htmlFor="price_min_mobile" className="text-xs text-kake-chocolate-400 block mb-1">
                              Min Price (€)
                            </label>
                            <input
                              type="number"
                              id="price_min_mobile"
                              min="0"
                              step="0.5"
                              value={active_filters.price_min || ''}
                              onChange={(e) => updateFilter('price_min', e.target.value ? parseFloat(e.target.value) : null)}
                              placeholder="0.00"
                              className="w-full px-3 py-2 border border-kake-cream-300 rounded-lg text-sm text-kake-chocolate-500 focus:border-kake-caramel-500 focus:ring-2 focus:ring-kake-caramel-100 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label htmlFor="price_max_mobile" className="text-xs text-kake-chocolate-400 block mb-1">
                              Max Price (€)
                            </label>
                            <input
                              type="number"
                              id="price_max_mobile"
                              min="0"
                              step="0.5"
                              value={active_filters.price_max || ''}
                              onChange={(e) => updateFilter('price_max', e.target.value ? parseFloat(e.target.value) : null)}
                              placeholder="100.00"
                              className="w-full px-3 py-2 border border-kake-cream-300 rounded-lg text-sm text-kake-chocolate-500 focus:border-kake-caramel-500 focus:ring-2 focus:ring-kake-caramel-100 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Dietary Tags Filter */}
                      <div>
                        <h3 className="text-sm font-semibold text-kake-chocolate-500 mb-3">Dietary Preferences</h3>
                        <div className="space-y-2">
                          {dietary_tag_options.map((tag) => (
                            <label key={tag.value} className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={active_filters.dietary_tags.includes(tag.value)}
                                onChange={() => toggleDietaryTag(tag.value)}
                                className="h-4 w-4 text-kake-caramel-500 border-kake-cream-300 rounded focus:ring-kake-caramel-500"
                              />
                              <span className="ml-3 text-sm text-kake-chocolate-400">{tag.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Availability Filter */}
                      <div>
                        <h3 className="text-sm font-semibold text-kake-chocolate-500 mb-3">Availability</h3>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={active_filters.availability_status === 'in_stock'}
                            onChange={() => updateFilter('availability_status', active_filters.availability_status === 'in_stock' ? null : 'in_stock')}
                            className="h-4 w-4 text-kake-caramel-500 border-kake-cream-300 rounded focus:ring-kake-caramel-500"
                          />
                          <span className="ml-3 text-sm text-kake-chocolate-400">Hide Out of Stock</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>

            {/* Filter Panel - Desktop Sidebar */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-soft-lg border border-kake-cream-200 p-6 sticky top-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-lg font-semibold text-kake-chocolate-500">Filters</h2>
                  {Object.values(active_filters).some(v => v !== null && v !== '' && (!Array.isArray(v) || v.length > 0)) && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-kake-caramel-500 hover:text-kake-caramel-600 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-kake-chocolate-500 mb-3">Category</h3>
                  <div className="space-y-2">
                    {['pastries', 'breads', 'cakes', 'corporate'].map((cat) => (
                      <label key={cat} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          checked={active_filters.category === cat}
                          onChange={() => updateFilter('category', active_filters.category === cat ? null : cat)}
                          className="h-4 w-4 text-kake-caramel-500 border-kake-cream-300 focus:ring-kake-caramel-500"
                        />
                        <span className="ml-3 text-sm text-kake-chocolate-400 capitalize">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-kake-chocolate-500 mb-3">Price Range</h3>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="price_min" className="text-xs text-kake-chocolate-400 block mb-1">
                        Min Price (€)
                      </label>
                      <input
                        type="number"
                        id="price_min"
                        min="0"
                        step="0.5"
                        value={active_filters.price_min || ''}
                        onChange={(e) => updateFilter('price_min', e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="0.00"
                        className="w-full px-3 py-2 border border-kake-cream-300 rounded-lg text-sm text-kake-chocolate-500 focus:border-kake-caramel-500 focus:ring-2 focus:ring-kake-caramel-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="price_max" className="text-xs text-kake-chocolate-400 block mb-1">
                        Max Price (€)
                      </label>
                      <input
                        type="number"
                        id="price_max"
                        min="0"
                        step="0.5"
                        value={active_filters.price_max || ''}
                        onChange={(e) => updateFilter('price_max', e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="100.00"
                        className="w-full px-3 py-2 border border-kake-cream-300 rounded-lg text-sm text-kake-chocolate-500 focus:border-kake-caramel-500 focus:ring-2 focus:ring-kake-caramel-100 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Dietary Tags Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-kake-chocolate-500 mb-3">Dietary Preferences</h3>
                  <div className="space-y-2">
                    {dietary_tag_options.map((tag) => (
                      <label key={tag.value} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={active_filters.dietary_tags.includes(tag.value)}
                          onChange={() => toggleDietaryTag(tag.value)}
                          className="h-4 w-4 text-kake-caramel-500 border-kake-cream-300 rounded focus:ring-kake-caramel-500"
                        />
                        <span className="ml-3 text-sm text-kake-chocolate-400">{tag.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-kake-chocolate-500 mb-3">Availability</h3>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={active_filters.availability_status === 'in_stock'}
                      onChange={() => updateFilter('availability_status', active_filters.availability_status === 'in_stock' ? null : 'in_stock')}
                      className="h-4 w-4 text-kake-caramel-500 border-kake-cream-300 rounded focus:ring-kake-caramel-500"
                    />
                    <span className="ml-3 text-sm text-kake-chocolate-400">Hide Out of Stock</span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Products Grid/List */}
            <div className="lg:col-span-3">
              {/* Loading State */}
              {(productsLoading || assignmentsLoading) && (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-kake-caramel-500 mx-auto mb-4"></div>
                    <p className="text-kake-chocolate-400">Loading delicious treats...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {productsError && !productsLoading && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <p className="text-red-700 mb-4">Failed to load products. Please try again.</p>
                  <button
                    onClick={() => refetchProducts()}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!productsLoading && !assignmentsLoading && !productsError && products.length === 0 && (
                <div className="bg-white rounded-2xl shadow-soft-lg border border-kake-cream-200 p-12 text-center">
                  <svg
                    className="mx-auto h-16 w-16 text-kake-chocolate-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="font-serif text-lg font-semibold text-kake-chocolate-500 mb-2">No desserts found</h3>
                  <p className="text-kake-chocolate-400 mb-4">
                    {active_filters.search_query
                      ? `No results for "${active_filters.search_query}"`
                      : 'Try adjusting your filters'}
                  </p>
                  {Object.values(active_filters).some(v => v !== null && v !== '' && (!Array.isArray(v) || v.length > 0)) && (
                    <button
                      onClick={clearAllFilters}
                      className="px-6 py-2 bg-kake-caramel-500 text-white rounded-xl hover:bg-kake-caramel-600 transition-colors font-medium shadow-caramel"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}

              {/* Products Grid */}
              {!productsLoading && !assignmentsLoading && !productsError && products.length > 0 && (
                <>
                  <div
                    className={
                      view_mode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6'
                        : 'space-y-4'
                    }
                  >
                     {products.map((product) => {
                      const is_out_of_stock = product.availability_status !== 'in_stock';
                      
                      // Parse dietary tags from JSON array
                      let dietary_tags_array: string[] = [];
                      if (product.dietary_tags) {
                        try {
                          dietary_tags_array = JSON.parse(product.dietary_tags);
                        } catch {
                          // Fallback to comma-separated parsing
                          dietary_tags_array = product.dietary_tags.split(',').map(t => t.trim());
                        }
                      }

                      return (
                        <div
                          key={product.product_id}
                          className={`bg-white rounded-2xl shadow-soft-lg border border-kake-cream-200 overflow-hidden transition-all hover:shadow-caramel ${
                            is_out_of_stock ? 'opacity-60' : ''
                          } ${view_mode === 'list' ? 'flex' : 'flex flex-col'}`}
                        >
                          {/* Product Image */}
                          <Link
                            to={`/location/${location_slug}/product/${product.product_id}`}
                            className={`block ${view_mode === 'list' ? 'w-48 flex-shrink-0' : 'w-full'}`}
                          >
                            <div className="relative">
                              <img
                                src={product.primary_image_url}
                                alt={product.product_name}
                                loading="lazy"
                                className={`w-full object-cover ${
                                  view_mode === 'list' ? 'h-full' : 'aspect-square'
                                }`}
                              />
                              {product.is_featured && (
                                <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                                  Featured
                                </span>
                              )}
                              {is_out_of_stock && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                  <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                                    Out of Stock
                                  </span>
                                </div>
                              )}
                            </div>
                          </Link>

                          {/* Product Info */}
                          <div className={`p-4 flex flex-col ${view_mode === 'list' ? 'flex-1 justify-between' : 'flex-1'}`}>
                            <div className="flex-1">
                              <Link
                                to={`/location/${location_slug}/product/${product.product_id}`}
                                className="block"
                              >
                                <h3 className="font-serif text-base font-semibold text-kake-chocolate-500 hover:text-kake-caramel-500 transition-colors mb-1 line-clamp-1">
                                  {product.product_name}
                                </h3>
                              </Link>

                              <p className="text-sm text-kake-chocolate-400 mb-3 line-clamp-2">
                                {product.short_description}
                              </p>

                              {/* Dietary Tags */}
                              {dietary_tags_array.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  {dietary_tags_array.slice(0, 2).map((tag, idx) => {
                                    // Soft pastel colors for different dietary tags
                                    const badgeColors = [
                                      'bg-green-50 text-green-700 border border-green-200', // sage green
                                      'bg-pink-50 text-pink-700 border border-pink-200',   // soft pink
                                    ];
                                    return (
                                      <span
                                        key={tag}
                                        className={`px-2 py-0.5 ${badgeColors[idx % badgeColors.length]} text-xs rounded-full font-medium`}
                                      >
                                        {tag.replace('_', ' ')}
                                      </span>
                                    );
                                  })}
                                  {dietary_tags_array.length > 2 && (
                                    <span className="px-2 py-0.5 bg-kake-cream-100 text-kake-chocolate-400 border border-kake-cream-200 text-xs rounded-full font-medium">
                                      +{dietary_tags_array.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Price & Add to Cart Button - Same Line */}
                            <div className="flex items-center justify-between gap-3 mt-auto pt-3 border-t border-kake-cream-200">
                              <div className="flex flex-col">
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-xl font-bold text-kake-chocolate-500">
                                    €{product.price.toFixed(2)}
                                  </span>
                                  {product.compare_at_price && (
                                    <span className="text-xs text-kake-chocolate-300 line-through">
                                      €{product.compare_at_price.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <Link
                                to={is_out_of_stock ? '#' : `/location/${location_slug}/product/${product.product_id}`}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 inline-flex items-center justify-center whitespace-nowrap min-h-[44px] ${
                                  is_out_of_stock
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-kake-caramel-500 text-white hover:bg-kake-caramel-600 shadow-caramel hover:shadow-caramel-lg active:scale-95'
                                }`}
                                onClick={(e) => {
                                  if (is_out_of_stock) {
                                    e.preventDefault();
                                  }
                                }}
                              >
                                {is_out_of_stock ? 'Out of Stock' : 'Select'}
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {total_pages > 1 && (
                    <div className="mt-8 flex items-center justify-center space-x-2">
                      <button
                        onClick={() => goToPage(pagination_state.current_page - 1)}
                        disabled={!has_previous}
                        className="px-4 py-2 bg-white border border-kake-cream-300 rounded-xl text-sm font-medium text-kake-chocolate-500 hover:bg-kake-cream-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>

                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, total_pages) }, (_, i) => {
                          let page_num: number;
                          if (total_pages <= 5) {
                            page_num = i + 1;
                          } else if (pagination_state.current_page <= 3) {
                            page_num = i + 1;
                          } else if (pagination_state.current_page >= total_pages - 2) {
                            page_num = total_pages - 4 + i;
                          } else {
                            page_num = pagination_state.current_page - 2 + i;
                          }

                          return (
                            <button
                              key={page_num}
                              onClick={() => goToPage(page_num)}
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                pagination_state.current_page === page_num
                                  ? 'bg-kake-caramel-500 text-white shadow-caramel'
                                  : 'bg-white border border-kake-cream-300 text-kake-chocolate-500 hover:bg-kake-cream-50'
                              }`}
                            >
                              {page_num}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => goToPage(pagination_state.current_page + 1)}
                        disabled={!has_next}
                        className="px-4 py-2 bg-white border border-kake-cream-300 rounded-xl text-sm font-medium text-kake-chocolate-500 hover:bg-kake-cream-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Menu;