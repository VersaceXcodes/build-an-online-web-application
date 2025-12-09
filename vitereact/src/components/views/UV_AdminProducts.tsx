import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { 
  Plus, 
  Search, 
  X, 
  Edit2, 
  Trash2, 
  Image as ImageIcon, 
  CheckCircle,
  XCircle,
  Upload,
  AlertCircle,
  Tag,
  Package,
  Star,
  ChevronDown
} from 'lucide-react';

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

interface ProductFormData {
  product_id: string | null;
  product_name: string;
  short_description: string;
  long_description: string;
  category: 'pastries' | 'breads' | 'cakes' | 'corporate';
  price: number;
  compare_at_price: number | null;
  primary_image_url: string;
  additional_images: string[];
  availability_status: 'in_stock' | 'out_of_stock' | 'discontinued';
  stock_quantity: number | null;
  low_stock_threshold: number | null;
  dietary_tags: string[];
  custom_tags: string[];
  is_featured: boolean;
  available_for_corporate: boolean;
  available_from_date: string | null;
  available_until_date: string | null;
  location_assignments: string[];
}

interface ProductFilters {
  location: string | null;
  availability: 'all' | 'in_stock' | 'out_of_stock';
  category: string | null;
  search: string;
  sort_by: 'product_name' | 'price' | 'created_at';
  sort_order: 'asc' | 'desc';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_AdminProducts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Global state access - CRITICAL: Individual selectors only
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const availableLocations = useAppStore(state => state.location_state.available_locations);
  const showToast = useAppStore(state => state.show_toast);
  const showConfirmation = useAppStore(state => state.show_confirmation);
  const hideConfirmation = useAppStore(state => state.hide_confirmation);

  // Initialize filters from URL params
  const initialFilters: ProductFilters = {
    location: searchParams.get('location') || null,
    availability: (searchParams.get('availability') as ProductFilters['availability']) || 'all',
    category: searchParams.get('category') || null,
    search: searchParams.get('search') || '',
    sort_by: (searchParams.get('sort_by') as ProductFilters['sort_by']) || 'created_at',
    sort_order: (searchParams.get('sort_order') as ProductFilters['sort_order']) || 'desc'
  };

  // State variables
  const [productFilters, setProductFilters] = useState<ProductFilters>(initialFilters);
  const [productFormModalOpen, setProductFormModalOpen] = useState(false);
  const [productFormMode, setProductFormMode] = useState<'create' | 'edit'>('create');
  const [productFormData, setProductFormData] = useState<ProductFormData>({
    product_id: null,
    product_name: '',
    short_description: '',
    long_description: '',
    category: 'pastries',
    price: 0,
    compare_at_price: null,
    primary_image_url: '',
    additional_images: [],
    availability_status: 'in_stock',
    stock_quantity: null,
    low_stock_threshold: null,
    dietary_tags: [],
    custom_tags: [],
    is_featured: false,
    available_for_corporate: true,
    available_from_date: null,
    available_until_date: null,
    location_assignments: []
  });
  const [productFormErrors, setProductFormErrors] = useState<Record<string, string>>({});
  const [selectedProductsForBulk, setSelectedProductsForBulk] = useState<string[]>([]);
  const [imageUploadProgress, setImageUploadProgress] = useState({
    uploading: false,
    progress: 0,
    uploaded_urls: [] as string[]
  });

  // Sync filters with URL params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (productFilters.location) params.location = productFilters.location;
    if (productFilters.availability !== 'all') params.availability = productFilters.availability;
    if (productFilters.category) params.category = productFilters.category;
    if (productFilters.search) params.search = productFilters.search;
    params.sort_by = productFilters.sort_by;
    params.sort_order = productFilters.sort_order;
    
