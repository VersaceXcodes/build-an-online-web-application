import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
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
  opening_hours: string;
  created_at: string;
  updated_at: string;
}

interface DropOfTheMonth {
  drop_id: string;
  product_name: string;
  description: string;
  price: number;
  product_image_url: string;
  available_from: string;
  available_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface StallEvent {
  event_id: string;
  event_name: string;
  venue_location: string;
  event_date: string;
  event_time: string;
  description: string | null;
  event_image_url: string | null;
  cta_button_text: string | null;
  cta_button_action: string | null;
  cta_button_url: string | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchLocations = async (): Promise<Location[]> => {
  const response = await axios.get<Location[]>(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/locations`
  );
  return response.data;
};

const fetchDropOfTheMonth = async (): Promise<DropOfTheMonth | null> => {
  try {
    const response = await axios.get<DropOfTheMonth>(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/drop-of-the-month`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // No active drop
    }
    throw error;
  }
};

const fetchStallEvent = async (): Promise<StallEvent | null> => {
  const response = await axios.get<StallEvent[]>(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/stall-events?is_visible=true`
  );
  return response.data && response.data.length > 0 ? response.data[0] : null;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_Landing: React.FC = () => {
  // Access global state - CRITICAL: Individual selectors only
  const setCurrentLocation = useAppStore(state => state.set_current_location);
  const setLocationDetails = useAppStore(state => state.set_location_details);

  // Fetch locations using React Query
  const {
    data: locations = [],
    isLoading: locations_loading,
    error: locations_error,
  } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });

  // Fetch Drop of the Month
  const {
    data: active_drop,
    isLoading: drop_loading,
  } = useQuery({
    queryKey: ['drop-of-the-month'],
    queryFn: fetchDropOfTheMonth,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Fetch Stall Event
  const {
    data: active_event,
    isLoading: event_loading,
  } = useQuery({
    queryKey: ['stall-event'],
    queryFn: fetchStallEvent,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Derived state
  const show_event_section = active_event?.is_visible || false;

  // Location card data with images - mapped to actual database locations
  const location_card_data = [
    {
      name: 'London Flagship',
      slug: 'london-flagship',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
      description: 'Collection & Delivery available',
    },
    {
      name: 'Manchester Store',
      slug: 'manchester-store',
      image: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&q=80',
      description: 'Collection & Delivery available',
    },
    {
      name: 'Birmingham Store',
      slug: 'birmingham-store',
      image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
      description: 'Order via Just Eat & Deliveroo',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=1600&q=80')] opacity-10 bg-cover bg-center"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Indulge in Dublin's Finest
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mt-2">
                Artisan Desserts
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
              Handcrafted treats made fresh daily across three Dublin locations. 
              From classic pastries to celebration cakes, we bring joy to every bite.
            </p>
            
            <a
              href="#locations"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Choose Your Location
            </a>
          </div>
        </div>
      </section>

      {/* Location Selection Section */}
      <section id="locations" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Locations
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose your nearest Kake location to start ordering
            </p>
          </div>

          {/* Loading State */}
          {locations_loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-96 animate-pulse"></div>
              ))}
            </div>
          )}

          {/* Error State */}
          {locations_error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-700 font-medium">Unable to load locations. Please refresh the page.</p>
            </div>
          )}

          {/* Location Cards */}
          {!locations_loading && !locations_error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {location_card_data.map((card) => {
                // Match location by name (exact match)
                const location = locations.find(
                  (loc) => loc.location_name === card.name
                );

                return (
                  <Link
                    key={card.slug}
                    to={`/location/${card.slug}`}
                    onClick={() => {
                      if (location) {
                        setCurrentLocation(location.location_name);
                        setLocationDetails(location);
                      }
                    }}
                    className="group bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-200"
                  >
                    {/* Card Image */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={card.image}
                        alt={`${card.name} location`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {card.name}
                        </h3>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                      <p className="text-gray-600 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {card.description}
                      </p>

                      {location && (
                        <div className="space-y-2 text-sm text-gray-500">
                          <p className="flex items-start">
                            <svg className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            {location.address_line1}, {location.city}
                          </p>
                          <p className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {location.phone_number}
                          </p>
                        </div>
                      )}

                      <div className="mt-6 flex items-center justify-between text-purple-600 font-semibold group-hover:text-purple-700">
                        <span>Start Ordering</span>
                        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Corporate & Events Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Corporate & Event Orders
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Make your special occasions unforgettable with our bespoke dessert offerings
            </p>
          </div>

          {/* Loading State for Drop */}
          {drop_loading && (
            <div className="bg-white rounded-xl shadow-lg p-8 animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          )}

          {/* Drop of the Month Featured Display */}
          {!drop_loading && active_drop && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image */}
                <div className="relative h-80 md:h-full">
                  <img
                    src={active_drop.product_image_url}
                    alt={active_drop.product_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 bg-orange-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                    Drop of the Month
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    {active_drop.product_name}
                  </h3>
                  
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    {active_drop.description}
                  </p>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-700 font-medium mb-1">Special Price</p>
                        <p className="text-3xl font-bold text-purple-900">
                          €{Number(active_drop.price).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-purple-700 font-medium mb-1">Available Until</p>
                        <p className="text-lg font-semibold text-purple-900">
                          {new Date(active_drop.available_until).toLocaleDateString('en-IE', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/corporate-order"
                    className="inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    Pre-order Now
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Generic Corporate Enquiry (when no active drop) */}
          {!drop_loading && !active_drop && (
            <div className="bg-white rounded-xl shadow-lg p-8 lg:p-12 text-center border border-gray-100">
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <svg className="w-20 h-20 mx-auto text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                  </svg>
                </div>
                
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Corporate & Event Catering
                </h3>
                
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  Elevate your corporate events, celebrations, and special occasions with our custom dessert solutions. 
                  From intimate meetings to large gatherings, we create memorable sweet moments.
                </p>

                <Link
                  to="/corporate-order"
                  className="inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Enquire About Corporate Orders
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stall/Pop-up Event Section (Conditionally Rendered) */}
      {show_event_section && active_event && (
        <section className="py-16 lg:py-24 bg-gradient-to-br from-yellow-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Loading State */}
            {event_loading && (
              <div className="bg-white rounded-xl shadow-lg p-8 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-6"></div>
                <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            )}

            {/* Event Content */}
            {!event_loading && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-orange-300">
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3">
                  <p className="text-white font-bold text-lg text-center animate-pulse">
                    🎉 Special Event Alert!
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-0">
                  {/* Event Image (if available) */}
                  {active_event.event_image_url && (
                    <div className="relative h-64 md:h-full">
                      <img
                        src={active_event.event_image_url}
                        alt={active_event.event_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Event Details */}
                  <div className={`p-8 lg:p-12 ${!active_event.event_image_url ? 'md:col-span-2' : ''}`}>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      {active_event.event_name}
                    </h3>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="font-medium">{active_event.venue_location}</span>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">
                          {new Date(active_event.event_date).toLocaleDateString('en-IE', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{active_event.event_time}</span>
                      </div>
                    </div>

                    {active_event.description && (
                      <p className="text-gray-700 mb-6 leading-relaxed">
                        {active_event.description}
                      </p>
                    )}

                    {/* CTA Button (if configured) */}
                    {active_event.cta_button_text && active_event.cta_button_url && (
                      <>
                        {active_event.cta_button_action === 'external_link' ? (
                          <a
                            href={active_event.cta_button_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                          >
                            {active_event.cta_button_text}
                            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <Link
                            to={active_event.cta_button_url}
                            className="inline-flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                          >
                            {active_event.cta_button_text}
                            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Why Choose Kake Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Kake?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Indulge in quality, freshness, and convenience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Ingredients</h3>
              <p className="text-gray-600 leading-relaxed">
                We use only the finest ingredients to create our handcrafted desserts daily
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="bg-pink-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Made Fresh Daily</h3>
              <p className="text-gray-600 leading-relaxed">
                Every order is prepared fresh to ensure maximum flavor and quality
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Flexible Ordering</h3>
              <p className="text-gray-600 leading-relaxed">
                Collection or delivery options available at all our Dublin locations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Order?
          </h2>
          <p className="text-lg md:text-xl text-purple-100 mb-8 leading-relaxed">
            Choose your location and start building your perfect dessert order today
          </p>
          <a
            href="#locations"
            className="inline-block bg-white text-purple-600 hover:bg-gray-50 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            Browse Our Locations
          </a>
        </div>
      </section>
    </>
  );
};

export default UV_Landing;