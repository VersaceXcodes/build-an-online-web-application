import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';

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
  const [filter_panel_open, setFilterPanelOpen] = useState(false);
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
          } catch (e) {
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
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <Link to="/" className="hover:text-blue-600 transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link to={`/location/${current_location_name}`} className="hover:text-blue-600 transition-colors">
                {current_location_name.charAt(0).toUpperCase() + current_location_name.slice(1)}
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Menu</span>
            </nav>

            {/* Title & View Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {current_location_name.charAt(0).toUpperCase() + current_location_name.slice(1)} Menu
                </h1>
                {current_fulfillment_method && (
                  <p className="text-gray-600 mt-1">
                    {current_fulfillment_method === 'delivery' ? '🚚 Delivery' : '🏪 Collection'}
                  </p>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    view_mode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    view_mode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
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
                  className="w-full px-4 py-3 pl-12 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
              <p className="text-sm text-gray-600">
                {productsLoading || assignmentsLoading ? (
                  <span>Loading products...</span>
                ) : (
                  <span>
                    Showing <span className="font-semibold">{products.length}</span> of{' '}
                    <span className="font-semibold">{total_products_count}</span> products
                    {active_filters.search_query && (
                      <> for &quot;<span className="font-semibold">{active_filters.search_query}</span>&quot;</>
                    )}
                  </span>
                )}
              </p>

              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2">
                <label htmlFor="sort" className="text-sm text-gray-600 hidden sm:block">
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
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
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
            {/* Filter Panel - Mobile Toggle Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setFilterPanelOpen(!filter_panel_open)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span>Filters {Object.values(active_filters).filter(v => v !== null && v !== '' && (!Array.isArray(v) || v.length > 0)).length > 0 && `(${Object.values(active_filters).filter(v => v !== null && v !== '' && (!Array.isArray(v) || v.length > 0)).length})`}</span>
                <svg
                  className={`h-5 w-5 transition-transform ${filter_panel_open ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Filter Panel - Sidebar */}
            <aside className={`lg:col-span-1 ${filter_panel_open ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  {Object.values(active_filters).some(v => v !== null && v !== '' && (!Array.isArray(v) || v.length > 0)) && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Category</h3>
                  <div className="space-y-2">
                    {['pastries', 'breads', 'cakes', 'corporate'].map((cat) => (
                      <label key={cat} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          checked={active_filters.category === cat}
                          onChange={() => updateFilter('category', active_filters.category === cat ? null : cat)}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700 capitalize">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="price_min" className="text-xs text-gray-600 block mb-1">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="price_max" className="text-xs text-gray-600 block mb-1">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Dietary Tags Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Dietary Preferences</h3>
                  <div className="space-y-2">
                    {dietary_tag_options.map((tag) => (
                      <label key={tag.value} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={active_filters.dietary_tags.includes(tag.value)}
                          onChange={() => toggleDietaryTag(tag.value)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">{tag.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability Filter */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Availability</h3>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={active_filters.availability_status === 'in_stock'}
                      onChange={() => updateFilter('availability_status', active_filters.availability_status === 'in_stock' ? null : 'in_stock')}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">Hide Out of Stock</span>
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading delicious treats...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {productsError && !productsLoading && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <p className="text-red-700 mb-4">Failed to load products. Please try again.</p>
                  <button
                    onClick={() => refetchProducts()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!productsLoading && !assignmentsLoading && !productsError && products.length === 0 && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400 mb-4"
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No desserts found</h3>
                  <p className="text-gray-600 mb-4">
                    {active_filters.search_query
                      ? `No results for "${active_filters.search_query}"`
                      : 'Try adjusting your filters'}
                  </p>
                  {Object.values(active_filters).some(v => v !== null && v !== '' && (!Array.isArray(v) || v.length > 0)) && (
                    <button
                      onClick={clearAllFilters}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
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
                        } catch (e) {
                          // Fallback to comma-separated parsing
                          dietary_tags_array = product.dietary_tags.split(',').map(t => t.trim());
                        }
                      }

                      return (
                        <div
                          key={product.product_id}
                          className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-xl ${
                            is_out_of_stock ? 'opacity-60' : ''
                          } ${view_mode === 'list' ? 'flex' : ''}`}
                        >
                          {/* Product Image */}
                          <Link
                            to={`/location/${current_location_name}/product/${product.product_id}`}
                            className={`block ${view_mode === 'list' ? 'w-48 flex-shrink-0' : ''}`}
                          >
                            <div className="relative">
                              <img
                                src={product.primary_image_url}
                                alt={product.product_name}
                                loading="lazy"
                                className={`w-full object-cover ${
                                  view_mode === 'list' ? 'h-full' : 'h-56'
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
                          <div className={`p-6 ${view_mode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
                            <div>
                              <Link
                                to={`/location/${current_location_name}/product/${product.product_id}`}
                                className="block"
                              >
                                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2">
                                  {product.product_name}
                                </h3>
                              </Link>

                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {product.short_description}
                              </p>

                              {/* Dietary Tags */}
                              {dietary_tags_array.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {dietary_tags_array.slice(0, 3).map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium"
                                    >
                                      {tag.replace('_', ' ')}
                                    </span>
                                  ))}
                                  {dietary_tags_array.length > 3 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                      +{dietary_tags_array.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Price & Add to Cart */}
                            <div className={`flex items-center ${view_mode === 'list' ? 'justify-between' : 'justify-between'} mt-4`}>
                              <div>
                                <div className="flex items-baseline space-x-2">
                                  <span className="text-2xl font-bold text-gray-900">
                                    €{product.price.toFixed(2)}
                                  </span>
                                  {product.compare_at_price && (
                                    <span className="text-sm text-gray-500 line-through">
                                      €{product.compare_at_price.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() => handleAddToCart(product)}
                                disabled={is_out_of_stock}
                                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                  is_out_of_stock
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
                                }`}
                              >
                                {is_out_of_stock ? 'Out of Stock' : 'Add to Cart'}
                              </button>
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
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                pagination_state.current_page === page_num
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
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
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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