import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { motion } from 'framer-motion';
import kakeWatermarkLogo from '@/assets/images/kake-watermark-logo.png';

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

  // Helper function to convert location name to URL slug
  // This MUST match the same logic in UV_LocationInternal and UV_Menu
  const nameToSlug = (name: string): string => {
    return name.toLowerCase().trim().replace(/\s+/g, '-');
  };

  // Helper function to get location description based on available services
  const getLocationDescription = (location: Location): string => {
    if (location.is_collection_enabled && location.is_delivery_enabled) {
      return 'Collection & Delivery available';
    } else if (location.is_collection_enabled) {
      return 'Collection available';
    } else if (location.is_delivery_enabled) {
      return 'Delivery available';
    } else if (location.just_eat_url || location.deliveroo_url) {
      return 'Order via Just Eat & Deliveroo';
    } else {
      return 'Coming soon';
    }
  };

  // Default images for location cards (cycle through these for variety)
  const defaultLocationImages = [
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
    'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&q=80',
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
  ];

  // Dynamically generate location card data from database locations
  // This ensures the UI always matches what's in the database
  const location_card_data = locations.map((location, index) => ({
    name: location.location_name,
    slug: nameToSlug(location.location_name),
    image: defaultLocationImages[index % defaultLocationImages.length],
    description: getLocationDescription(location),
    imageAlt: `${location.location_name} storefront - ${getLocationDescription(location)}`,
    location: location, // Include the full location object for easy access
  }));

  return (
    <>
      {/* Hero Section - Mobile-First with Enhanced Spacing */}
      <section className="relative bg-kake-cream-50 py-12 sm:py-16 md:py-24 lg:py-32 overflow-hidden">
        {/* Watermark overlay with fade-in animation */}
        <div 
          className="absolute inset-0 opacity-0 animate-watermark-fade-in"
          style={{
            backgroundImage: `url(${kakeWatermarkLogo})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            backgroundSize: '80%',
            pointerEvents: 'none',
            opacity: 0.05,
          }}
        />
        
        <div className="relative container-mobile max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto">
            {/* Card Container with glassmorphism and enhanced spacing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="glass-cream rounded-3xl p-6 sm:p-8 md:p-12 lg:p-16 shadow-soft-lg"
            >
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-kake-chocolate-500 mb-4 sm:mb-6 lg:mb-8 leading-tight text-center">
                Indulge in Dublin's Finest
                <span className="block text-kake-caramel-500 mt-2 sm:mt-3">
                  Artisan Desserts
                </span>
              </h1>
              
              <p className="font-sans text-base sm:text-lg md:text-xl text-kake-chocolate-500/90 mb-6 sm:mb-8 lg:mb-10 max-w-2xl mx-auto leading-relaxed text-center px-2">
                Handcrafted treats made fresh daily across three Dublin locations. 
                From classic pastries to celebration cakes, we bring joy to every bite.
              </p>
              
              <div className="text-center">
                <motion.a
                  href="#locations"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block gradient-caramel text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 touch-target rounded-2xl shadow-caramel hover:shadow-caramel-lg transition-all duration-300 glow-on-hover font-sans text-base sm:text-lg"
                >
                  Choose Your Location
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Wave Divider - Liquid Gold drip effect */}
      <div className="relative -mt-1">
        <svg 
          className="w-full h-12 md:h-16 lg:h-20" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,0 C150,60 350,60 600,30 C850,0 1050,0 1200,30 L1200,120 L0,120 Z" 
                fill="#D4AF37" opacity="0.2"/>
          <path d="M0,20 C200,80 400,80 600,50 C800,20 1000,20 1200,50 L1200,120 L0,120 Z" 
                fill="#D4AF37" opacity="0.15"/>
          <path d="M0,40 C250,100 450,100 600,70 C750,40 950,40 1200,70 L1200,120 L0,120 Z"
                fill="#121212"/>
        </svg>
      </div>

      {/* Location Selection Section - Mobile-First Grid */}
      <section id="locations" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-kake-cream-100">
        <div className="container-mobile max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-kake-chocolate-500 mb-3 sm:mb-4"
            >
              Our Locations
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-sans text-base sm:text-lg md:text-xl text-kake-chocolate-500/80 max-w-2xl mx-auto px-4"
            >
              Choose your nearest Kake location to start ordering
            </motion.p>
          </div>

          {/* Loading State - Mobile-First Grid (1 column mobile, 2 tablet, 3 desktop) */}
          {locations_loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8" role="status" aria-live="polite" aria-label="Loading locations">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-cream rounded-2xl shadow-soft overflow-hidden animate-pulse">
                  <div className="h-48 sm:h-56 bg-gradient-to-br from-kake-cream-200 to-kake-cream-300"></div>
                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="h-6 bg-kake-caramel-500/20 rounded w-3/4"></div>
                    <div className="h-4 bg-kake-caramel-500/10 rounded w-full"></div>
                    <div className="h-4 bg-kake-caramel-500/10 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {locations_error && (
            <div className="glass-cream border-2 border-red-500/50 rounded-2xl p-6 sm:p-8 text-center shadow-caramel">
              <p className="text-red-500 font-medium text-base sm:text-lg">Unable to load locations. Please refresh the page.</p>
            </div>
          )}

          {/* Location Cards - Mobile-First Grid with Micro-Interactions */}
          {!locations_loading && !locations_error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {location_card_data.map((card, index) => (
                <motion.div
                  key={card.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  <Link
                    to={`/location/${card.slug}`}
                    onClick={() => {
                      console.log('Location card clicked:', {
                        cardName: card.name,
                        cardSlug: card.slug,
                        locationFound: true,
                        locationName: card.location.location_name,
                        navigatingTo: `/location/${card.slug}`
                      });
                      setCurrentLocation(card.location.location_name);
                      setLocationDetails(card.location);
                    }}
                    className="block group glass-cream rounded-2xl shadow-soft border border-kake-caramel-500/20 overflow-hidden hover:shadow-caramel-lg hover:border-kake-caramel-500 transition-all duration-300 tap-scale glow-on-hover"
                  >
                  {/* Card Image */}
                  <div className="relative h-48 sm:h-56 overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.imageAlt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-kake-cream-100/90 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-serif text-2xl font-bold text-kake-chocolate-500 mb-1 group-hover:text-kake-caramel-500 transition-colors duration-300">
                        {card.name}
                      </h3>
                    </div>
                  </div>

                  {/* Card Content - Enhanced Spacing */}
                  <div className="p-5 sm:p-6 lg:p-7">
                    <p className="text-kake-chocolate-500/80 mb-4 sm:mb-5 flex items-center font-sans text-sm sm:text-base">
                      <svg className="w-5 h-5 mr-2 flex-shrink-0 text-kake-caramel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {card.description}
                    </p>

                    <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-kake-chocolate-500/70 font-sans mb-5 sm:mb-6">
                      <p className="flex items-start">
                        <svg className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0 text-kake-caramel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {card.location.address_line1}, {card.location.city}
                      </p>
                      <p className="flex items-center">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0 text-kake-caramel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {card.location.phone_number}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-kake-caramel-500 font-semibold font-sans group-hover:text-kake-caramel-400 touch-target text-sm sm:text-base">
                      <span>Start Ordering</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Corporate & Events Section - Enhanced Spacing */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-kake-cream-50">
        <div className="container-mobile max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-kake-chocolate-500 mb-3 sm:mb-4"
            >
              Corporate & Event Orders
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-sans text-base sm:text-lg md:text-xl text-kake-chocolate-500/80 max-w-2xl mx-auto px-4"
            >
              Make your special occasions unforgettable with our bespoke dessert offerings
            </motion.p>
          </div>

          {/* Loading State for Drop */}
          {drop_loading && (
            <div className="bg-white/80 rounded-xl shadow-soft overflow-hidden animate-pulse" role="status" aria-live="polite" aria-label="Loading drop of the month">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="h-80 md:h-full bg-gradient-to-br from-kake-cream-200 to-kake-cream-300"></div>
                <div className="p-8 lg:p-12 space-y-4">
                  <div className="h-10 bg-kake-caramel-500/20 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-kake-caramel-500/10 rounded w-full"></div>
                    <div className="h-4 bg-kake-caramel-500/10 rounded w-5/6"></div>
                    <div className="h-4 bg-kake-caramel-500/10 rounded w-2/3"></div>
                  </div>
                  <div className="h-20 bg-kake-caramel-500/10 rounded"></div>
                  <div className="h-12 bg-kake-caramel-500/20 rounded w-48"></div>
                </div>
              </div>
            </div>
          )}

          {/* Drop of the Month Featured Display - Mobile-First */}
          {!drop_loading && active_drop && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-cream rounded-2xl shadow-soft-lg overflow-hidden border border-kake-caramel-500/20 hover:border-kake-caramel-500 hover:shadow-caramel-lg transition-all duration-300"
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image */}
                <div className="relative h-64 sm:h-80 md:h-full">
                  <img
                    src={active_drop.product_image_url}
                    alt={active_drop.product_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 gradient-caramel text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold shadow-caramel font-sans text-xs sm:text-sm">
                    Drop of the Month
                  </div>
                </div>

                {/* Content - Enhanced Spacing */}
                <div className="p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
                  <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-kake-chocolate-500 mb-3 sm:mb-4">
                    {active_drop.product_name}
                  </h3>
                  
                  <p className="font-sans text-base sm:text-lg text-kake-chocolate-500/80 mb-5 sm:mb-6 leading-relaxed">
                    {active_drop.description}
                  </p>

                  <div className="glass-cream border border-kake-caramel-500/20 rounded-xl p-4 sm:p-5 mb-5 sm:mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-sans text-sm text-kake-caramel-500 font-medium mb-1">Special Price</p>
                        <p className="font-serif text-3xl font-bold text-kake-chocolate-500">
                          €{Number(active_drop.price).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-sans text-sm text-kake-caramel-500 font-medium mb-1">Available Until</p>
                        <p className="font-sans text-lg font-semibold text-kake-chocolate-500">
                          {new Date(active_drop.available_until).toLocaleDateString('en-IE', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/corporate-order"
                      className="inline-flex items-center justify-center gradient-caramel text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 touch-target rounded-2xl shadow-caramel hover:shadow-caramel-lg transition-all duration-300 glow-on-hover font-sans text-base sm:text-lg w-full sm:w-auto"
                    >
                      Pre-order Now
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Generic Corporate Enquiry (when no active drop) - Mobile-First */}
          {!drop_loading && !active_drop && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-cream rounded-2xl shadow-soft-lg p-6 sm:p-8 lg:p-12 text-center border border-kake-caramel-500/20 hover:border-kake-caramel-500 hover:shadow-caramel-lg transition-all duration-300"
            >
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <svg className="w-20 h-20 mx-auto text-kake-caramel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                  </svg>
                </div>
                
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-kake-chocolate-500 mb-3 sm:mb-4">
                  Corporate & Event Catering
                </h3>
                
                <p className="font-sans text-base sm:text-lg text-kake-chocolate-500/80 mb-6 sm:mb-8 leading-relaxed px-2">
                  Elevate your corporate events, celebrations, and special occasions with our custom dessert solutions. 
                  From intimate meetings to large gatherings, we create memorable sweet moments.
                </p>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/corporate-order"
                    className="inline-flex items-center justify-center gradient-caramel text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 touch-target rounded-2xl shadow-caramel hover:shadow-caramel-lg transition-all duration-300 glow-on-hover font-sans text-base sm:text-lg"
                  >
                    Enquire About Corporate Orders
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Stall/Pop-up Event Section (Conditionally Rendered) */}
      {show_event_section && active_event && (
        <section className="py-16 lg:py-24 bg-kake-cream-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Loading State */}
            {event_loading && (
              <div className="bg-white/80 rounded-xl shadow-soft overflow-hidden border-2 border-kake-caramel-500/30 animate-pulse" role="status" aria-live="polite" aria-label="Loading event details">
                <div className="gradient-caramel px-6 py-3 h-12"></div>
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="h-64 md:h-full bg-gradient-to-br from-kake-cream-200 to-kake-cream-300"></div>
                  <div className="p-8 lg:p-12 space-y-4">
                    <div className="h-8 bg-kake-caramel-500/20 rounded w-3/4"></div>
                    <div className="space-y-3">
                      <div className="h-6 bg-kake-caramel-500/10 rounded w-full"></div>
                      <div className="h-6 bg-kake-caramel-500/10 rounded w-5/6"></div>
                      <div className="h-6 bg-kake-caramel-500/10 rounded w-4/6"></div>
                    </div>
                    <div className="h-4 bg-kake-caramel-500/10 rounded w-full"></div>
                    <div className="h-12 bg-gray-200 rounded w-48"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Event Content */}
            {!event_loading && (
              <div className="bg-white/80 rounded-xl shadow-soft-lg overflow-hidden border-2 border-kake-caramel-500/50 hover:border-kake-caramel-500 hover:shadow-caramel-lg transition-all duration-300">
                <div className="gradient-caramel px-6 py-3">
                  <p className="text-white font-bold text-lg text-center font-sans">
                    Special Event Alert!
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
                    <h3 className="font-serif text-3xl font-bold text-kake-chocolate-500 mb-4">
                      {active_event.event_name}
                    </h3>

                    <div className="space-y-3 mb-6 font-sans">
                      <div className="flex items-center text-kake-chocolate-500/80">
                        <svg className="w-5 h-5 mr-3 text-kake-caramel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="font-medium">{active_event.venue_location}</span>
                      </div>

                      <div className="flex items-center text-kake-chocolate-500/80">
                        <svg className="w-5 h-5 mr-3 text-kake-caramel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                      <div className="flex items-center text-kake-chocolate-500/80">
                        <svg className="w-5 h-5 mr-3 text-kake-caramel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{active_event.event_time}</span>
                      </div>
                    </div>

                    {active_event.description && (
                      <p className="font-sans text-kake-chocolate-500/80 mb-6 leading-relaxed">
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
                            className="inline-flex items-center justify-center gradient-caramel text-white font-semibold px-8 py-4 min-h-[48px] rounded-xl shadow-caramel hover:shadow-caramel-lg transition-all duration-300 transform hover:scale-105 font-sans"
                          >
                            {active_event.cta_button_text}
                            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <Link
                            to={active_event.cta_button_url}
                            className="inline-flex items-center justify-center gradient-caramel text-white font-semibold px-8 py-4 min-h-[48px] rounded-xl shadow-caramel hover:shadow-caramel-lg transition-all duration-300 transform hover:scale-105 font-sans"
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

      {/* Why Choose Kake Section - Mobile-First */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="container-mobile max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-kake-chocolate-500 mb-3 sm:mb-4"
            >
              Why Choose Kake?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-sans text-base sm:text-lg md:text-xl text-kake-chocolate-500/80 max-w-2xl mx-auto px-4"
            >
              Indulge in quality, freshness, and convenience
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
              className="text-center p-4 sm:p-6"
            >
              <div className="bg-kake-cream-200 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-5">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-kake-chocolate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-kake-chocolate-500 mb-2 sm:mb-3">Quality Ingredients</h3>
              <p className="font-sans text-sm sm:text-base text-kake-chocolate-500/70 leading-relaxed">
                We use only the finest ingredients to create our handcrafted desserts daily
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center p-4 sm:p-6"
            >
              <div className="bg-kake-cream-200 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-5">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-kake-chocolate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-kake-chocolate-500 mb-2 sm:mb-3">Made Fresh Daily</h3>
              <p className="font-sans text-sm sm:text-base text-kake-chocolate-500/70 leading-relaxed">
                Every order is prepared fresh to ensure maximum flavor and quality
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center p-4 sm:p-6"
            >
              <div className="bg-kake-cream-200 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-5">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-kake-chocolate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-kake-chocolate-500 mb-2 sm:mb-3">Flexible Ordering</h3>
              <p className="font-sans text-sm sm:text-base text-kake-chocolate-500/70 leading-relaxed">
                Collection or delivery options available at all our Dublin locations
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Mobile-First */}
      <section className="py-12 sm:py-16 lg:py-20 gradient-chocolate">
        <div className="container-mobile max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-kake-lightCream-100 mb-4 sm:mb-6"
          >
            Ready to Order?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-sans text-base sm:text-lg md:text-xl text-kake-cream-200 mb-6 sm:mb-8 leading-relaxed px-4"
          >
            Choose your location and start building your perfect dessert order today
          </motion.p>
          <motion.a
            href="#locations"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block bg-kake-lightCream-100 text-kake-chocolate-500 hover:bg-kake-cream-200 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 touch-target glow-on-hover font-sans text-base sm:text-lg"
          >
            Browse Our Locations
          </motion.a>
        </div>
      </section>
    </>
  );
};

export default UV_Landing;