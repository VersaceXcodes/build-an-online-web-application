import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Heart, ShoppingCart, Package } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Favorite {
  favorite_id: string;
  user_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_image_url: string;
  product_category: string;
  availability_status: string;
  created_at: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_Favorites: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ============================================================================
  // GLOBAL STATE ACCESS
  // ============================================================================

  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const showToast = useAppStore(state => state.show_toast);
  const addToCart = useAppStore(state => state.add_to_cart);
  const selectedLocation = useAppStore(state => state.cart_state.selected_location);

  // ============================================================================
  // API CONFIGURATION
  // ============================================================================

  const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api`;

  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
    },
  });

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', currentUser?.user_id],
    queryFn: async () => {
      const response = await apiClient.get('/favorites');
      return response.data;
    },
    enabled: !!currentUser?.user_id && isAuthenticated,
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const deleteFavoriteMutation = useMutation({
    mutationFn: async (favoriteId: string) => {
      await apiClient.delete(`/favorites/${favoriteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', currentUser?.user_id] });
      showToast('info', 'Removed from favorites');
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to remove from favorites');
    },
  });

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleRemoveFromFavorites = (favoriteId: string) => {
    deleteFavoriteMutation.mutate(favoriteId);
  };

  const handleAddToCart = (favorite: Favorite) => {
    if (!selectedLocation) {
      showToast('info', 'Please select a location first');
      navigate('/');
      return;
    }

    addToCart({
      product_id: favorite.product_id,
      product_name: favorite.product_name,
      price: Number(favorite.product_price),
      quantity: 1,
      subtotal: Number(favorite.product_price),
      primary_image_url: favorite.product_image_url,
    });

    showToast('success', 'Added to cart!');
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Redirect if not authenticated
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your favorites</p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-600">
            {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Favorites Yet</h2>
            <p className="text-gray-600 mb-6">
              Start adding products to your favorites to see them here
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              <Package className="h-5 w-5 mr-2" />
              Browse Products
            </Link>
          </div>
        ) : (
          /* Favorites Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite: Favorite) => (
              <div
                key={favorite.favorite_id}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={favorite.product_image_url}
                    alt={favorite.product_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a';
                    }}
                  />
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFromFavorites(favorite.favorite_id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-all group"
                    aria-label="Remove from favorites"
                  >
                    <Heart className="h-5 w-5 fill-red-500 text-red-500 group-hover:fill-white group-hover:text-red-600" />
                  </button>

                  {/* Availability Badge */}
                  {favorite.availability_status !== 'in_stock' && (
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {favorite.product_name}
                    </h3>
                    <p className="text-sm text-gray-600 capitalize">{favorite.product_category}</p>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-purple-600">
                      {formatCurrency(Number(favorite.product_price))}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/location/${selectedLocation || 'london-flagship'}/product/${favorite.product_id}`}
                      className={`flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg transition-colors ${
                        favorite.availability_status === 'in_stock'
                          ? 'text-white bg-purple-600 hover:bg-purple-700'
                          : 'text-gray-400 bg-gray-100 cursor-not-allowed pointer-events-none'
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Choose Toppings & Sauces
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UV_Favorites;
