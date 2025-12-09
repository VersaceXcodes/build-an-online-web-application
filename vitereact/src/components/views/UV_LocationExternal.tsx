import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ExternalLink, MapPin, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS (from Zod schemas)
// ============================================================================

interface Location {
  location_id: string;
  location_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postal_code: string;
  phone_number: string;
  email: string;
  is_collection_enabled: boolean;
  is_delivery_enabled: boolean;
  delivery_radius_km: number | null;
  delivery_fee: number | null;
  free_delivery_threshold: number | null;
  estimated_delivery_time_minutes: number | null;
  estimated_preparation_time_minutes: number;
  allow_scheduled_pickups: boolean;
  just_eat_url: string | null;
  deliveroo_url: string | null;
  opening_hours: string;
  created_at: string;
  updated_at: string;
}

interface Product {
  product_id: string;
  product_name: string;
  short_description: string;
  long_description: string | null;
  category: string;
  price: number;
  compare_at_price: number | null;
  primary_image_url: string;
  additional_images: string | null;
  availability_status: string;
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

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchGlasnevinLocation = async (): Promise<Location | null> => {
  const response = await axios.get<Location[]>(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/locations`
  );
  
  // Find Glasnevin location from the array
  const glasnevin = response.data.find(
    (loc) => loc.location_name.toLowerCase() === 'glasnevin'
  );
  
  return glasnevin || null;
};

const fetchGlasnevinMenu = async (): Promise<Product[]> => {
  // First get Glasnevin location to filter products
  const response = await axios.get<{ data: Product[]; total: number }>(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/products`,
    {
      params: {
        location_name: 'glasnevin',
        is_archived: false,
        limit: 50,
        hide_out_of_stock: false,
      },
    }
  );
  
  return response.data.data || [];
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_LocationExternal: React.FC = () => {
  const [showMenu, setShowMenu] = React.useState(false);

  // Fetch Glasnevin location details
  const {
    data: glasnevin_location,
    isLoading: location_loading,
    isError: location_error,
  } = useQuery<Location | null>({
    queryKey: ['location', 'glasnevin'],
    queryFn: fetchGlasnevinLocation,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });

  // Fetch Glasnevin menu (optional - only if user wants to see it)
  const {
    data: glasnevin_menu,
    isLoading: menu_loading,
  } = useQuery<Product[]>({
    queryKey: ['products', 'glasnevin'],
    queryFn: fetchGlasnevinMenu,
    enabled: showMenu, // Only fetch when user toggles menu visibility
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Parse dietary tags helper
  const parseDietaryTags = (tags: string | null): string[] => {
    if (!tags) return [];
    return tags.split(',').map(tag => tag.trim());
  };

  // Open external URL in new tab
  const openExternalOrdering = (url: string | null, platform: string) => {
    if (!url) {
      alert(`${platform} URL not configured. Please contact us for ordering options.`);
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Loading state
  if (location_loading) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading location details...</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (location_error || !glasnevin_location) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Location Not Found</h2>
            <p className="text-gray-600 mb-6">
              We couldn't load the Glasnevin location details. Please try again later.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-all duration-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </>
    );
  }

  const external_urls = {
    just_eat_url: glasnevin_location.just_eat_url,
    deliveroo_url: glasnevin_location.deliveroo_url,
  };

  return (
    <>
      {/* Hero Section - Location Header */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              Kake Glasnevin
            </h1>
            <p className="text-xl sm:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Order our delicious desserts through our delivery partners
            </p>
            
            {/* Location Details */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto border border-white/20">
              <div className="grid sm:grid-cols-2 gap-4 text-left">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-purple-200 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-purple-200 font-medium mb-1">Address</p>
                    <p className="text-white">
                      {glasnevin_location.address_line1}
                      {glasnevin_location.address_line2 && (
                        <>, {glasnevin_location.address_line2}</>
                      )}
                    </p>
                    <p className="text-white">
                      {glasnevin_location.city}, {glasnevin_location.postal_code}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-purple-200 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-purple-200 font-medium mb-1">Contact</p>
                    <a
                      href={`tel:${glasnevin_location.phone_number}`}
                      className="text-white hover:text-purple-100 transition-colors block"
                    >
                      {glasnevin_location.phone_number}
                    </a>
                    <a
                      href={`mailto:${glasnevin_location.email}`}
                      className="text-white hover:text-purple-100 transition-colors block"
                    >
                      {glasnevin_location.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* External Ordering Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Order Online Now
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose your preferred delivery platform to order from Kake Glasnevin. 
              Both platforms offer quick delivery and easy ordering.
            </p>
          </div>

          {/* External Platform Buttons */}
          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            {/* Just Eat Button */}
            {external_urls.just_eat_url ? (
              <button
                onClick={() => openExternalOrdering(external_urls.just_eat_url, 'Just Eat')}
                className="group relative bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative p-8 flex items-center justify-center space-x-4">
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-orange-100 mb-1">Order on</p>
                    <p className="text-2xl font-bold">Just Eat</p>
                  </div>
                  <ExternalLink className="w-6 h-6 text-orange-200 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ) : (
              <div className="bg-gray-100 text-gray-400 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
                <p className="text-sm font-medium">Just Eat</p>
                <p className="text-xs mt-1">Not available</p>
              </div>
            )}

            {/* Deliveroo Button */}
            {external_urls.deliveroo_url ? (
              <button
                onClick={() => openExternalOrdering(external_urls.deliveroo_url, 'Deliveroo')}
                className="group relative bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative p-8 flex items-center justify-center space-x-4">
                  <div className="text-left flex-1">
                    <p className="text-sm font-medium text-teal-100 mb-1">Order on</p>
                    <p className="text-2xl font-bold">Deliveroo</p>
                  </div>
                  <ExternalLink className="w-6 h-6 text-teal-200 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ) : (
              <div className="bg-gray-100 text-gray-400 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
                <p className="text-sm font-medium">Deliveroo</p>
                <p className="text-xs mt-1">Not available</p>
              </div>
            )}
          </div>

          {/* Info Notice */}
          {!external_urls.just_eat_url && !external_urls.deliveroo_url && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800 font-medium mb-2">
                External ordering currently unavailable
              </p>
              <p className="text-yellow-700 text-sm">
                Please contact us directly at{' '}
                <a
                  href={`tel:${glasnevin_location.phone_number}`}
                  className="underline hover:text-yellow-900"
                >
                  {glasnevin_location.phone_number}
                </a>{' '}
                to place an order.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Browse Menu Section */}
      <div className="bg-gray-50 py-16 sm:py-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Toggle Menu Button */}
          <div className="text-center mb-8">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium text-lg transition-colors"
            >
              <span>{showMenu ? 'Hide Menu' : 'Browse Our Menu'}</span>
              {showMenu ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            {!showMenu && (
              <p className="text-sm text-gray-500 mt-2">
                View our available desserts before ordering
              </p>
            )}
          </div>

          {/* Menu Display */}
          {showMenu && (
            <div className="mt-8">
              {menu_loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading menu...</p>
                </div>
              ) : glasnevin_menu && glasnevin_menu.length > 0 ? (
                <>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-8 text-center">
                    <p className="text-purple-800 font-medium text-sm sm:text-base">
                      <strong>Menu Preview Only</strong> - To order, please use Just Eat or Deliveroo buttons above
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {glasnevin_menu.map((product) => {
                      const dietary_tags = parseDietaryTags(product.dietary_tags);
                      
                      return (
                        <div
                          key={product.product_id}
                          className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                        >
                          {/* Product Image */}
                          <div className="relative h-48 bg-gray-200 overflow-hidden">
                            <img
                              src={product.primary_image_url}
                              alt={product.product_name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {product.availability_status !== 'in_stock' && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                                  Out of Stock
                                </span>
                              </div>
                            )}
                            {product.is_featured && product.availability_status === 'in_stock' && (
                              <div className="absolute top-3 left-3">
                                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                  Featured
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                              {product.product_name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {product.short_description}
                            </p>

                            {/* Dietary Tags */}
                            {dietary_tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {dietary_tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Price */}
                            <div className="flex items-baseline space-x-2">
                              <span className="text-2xl font-bold text-purple-600">
                                €{Number(product.price || 0).toFixed(2)}
                              </span>
                              {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
                                <span className="text-sm text-gray-400 line-through">
                                  €{Number(product.compare_at_price).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                  <p className="text-gray-500">No menu items available at the moment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Other Locations CTA */}
      <div className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Looking for Collection or Direct Delivery?
          </h3>
          <p className="text-gray-600 mb-8 text-lg">
            Visit our Blanchardstown or Tallaght locations for collection and delivery options
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            View All Locations
          </Link>
        </div>
      </div>

      {/* Why Order Through Partners Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Why Order Through Our Partners?
          </h3>
          
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Fast Delivery</h4>
              <p className="text-gray-600 text-sm">
                Quick and reliable delivery straight to your door
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Secure Payment</h4>
              <p className="text-gray-600 text-sm">
                Safe and secure payment processing through trusted platforms
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Order Tracking</h4>
              <p className="text-gray-600 text-sm">
                Track your order in real-time from kitchen to your doorstep
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-8 text-center">
            <h4 className="text-xl font-bold text-gray-900 mb-3">
              Need Help with Your Order?
            </h4>
            <p className="text-gray-700 mb-6">
              Have questions or need assistance? We're here to help!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`tel:${glasnevin_location.phone_number}`}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <Phone className="w-5 h-5" />
                <span>Call Us</span>
              </a>
              <a
                href={`mailto:${glasnevin_location.email}`}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-50 transition-all duration-200 border-2 border-purple-600 font-medium"
              >
                <Mail className="w-5 h-5" />
                <span>Email Us</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Home Link */}
      <div className="bg-gray-50 py-8 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-purple-600 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Locations
          </Link>
        </div>
      </div>
    </>
  );
};

export default UV_LocationExternal;