    setSearchParams(params);
  }, [productFilters, setSearchParams]);

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  const fetchProducts = async () => {
    const params: Record<string, string | number> = {
      limit: 100,
      offset: 0,
      sort_by: productFilters.sort_by,
      sort_order: productFilters.sort_order,
      is_archived: 'false'
    };

    if (productFilters.search) params.query = productFilters.search;
    if (productFilters.category) params.category = productFilters.category;
    if (productFilters.availability !== 'all') params.availability_status = productFilters.availability;

    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/products`,
      {
        params,
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    return response.data;
  };

  const createProduct = async (data: ProductFormData) => {
    const payload = {
      product_name: data.product_name,
      short_description: data.short_description,
      long_description: data.long_description || null,
      category: data.category,
      price: data.price,
      compare_at_price: data.compare_at_price,
      primary_image_url: data.primary_image_url,
      additional_images: data.additional_images.length > 0 ? JSON.stringify(data.additional_images) : null,
      availability_status: data.availability_status,
      stock_quantity: data.stock_quantity,
      low_stock_threshold: data.low_stock_threshold,
      dietary_tags: data.dietary_tags.length > 0 ? JSON.stringify(data.dietary_tags) : null,
      custom_tags: data.custom_tags.length > 0 ? JSON.stringify(data.custom_tags) : null,
      is_featured: data.is_featured,
      available_for_corporate: data.available_for_corporate,
      available_from_date: data.available_from_date,
      available_until_date: data.available_until_date,
      location_assignments: data.location_assignments
    };

    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/products`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    return response.data;
  };

  const updateProduct = async (data: ProductFormData) => {
    const payload = {
      product_id: data.product_id,
      product_name: data.product_name,
      short_description: data.short_description,
      long_description: data.long_description || null,
      category: data.category,
      price: data.price,
      compare_at_price: data.compare_at_price,
      primary_image_url: data.primary_image_url,
      additional_images: data.additional_images.length > 0 ? JSON.stringify(data.additional_images) : null,
      availability_status: data.availability_status,
      stock_quantity: data.stock_quantity,
      low_stock_threshold: data.low_stock_threshold,
      dietary_tags: data.dietary_tags.length > 0 ? JSON.stringify(data.dietary_tags) : null,
      custom_tags: data.custom_tags.length > 0 ? JSON.stringify(data.custom_tags) : null,
      is_featured: data.is_featured,
      available_for_corporate: data.available_for_corporate,
      available_from_date: data.available_from_date,
      available_until_date: data.available_until_date
    };

    const response = await axios.put(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/products/${data.product_id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    return response.data;
  };

  const deleteProduct = async (product_id: string) => {
    const response = await axios.delete(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/products/${product_id}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    return response.data;
  };

  // ============================================================================
  // REACT QUERY HOOKS
  // ============================================================================

  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products', productFilters],
    queryFn: fetchProducts,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1,
    select: (data) => ({
      products: data.data?.map((p: any) => ({
        ...p,
        price: Number(p.price || 0),
        compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
        stock_quantity: p.stock_quantity ? Number(p.stock_quantity) : null,
        low_stock_threshold: p.low_stock_threshold ? Number(p.low_stock_threshold) : null
      })) || [],
      total: data.total || 0
    })
  });

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setProductFormModalOpen(false);
      resetProductForm();
      showToast('success', 'Product created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create product';
      showToast('error', message);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setProductFormModalOpen(false);
      resetProductForm();
      showToast('success', 'Product updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update product';
      showToast('error', message);
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showToast('success', 'Product archived successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete product';
      showToast('error', message);
    }
  });

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const resetProductForm = () => {
    setProductFormData({
      product_id: null,
      product_name: '',
      short_description: '',
      long_description: '',
      category: 'pastries',
      price: 0,
      compare_at_price: null,
      primary_image_url: '',
      additional_images: [],
      availability_status: 'in_stock',
      stock_quantity: null,
      low_stock_threshold: null,
      dietary_tags: [],
      custom_tags: [],
      is_featured: false,
      available_for_corporate: true,
      available_from_date: null,
      available_until_date: null,
      location_assignments: []
    });
    setProductFormErrors({});
  };

  const openCreateModal = () => {
    resetProductForm();
    setProductFormMode('create');
    setProductFormModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setProductFormData({
      product_id: product.product_id,
      product_name: product.product_name,
      short_description: product.short_description,
      long_description: product.long_description || '',
      category: product.category,
      price: product.price,
      compare_at_price: product.compare_at_price,
      primary_image_url: product.primary_image_url,
      additional_images: product.additional_images ? JSON.parse(product.additional_images) : [],
      availability_status: product.availability_status,
      stock_quantity: product.stock_quantity,
      low_stock_threshold: product.low_stock_threshold,
      dietary_tags: product.dietary_tags ? (() => {
        try {
          return JSON.parse(product.dietary_tags);
        } catch (e) {
          return product.dietary_tags.split(',');
        }
      })() : [],
      custom_tags: product.custom_tags ? (() => {
        try {
          return JSON.parse(product.custom_tags);
        } catch (e) {
          return product.custom_tags.split(',');
        }
      })() : [],
      is_featured: product.is_featured,
      available_for_corporate: product.available_for_corporate,
      available_from_date: product.available_from_date,
      available_until_date: product.available_until_date,
      location_assignments: []
    });
    setProductFormMode('edit');
    setProductFormModalOpen(true);
  };

  const validateProductForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!productFormData.product_name.trim()) {
      errors.product_name = 'Product name is required';
    } else if (productFormData.product_name.length > 255) {
      errors.product_name = 'Product name must be 255 characters or less';
    }

    if (!productFormData.short_description.trim()) {
      errors.short_description = 'Short description is required';
    } else if (productFormData.short_description.length > 500) {
      errors.short_description = 'Short description must be 500 characters or less';
    }

    if (productFormData.long_description && productFormData.long_description.length > 2000) {
      errors.long_description = 'Long description must be 2000 characters or less';
    }

    if (!productFormData.price || productFormData.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }

    if (productFormData.compare_at_price && productFormData.compare_at_price <= productFormData.price) {
      errors.compare_at_price = 'Compare at price must be greater than regular price';
    }

    if (!productFormData.primary_image_url.trim()) {
      errors.primary_image_url = 'Product image is required';
    }

    if (productFormMode === 'create' && productFormData.location_assignments.length === 0) {
      errors.location_assignments = 'Please assign at least one location';
    }

    setProductFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFilterChange = (key: keyof ProductFilters, value: string | null) => {
    setProductFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleProductFormChange = (key: keyof ProductFormData, value: any) => {
    setProductFormData(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Clear error for this field
    if (productFormErrors[key]) {
      setProductFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isPrimary: boolean = true) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simple base64 conversion (in production, would upload to CDN)
    const reader = new FileReader();
    reader.onloadstart = () => {
      setImageUploadProgress(prev => ({ ...prev, uploading: true, progress: 0 }));
    };
    
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setImageUploadProgress(prev => ({ ...prev, progress }));
      }
    };

    reader.onload = () => {
      const imageUrl = reader.result as string;
      
      if (isPrimary) {
        handleProductFormChange('primary_image_url', imageUrl);
      } else {
        handleProductFormChange('additional_images', [
          ...productFormData.additional_images,
          imageUrl
        ]);
      }
      
      setImageUploadProgress({ uploading: false, progress: 0, uploaded_urls: [] });
      showToast('success', 'Image uploaded successfully');
    };

    reader.onerror = () => {
      setImageUploadProgress({ uploading: false, progress: 0, uploaded_urls: [] });
      showToast('error', 'Failed to upload image');
    };

    reader.readAsDataURL(file);
  };

  const removeAdditionalImage = (index: number) => {
    handleProductFormChange(
      'additional_images',
      productFormData.additional_images.filter((_, i) => i !== index)
    );
  };

  const handleSubmitProductForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProductForm()) {
      showToast('error', 'Please fix validation errors');
      return;
    }

    if (productFormMode === 'create') {
      createProductMutation.mutate(productFormData);
    } else {
      updateProductMutation.mutate(productFormData);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    showConfirmation({
      title: 'Delete Product',
      message: `Are you sure you want to archive "${product.product_name}"? This product will no longer appear in menus but order history will be preserved.`,
      confirm_text: 'Archive Product',
      cancel_text: 'Cancel',
      danger_action: true,
      on_confirm: () => {
        deleteProductMutation.mutate(product.product_id);
        hideConfirmation();
      },
      on_cancel: () => {
        hideConfirmation();
      }
    });
  };

  const toggleProductSelection = (product_id: string) => {
    setSelectedProductsForBulk(prev => 
      prev.includes(product_id)
        ? prev.filter(id => id !== product_id)
        : [...prev, product_id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProductsForBulk.length === productsData?.products.length) {
      setSelectedProductsForBulk([]);
    } else {
      setSelectedProductsForBulk(productsData?.products.map((p: Product) => p.product_id) || []);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleBulkAvailabilityUpdate = (_status: 'in_stock' | 'out_of_stock') => {
    showToast('info', 'Bulk update endpoint not yet implemented');
    // When endpoint exists: call bulk update API
  };

  const addDietaryTag = (tag: string) => {
    if (tag && !productFormData.dietary_tags.includes(tag)) {
      handleProductFormChange('dietary_tags', [...productFormData.dietary_tags, tag]);
    }
  };

  const removeDietaryTag = (tag: string) => {
    handleProductFormChange(
      'dietary_tags',
      productFormData.dietary_tags.filter(t => t !== tag)
    );
  };

  // const addCustomTag = (tag: string) => {
  //   if (tag && !productFormData.custom_tags.includes(tag)) {
  //     handleProductFormChange('custom_tags', [...productFormData.custom_tags, tag]);
  //   }
  // };

  // const removeCustomTag = (tag: string) => {
  //   handleProductFormChange(
  //     'custom_tags',
  //     productFormData.custom_tags.filter(t => t !== tag)
  //   );
  // };

  const toggleLocationAssignment = (location: string) => {
    if (productFormData.location_assignments.includes(location)) {
      handleProductFormChange(
        'location_assignments',
        productFormData.location_assignments.filter(l => l !== location)
      );
    } else {
      handleProductFormChange(
        'location_assignments',
        [...productFormData.location_assignments, location]
      );
    }
  };

  // Memoized products list
  const products = useMemo(() => productsData?.products || [], [productsData]);
  const totalCount = useMemo(() => productsData?.total || 0, [productsData]);

  // Filter products by location (client-side filter after API response)
  const filteredProducts = useMemo(() => {
    if (!productFilters.location) return products;
    
    // In production, would filter based on product_locations table
    // For now, showing all products (location filter would be server-side)
    return products;
  }, [products, productFilters.location]);

  // Common dietary tags
  const commonDietaryTags = ['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'sugar_free', 'organic'];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage your products, pricing, and availability
                </p>
              </div>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Product
              </button>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productFilters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={productFilters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="pastries">Pastries</option>
                  <option value="breads">Breads</option>
                  <option value="cakes">Cakes</option>
                  <option value="corporate">Corporate</option>
                </select>
              </div>

              {/* Availability Filter */}
              <div>
                <select
                  value={productFilters.availability}
                  onChange={(e) => handleFilterChange('availability', e.target.value as ProductFilters['availability'])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="in_stock">In Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={`${productFilters.sort_by}_${productFilters.sort_order}`}
                  onChange={(e) => {
                    const [sort_by, sort_order] = e.target.value.split('_') as [ProductFilters['sort_by'], ProductFilters['sort_order']];
                    setProductFilters(prev => ({ ...prev, sort_by, sort_order }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  <option value="created_at_desc">Newest First</option>
                  <option value="created_at_asc">Oldest First</option>
                  <option value="product_name_asc">Name A-Z</option>
                  <option value="product_name_desc">Name Z-A</option>
                  <option value="price_asc">Price Low-High</option>
                  <option value="price_desc">Price High-Low</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Active Filters & Bulk Actions */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="font-medium">{totalCount} products</span>
                {(productFilters.search || productFilters.category || productFilters.availability !== 'all') && (
                  <>
                    <span>•</span>
                    <button
                      onClick={() => {
                        setProductFilters({
                          location: null,
                          availability: 'all',
                          category: null,
                          search: '',
                          sort_by: 'created_at',
                          sort_order: 'desc'
                        });
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear filters
                    </button>
                  </>
                )}
              </div>

              {selectedProductsForBulk.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedProductsForBulk.length} selected
                  </span>
                  <button
                    onClick={() => handleBulkAvailabilityUpdate('in_stock')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                  >
                    Mark In Stock
                  </button>
                  <button
                    onClick={() => handleBulkAvailabilityUpdate('out_of_stock')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors"
                  >
                    Mark Out of Stock
                  </button>
                  <button
                    onClick={() => setSelectedProductsForBulk([])}
                    className="p-2 text-gray-600 hover:text-gray-900"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {productsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading products...</p>
              </div>
            </div>
          ) : productsError ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Products</h3>
              <p className="text-red-700">Please try refreshing the page</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-600 mb-6">
                {productFilters.search || productFilters.category 
                  ? 'Try adjusting your filters or search terms'
                  : 'Get started by adding your first product'
                }
              </p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Product
              </button>
            </div>
          ) : (
            <>
              {/* Bulk Select All */}
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedProductsForBulk.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Select All
                </label>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product: Product) => (
                  <div
                    key={product.product_id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
                  >
                    {/* Product Image */}
                    <div className="relative h-48 bg-gray-100">
                      {product.primary_image_url ? (
                        <img
                          src={product.primary_image_url}
                          alt={product.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Selection Checkbox */}
                      <div className="absolute top-3 left-3">
                        <input
                          type="checkbox"
                          checked={selectedProductsForBulk.includes(product.product_id)}
                          onChange={() => toggleProductSelection(product.product_id)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 bg-white/90"
                        />
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        {product.availability_status === 'in_stock' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            In Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            Out of Stock
                          </span>
                        )}
                      </div>

                      {/* Featured Badge */}
                      {product.is_featured && (
                        <div className="absolute bottom-3 left-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Featured
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                            {product.product_name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {product.short_description}
                          </p>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="flex items-center space-x-2 mt-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {product.category}
                        </span>
                        {product.available_for_corporate && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                            Corporate
                          </span>
                        )}
                      </div>

                      {/* Dietary Tags */}
                      {product.dietary_tags && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(() => {
                            try {
                              return JSON.parse(product.dietary_tags);
                            } catch (e) {
                              return product.dietary_tags.split(',');
                            }
                          })().map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Price */}
                      <div className="mt-4 flex items-baseline space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                          €{Number(product.price || 0).toFixed(2)}
                        </span>
                        {product.compare_at_price && (
                          <span className="text-sm text-gray-500 line-through">
                            €{Number(product.compare_at_price).toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Stock Info */}
                      {product.stock_quantity !== null && (
                        <div className="mt-2 text-sm text-gray-600">
                          Stock: {product.stock_quantity} units
                          {product.low_stock_threshold && product.stock_quantity <= product.low_stock_threshold && (
                            <span className="ml-2 text-orange-600 font-medium">
                              (Low Stock)
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-4 flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="inline-flex items-center justify-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Product Form Modal */}
        {productFormModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setProductFormModalOpen(false)}
              />

              {/* Modal Panel */}
              <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">
                      {productFormMode === 'create' ? 'Add New Product' : 'Edit Product'}
                    </h3>
                    <button
                      onClick={() => setProductFormModalOpen(false)}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmitProductForm} className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={productFormData.product_name}
                            onChange={(e) => handleProductFormChange('product_name', e.target.value)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              productFormErrors.product_name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="e.g., Classic Croissant"
                          />
                          {productFormErrors.product_name && (
                            <p className="mt-1 text-sm text-red-600">{productFormErrors.product_name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Short Description <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={productFormData.short_description}
                            onChange={(e) => handleProductFormChange('short_description', e.target.value)}
                            rows={2}
                            maxLength={500}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              productFormErrors.short_description ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Brief product description for listings"
                          />
                          <div className="flex items-center justify-between mt-1">
                            {productFormErrors.short_description && (
                              <p className="text-sm text-red-600">{productFormErrors.short_description}</p>
                            )}
                            <span className="text-xs text-gray-500">
                              {productFormData.short_description.length}/500
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Long Description
                          </label>
                          <textarea
                            value={productFormData.long_description}
                            onChange={(e) => handleProductFormChange('long_description', e.target.value)}
                            rows={4}
                            maxLength={2000}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Detailed product description for product detail page"
                          />
                          <span className="text-xs text-gray-500">
                            {productFormData.long_description.length}/2000
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Category <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={productFormData.category}
                              onChange={(e) => handleProductFormChange('category', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="pastries">Pastries</option>
                              <option value="breads">Breads</option>
                              <option value="cakes">Cakes</option>
                              <option value="corporate">Corporate</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Availability <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={productFormData.availability_status}
                              onChange={(e) => handleProductFormChange('availability_status', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="in_stock">In Stock</option>
                              <option value="out_of_stock">Out of Stock</option>
                              <option value="discontinued">Discontinued</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price (€) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={productFormData.price}
                            onChange={(e) => handleProductFormChange('price', parseFloat(e.target.value) || 0)}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                              productFormErrors.price ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                          {productFormErrors.price && (
                            <p className="mt-1 text-sm text-red-600">{productFormErrors.price}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Compare at Price (€)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={productFormData.compare_at_price || ''}
                            onChange={(e) => handleProductFormChange('compare_at_price', e.target.value ? parseFloat(e.target.value) : null)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                          <p className="mt-1 text-xs text-gray-500">Show as discounted if higher than price</p>
                        </div>
                      </div>
                    </div>

                    {/* Images */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h4>
                      
                      {/* Primary Image */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Image <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-start space-x-4">
                          {productFormData.primary_image_url && (
                            <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                              <img
                                src={productFormData.primary_image_url}
                                alt="Primary"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleProductFormChange('primary_image_url', '')}
                                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          <div className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, true)}
                              className="hidden"
                              id="primary-image-upload"
                            />
                            <label
                              htmlFor="primary-image-upload"
                              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {imageUploadProgress.uploading ? `Uploading... ${imageUploadProgress.progress}%` : 'Upload Image'}
                            </label>
                            <p className="mt-1 text-xs text-gray-500">JPG, PNG up to 5MB</p>
                          </div>
                        </div>
                        {productFormErrors.primary_image_url && (
                          <p className="mt-2 text-sm text-red-600">{productFormErrors.primary_image_url}</p>
                        )}
                      </div>

                      {/* Additional Images */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Additional Images
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {productFormData.additional_images.map((url, index) => (
                            <div key={index} className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                              <img
                                src={url}
                                alt={`Additional ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeAdditionalImage(index)}
                                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          {productFormData.additional_images.length < 4 && (
                            <div>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, false)}
                                className="hidden"
                                id="additional-image-upload"
                              />
                              <label
                                htmlFor="additional-image-upload"
                                className="flex items-center justify-center w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
                              >
                                <Plus className="w-8 h-8 text-gray-400" />
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stock Management */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Stock Management</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stock Quantity
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={productFormData.stock_quantity || ''}
                            onChange={(e) => handleProductFormChange('stock_quantity', e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Leave blank for unlimited"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Low Stock Threshold
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={productFormData.low_stock_threshold || ''}
                            onChange={(e) => handleProductFormChange('low_stock_threshold', e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Alert when stock is low"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dietary Tags */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Dietary Tags</h4>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {commonDietaryTags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => 
                                productFormData.dietary_tags.includes(tag)
                                  ? removeDietaryTag(tag)
                                  : addDietaryTag(tag)
                              }
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                productFormData.dietary_tags.includes(tag)
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {tag.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                        
                        {productFormData.dietary_tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                            <span className="text-sm font-medium text-gray-700">Selected:</span>
                            {productFormData.dietary_tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeDietaryTag(tag)}
                                  className="ml-1.5 hover:text-green-900"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Location Assignments */}
                    {productFormMode === 'create' && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          Location Assignment <span className="text-red-500">*</span>
                        </h4>
                        <div className="space-y-2">
                          {availableLocations.map((location) => (
                            <label
                              key={location.location_id}
                              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={productFormData.location_assignments.includes(location.location_name)}
                                onChange={() => toggleLocationAssignment(location.location_name)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="ml-3 text-sm font-medium text-gray-900">
                                {location.location_name}
                              </span>
                              <span className="ml-auto text-xs text-gray-500">
                                {location.city}
                              </span>
                            </label>
                          ))}
                        </div>
                        {productFormErrors.location_assignments && (
                          <p className="mt-2 text-sm text-red-600">{productFormErrors.location_assignments}</p>
                        )}
                      </div>
                    )}

                    {/* Options */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Options</h4>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={productFormData.is_featured}
                            onChange={(e) => handleProductFormChange('is_featured', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            Featured Product
                          </span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={productFormData.available_for_corporate}
                            onChange={(e) => handleProductFormChange('available_for_corporate', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            Available for Corporate Orders
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setProductFormModalOpen(false)}
                      className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createProductMutation.isPending || updateProductMutation.isPending}
                      className="px-6 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {(createProductMutation.isPending || updateProductMutation.isPending) ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {productFormMode === 'create' ? 'Creating...' : 'Updating...'}
                        </span>
                      ) : (
                        productFormMode === 'create' ? 'Create Product' : 'Update Product'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UV_AdminProducts;