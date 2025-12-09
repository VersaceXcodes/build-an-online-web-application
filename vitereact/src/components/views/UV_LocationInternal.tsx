import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { MapPin, Phone, Mail, Clock, Package, Truck, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store/main';

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
  opening_hours: string; // JSON string
  created_at: string;
  updated_at: string;
}

interface OpeningHours {
  [day: string]: {
    open: string;
    close: string;
  };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchLocations = async (): Promise<Location[]> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/locations`
  );
  
  // Transform numeric fields from strings to numbers
  return response.data.map((loc: any) => ({
    ...loc,
    delivery_radius_km: loc.delivery_radius_km ? Number(loc.delivery_radius_km) : null,
    delivery_fee: loc.delivery_fee ? Number(loc.delivery_fee) : null,
    free_delivery_threshold: loc.free_delivery_threshold ? Number(loc.free_delivery_threshold) : null,
    estimated_delivery_time_minutes: loc.estimated_delivery_time_minutes ? Number(loc.estimated_delivery_time_minutes) : null,
    estimated_preparation_time_minutes: Number(loc.estimated_preparation_time_minutes || 20),
  }));
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const parseOpeningHours = (opening_hours_json: string): OpeningHours | null => {
  try {
    return JSON.parse(opening_hours_json);
  } catch (error) {
    console.error('Failed to parse opening hours:', error);
    return null;
  }
};

const formatDayName = (day: string): string => {
  return day.charAt(0).toUpperCase() + day.slice(1);
};

const getTodayDay = (): string => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_LocationInternal: React.FC = () => {
  const { location_name } = useParams<{ location_name: string }>();
  const navigate = useNavigate();
  
  // Global state access - CRITICAL: Individual selectors only
  const setCurrentLocation = useAppStore(state => state.set_current_location);
  const setCartLocation = useAppStore(state => state.set_cart_location);
  const setFulfillmentMethod = useAppStore(state => state.set_fulfillment_method);
  const setLocationDetails = useAppStore(state => state.set_location_details);
  
  // Fetch locations using react-query
  const { 
    data: locations, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
    staleTime: 60000, // Cache for 1 minute
    retry: 1,
  });
  
  // Find matching location from fetched data
  const location_details = useMemo(() => {
    if (!locations || !location_name) return null;
    return locations.find(
      loc => loc.location_name.toLowerCase() === location_name.toLowerCase()
    ) || null;
  }, [locations, location_name]);
  
  // Parse opening hours
  const opening_hours_parsed = useMemo(() => {
    if (!location_details?.opening_hours) return null;
    return parseOpeningHours(location_details.opening_hours);
  }, [location_details]);
  
  // Get today's hours for quick display
  const todays_hours = useMemo(() => {
    if (!opening_hours_parsed) return null;
    const today = getTodayDay();
    return opening_hours_parsed[today] || null;
  }, [opening_hours_parsed]);
  
  // Handle fulfillment method selection
  const handleSelectFulfillment = (method: 'collection' | 'delivery') => {
    if (!location_details) return;
    
    // Validate method is enabled for this location
    if (method === 'collection' && !location_details.is_collection_enabled) {
      return;
    }
    if (method === 'delivery' && !location_details.is_delivery_enabled) {
      return;
    }
    
    // Update global state
    setCurrentLocation(location_details.location_name);
    setCartLocation(location_details.location_name);
    setFulfillmentMethod(method);
    setLocationDetails(location_details);
    
    // Navigate to menu with fulfillment parameter
    navigate(`/location/${location_name}/menu?fulfillment=${method}`);
  };
  
  // ============================================================================
  // LOADING STATE
  // ============================================================================
  
  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          {/* Loading skeleton */}
          <div className="relative h-64 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="space-y-8">
              {/* Info panel skeleton */}
              <div className="bg-white rounded-xl shadow-lg p-8 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
              
              {/* Cards skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64 bg-white rounded-xl shadow-lg animate-pulse"></div>
                <div className="h-64 bg-white rounded-xl shadow-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  // ============================================================================
  // ERROR STATE
  // ============================================================================
  
  if (error || !location_details) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <MapPin className="h-8 w-8 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Location Not Found
              </h2>
              
              <p className="text-gray-600 mb-6">
                Sorry, we couldn't find the location you're looking for.
              </p>
              
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <>
      {/* Hero Section with Location Name */}
      <div className="relative h-64 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {location_details.location_name}
            </h1>
            <p className="text-xl text-white/90 font-medium">
              Choose your ordering preference
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link to="/" className="text-gray-500 hover:text-gray-700 transition-colors">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">
              {location_details.location_name}
            </li>
          </ol>
        </nav>
        
        {/* Location Information Panel */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-12">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Location Details
            </h2>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Address */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {location_details.address_line1}
                      {location_details.address_line2 && (
                        <>
                          <br />
                          {location_details.address_line2}
                        </>
                      )}
                      <br />
                      {location_details.city} {location_details.postal_code}
                    </p>
                  </div>
                </div>
                
                {/* Phone */}
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                    <a
                      href={`tel:${location_details.phone_number}`}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {location_details.phone_number}
                    </a>
                  </div>
                </div>
                
                {/* Email */}
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a
                      href={`mailto:${location_details.email}`}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {location_details.email}
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Opening Hours */}
              <div>
                <div className="flex items-start space-x-3 mb-4">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-3">Opening Hours</h3>
                    
                    {todays_hours && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-3">
                        <p className="text-sm font-medium text-blue-900">
                          Today: {todays_hours.open} - {todays_hours.close}
                        </p>
                      </div>
                    )}
                    
                    {opening_hours_parsed && (
                      <div className="space-y-2">
                        {Object.entries(opening_hours_parsed).map(([day, hours]) => (
                          <div
                            key={day}
                            className={`flex justify-between text-sm ${
                              day === getTodayDay()
                                ? 'font-semibold text-gray-900'
                                : 'text-gray-600'
                            }`}
                          >
                            <span className="capitalize">{formatDayName(day)}</span>
                            <span>{hours.open} - {hours.close}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Fulfillment Method Selection */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            How would you like to receive your order?
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Choose your preferred fulfillment method to continue
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Collection Card */}
            {location_details.is_collection_enabled && (
              <button
                onClick={() => handleSelectFulfillment('collection')}
                className="group bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-200 p-8 text-left focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                      <Package className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        Collection
                      </h3>
                      <p className="text-gray-600">
                        Pick up in-store
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-700">
                    <Clock className="h-5 w-5 mr-2 text-gray-400" />
                    <span className="font-medium">
                      Ready in {location_details.estimated_preparation_time_minutes} minutes
                    </span>
                  </div>
                  
                  <div className="flex items-center text-green-600 font-semibold">
                    <span className="text-lg">FREE</span>
                    <span className="ml-2 text-sm text-gray-500">No delivery fee</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Order now and collect from our {location_details.location_name} location
                  </p>
                </div>
              </button>
            )}
            
            {/* Delivery Card */}
            {location_details.is_delivery_enabled && (
              <button
                onClick={() => handleSelectFulfillment('delivery')}
                className="group bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-200 p-8 text-left focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                      <Truck className="h-7 w-7 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        Delivery
                      </h3>
                      <p className="text-gray-600">
                        To your door
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-700">
                    <Clock className="h-5 w-5 mr-2 text-gray-400" />
                    <span className="font-medium">
                      Delivered in {
                        (location_details.estimated_preparation_time_minutes || 0) + 
                        (location_details.estimated_delivery_time_minutes || 0)
                      } minutes
                    </span>
                  </div>
                  
                  {location_details.delivery_fee !== null && (
                    <div className="space-y-1">
                      <div className="flex items-center text-gray-700">
                        <span className="font-medium">
                          Delivery fee: €{Number(location_details.delivery_fee || 0).toFixed(2)}
                        </span>
                      </div>
                      {location_details.free_delivery_threshold && (
                        <p className="text-sm text-green-600 font-medium">
                          FREE delivery over €{Number(location_details.free_delivery_threshold).toFixed(2)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    We deliver within {location_details.delivery_radius_km || 10}km of {location_details.location_name}
                  </p>
                </div>
              </button>
            )}
            
            {/* Show message if neither method is enabled */}
            {!location_details.is_collection_enabled && !location_details.is_delivery_enabled && (
              <div className="col-span-full bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <p className="text-yellow-800 font-medium">
                  Ordering is currently unavailable at this location.
                </p>
                <Link
                  to="/"
                  className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Choose another location →
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Additional Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            What happens next?
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                1
              </span>
              <span>Browse our delicious menu and add items to your cart</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                2
              </span>
              <span>Review your order and proceed to checkout</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                3
              </span>
              <span>
                {location_details.is_collection_enabled && location_details.is_delivery_enabled
                  ? "We'll prepare your order for collection or delivery"
                  : location_details.is_collection_enabled
                  ? "We'll prepare your order for collection"
                  : "We'll deliver your order to your door"}
              </span>
            </li>
          </ul>
        </div>
        
        {/* Back to Locations Link */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
            Back to all locations
          </Link>
        </div>
      </div>
    </>
  );
};

export default UV_LocationInternal;