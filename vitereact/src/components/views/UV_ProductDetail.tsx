import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Heart, Plus, Minus, ChevronLeft, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';

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

interface Favorite {
  favorite_id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

interface ProductApiResponse {
  product_id: string;
  product_name: string;
  short_description: string;
  long_description: string | null;
  category: string;
  price: string; // CRITICAL: Backend returns as string
  compare_at_price: string | null;
  primary_image_url: string;
  additional_images: string | null;
  availability_status: string;
  stock_quantity: string | null;
  low_stock_threshold: string | null;
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

// ============================================================================
// COMPONENT
// ============================================================================

const UV_ProductDetail: React.FC = () => {
  const { location_name, product_id } = useParams<{ location_name: string; product_id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Global state access - CRITICAL: Individual selectors only
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const addToCart = useAppStore(state => state.add_to_cart);
  const showToast = useAppStore(state => state.show_toast);
  const openCartPanel = useAppStore(state => state.open_cart_panel);

  // Local state
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [additionalImagesArray, setAdditionalImagesArray] = useState<string[]>([]);

  // ============================================================================
  // API CALLS - FETCH PRODUCT DETAILS
  // ============================================================================

  const fetchProductDetails = async (productId: string): Promise<Product> => {
    const response = await axios.get<ProductApiResponse>(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/products/${productId}`
    );
    
    // CRITICAL: Convert string numbers to numbers
    return {
      ...response.data,
      category: response.data.category as 'pastries' | 'breads' | 'cakes' | 'corporate',
      availability_status: response.data.availability_status as 'in_stock' | 'out_of_stock' | 'discontinued',
      price: Number(response.data.price || 0),
      compare_at_price: response.data.compare_at_price ? Number(response.data.compare_at_price) : null,
      stock_quantity: response.data.stock_quantity ? Number(response.data.stock_quantity) : null,
      low_stock_threshold: response.data.low_stock_threshold ? Number(response.data.low_stock_threshold) : null,
    };
  };

  const { data: product, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ['product', product_id],
    queryFn: () => fetchProductDetails(product_id!),
    enabled: !!product_id,
    staleTime: 60000, // 1 minute
    retry: 1,
  });

  // Parse dietary tags and additional images when product loads
  useEffect(() => {
    if (product) {
      // Parse additional images
      if (product.additional_images) {
        try {
          const parsed = JSON.parse(product.additional_images);
          setAdditionalImagesArray(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error('Failed to parse additional images:', e);
          setAdditionalImagesArray([]);
        }
      } else {
        setAdditionalImagesArray([]);
      }
    }
  }, [product]);

  // Parse dietary tags
  const dietaryTagsArray = product?.dietary_tags 
    ? product.dietary_tags.split(',').map(tag => tag.trim()).filter(Boolean)
    : [];

  // All images for gallery (primary + additional)
  const allImages = product 
    ? [product.primary_image_url, ...additionalImagesArray]
    : [];

  // ============================================================================
  // API CALLS - FETCH RELATED PRODUCTS
  // ============================================================================

  const fetchRelatedProducts = async (category: string, currentProductId: string): Promise<Product[]> => {
    const response = await axios.get<{ data: ProductApiResponse[] }>(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/products`,
      {
        params: {
          category,
          availability_status: 'in_stock',
          is_archived: false,
          limit: 5, // Fetch 5 to filter out current and still have 4
          offset: 0,
          sort_by: 'created_at',
          sort_order: 'desc',
        },
      }
    );

    // CRITICAL: Convert string numbers to numbers
    const products = response.data.data.map(p => ({
      ...p,
      category: p.category as 'pastries' | 'breads' | 'cakes' | 'corporate',
      availability_status: p.availability_status as 'in_stock' | 'out_of_stock' | 'discontinued',
      price: Number(p.price || 0),
      compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
      stock_quantity: p.stock_quantity ? Number(p.stock_quantity) : null,
      low_stock_threshold: p.low_stock_threshold ? Number(p.low_stock_threshold) : null,
    }));

    // Filter out current product and limit to 4
    return products
      .filter(p => p.product_id !== currentProductId)
      .slice(0, 4);
  };

  const { data: relatedProducts = [], isLoading: relatedLoading } = useQuery({
    queryKey: ['related-products', product?.category, product?.product_id],
    queryFn: () => fetchRelatedProducts(product!.category, product!.product_id),
    enabled: !!product && !!product.category,
    staleTime: 300000, // 5 minutes
  });

  // ============================================================================
  // API CALLS - FAVORITES
  // ============================================================================

  const fetchFavorites = async (): Promise<Favorite[]> => {
    if (!currentUser) return [];
    
    const response = await axios.get<Favorite[]>(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/favorites`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    
    return response.data;
  };

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', currentUser?.user_id],
    queryFn: fetchFavorites,
    enabled: isAuthenticated && !!currentUser,
    staleTime: 60000,
  });

  const isFavorited = favorites.some(fav => fav.product_id === product_id);

  const addFavoriteMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/favorites`,
        {
          product_id: productId,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', currentUser?.user_id] });
      showToast('success', 'Added to favorites');
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to add favorite');
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (favoriteId: string) => {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/favorites/${favoriteId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', currentUser?.user_id] });
      showToast('info', 'Removed from favorites');
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to remove favorite');
    },
  });

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleQuantityChange = (delta: number) => {
    setSelectedQuantity(prev => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.availability_status !== 'in_stock') {
      showToast('error', 'This product is currently unavailable');
      return;
    }

    const cartItem = {
      product_id: product.product_id,
      product_name: product.product_name,
      price: product.price,
      quantity: selectedQuantity,
      subtotal: product.price * selectedQuantity,
      primary_image_url: product.primary_image_url,
    };

    addToCart(cartItem);
    setSelectedQuantity(1); // Reset quantity
    
    // Optional: Auto-open cart panel
    setTimeout(() => {
      openCartPanel();
    }, 500);
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      showToast('info', 'Please log in to save favorites');
      navigate('/login');
      return;
    }

    const favorite = favorites.find(fav => fav.product_id === product_id);
    
    if (favorite) {
      // Remove from favorites
      removeFavoriteMutation.mutate(favorite.favorite_id);
    } else {
      // Add to favorites
      addFavoriteMutation.mutate(product_id!);
    }
  };

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handlePreviousImage = () => {
    setSelectedImageIndex(prev => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex(prev => 
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  useEffect(() => {
    if (productError) {
      showToast('error', 'Product not found');
      navigate(`/location/${location_name}/menu`);
    }
  }, [productError, navigate, location_name, showToast]);

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (productLoading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Loading product details...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <Link
              to={`/location/${location_name}/menu`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Menu
            </Link>
          </div>
        </div>
      </>
    );
  }

  const isOutOfStock = product.availability_status !== 'in_stock';
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const favoriteLoading = addFavoriteMutation.isPending || removeFavoriteMutation.isPending;

  // Dietary tag icons mapping
  const dietaryIcons: { [key: string]: string } = {
    'vegan': '🌱',
    'vegetarian': '🥬',
    'gluten_free': '🌾',
    'dairy_free': '🥛',
    'nut_free': '🥜',
    'organic': '🌿',
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20 lg:pb-8">
        {/* Breadcrumb Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link 
                to="/" 
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <Link 
                to={`/location/${location_name}`}
                className="text-gray-500 hover:text-gray-700 transition-colors capitalize"
              >
                {location_name}
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <Link 
                to={`/location/${location_name}/menu`}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Menu
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium truncate max-w-xs">
                {product.product_name}
              </span>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* ============================================================ */}
            {/* IMAGE GALLERY */}
            {/* ============================================================ */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative bg-white rounded-xl shadow-lg overflow-hidden aspect-square">
                <img
                  src={allImages[selectedImageIndex]}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Image Navigation Arrows (if multiple images) */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePreviousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-900" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-900" />
                    </button>
                  </>
                )}

                {/* Featured Badge */}
                {product.is_featured && (
                  <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    ⭐ Featured
                  </div>
                )}

                {/* Out of Stock Badge */}
                {isOutOfStock && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageSelect(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? 'border-blue-600 ring-2 ring-blue-100'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.product_name} view ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ============================================================ */}
            {/* PRODUCT INFORMATION */}
            {/* ============================================================ */}
            <div className="space-y-6">
              {/* Product Name and Favorite */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-2">
                    {product.product_name}
                  </h1>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {product.short_description}
                  </p>
                </div>
                
                {/* Favorite Button (Authenticated Only) */}
                {isAuthenticated && (
                  <button
                    onClick={handleToggleFavorite}
                    disabled={favoriteLoading}
                    className="flex-shrink-0 p-3 rounded-full border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                    aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart
                      className={`w-6 h-6 transition-colors ${
                        isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900">
                  €{product.price.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-2xl font-medium text-gray-500 line-through">
                    €{product.compare_at_price!.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Dietary Tags */}
              {dietaryTagsArray.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {dietaryTagsArray.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                      <span>{dietaryIcons[tag.toLowerCase()] || '✓'}</span>
                      <span className="capitalize">{tag.replace('_', ' ')}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Long Description */}
              {product.long_description && (
                <div className="prose prose-blue max-w-none">
                  <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
                    <p className="text-gray-700 leading-relaxed">
                      {product.long_description}
                    </p>
                  </div>
                </div>
              )}

              {/* Availability Status */}
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${
                  isOutOfStock ? 'bg-red-500' : 'bg-green-500'
                }`} />
                <span className={`font-medium ${
                  isOutOfStock ? 'text-red-700' : 'text-green-700'
                }`}>
                  {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                </span>
                {!isOutOfStock && product.stock_quantity && product.low_stock_threshold && 
                 product.stock_quantity <= product.low_stock_threshold && (
                  <span className="text-orange-600 font-medium ml-2">
                    Only {product.stock_quantity} left!
                  </span>
                )}
              </div>

              {/* Corporate Badge */}
              {product.available_for_corporate && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium">
                  <span>🎉</span>
                  <span>Great for corporate orders</span>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={selectedQuantity <= 1 || isOutOfStock}
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-5 h-5 text-gray-700" />
                    </button>
                    <span className="px-6 py-3 text-xl font-bold text-gray-900 min-w-[60px] text-center">
                      {selectedQuantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={isOutOfStock}
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                  
                  {!isOutOfStock && (
                    <span className="text-gray-600 text-sm">
                      Total: <span className="font-bold text-gray-900">€{(product.price * selectedQuantity).toFixed(2)}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Add to Cart Button (Desktop) */}
              <div className="hidden lg:block">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 ${
                    isOutOfStock
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl hover:scale-105'
                  }`}
                >
                  {isOutOfStock ? (
                    'Out of Stock'
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>Add to Cart</span>
                      <span className="text-sm opacity-90">€{(product.price * selectedQuantity).toFixed(2)}</span>
                    </span>
                  )}
                </button>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {product.category}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ready In</p>
                  <p className="font-semibold text-gray-900">
                    20-30 minutes
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RELATED PRODUCTS */}
          {/* ============================================================ */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
                You Might Also Like
              </h2>
              
              {relatedLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  {relatedProducts.map((relatedProduct) => (
                    <Link
                      key={relatedProduct.product_id}
                      to={`/location/${location_name}/product/${relatedProduct.product_id}`}
                      className="group bg-white rounded-xl shadow-lg hover:shadow-xl overflow-hidden transition-all duration-200 hover:scale-105"
                    >
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={relatedProduct.primary_image_url}
                          alt={relatedProduct.product_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                          {relatedProduct.product_name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {relatedProduct.short_description}
                        </p>
                        <p className="text-lg font-bold text-blue-600">
                          €{relatedProduct.price.toFixed(2)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* STICKY MOBILE ADD TO CART BAR */}
        {/* ============================================================ */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-40">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              {/* Quantity Controls (Compact) */}
              <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={selectedQuantity <= 1 || isOutOfStock}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4 text-gray-700" />
                </button>
                <span className="px-4 py-2 text-lg font-bold text-gray-900 min-w-[50px] text-center">
                  {selectedQuantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={isOutOfStock}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4 text-gray-700" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-6 rounded-lg font-bold text-base shadow-lg transition-all ${
                  isOutOfStock
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                }`}
              >
                {isOutOfStock ? (
                  'Out of Stock'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Add to Cart</span>
                    <span className="text-sm">€{(product.price * selectedQuantity).toFixed(2)}</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_ProductDetail;