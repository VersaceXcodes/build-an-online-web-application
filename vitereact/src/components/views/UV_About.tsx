import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { 
  Heart, 
  Users, 
  Award, 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail,
  Clock
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface Milestone {
  year: string;
  title: string;
  description: string;
}

interface Value {
  icon_name: string;
  value_name: string;
  description: string;
}

interface TeamMember {
  photo_url: string;
  name: string;
  role: string;
  bio: string;
}

interface PageContent {
  hero_image_url: string;
  page_title: string;
  story_content: string;
  milestones: Milestone[];
  values: Value[];
  team_members: TeamMember[];
}

interface Location {
  location_id: string;
  location_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postal_code: string;
  phone_number: string;
  email: string;
  opening_hours: string; // Legacy JSON field
  opening_hours_structured?: Array<{
    id: string;
    location_id: string;
    day_of_week: number;
    opens_at: string | null;
    closes_at: string | null;
    is_closed: boolean;
  }>;
  delivery_radius_km: number | null;
  delivery_fee: number | null;
  free_delivery_threshold: number | null;
  estimated_delivery_time_minutes: number | null;
  estimated_preparation_time_minutes: number;
  is_collection_enabled: boolean;
  is_delivery_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface LocationsResponse {
  data?: Location[];
  locations?: Location[];
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchAboutPageContent = async (): Promise<PageContent> => {
  const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api`;
  const response = await axios.get<PageContent>(`${API_BASE_URL}/about-page`);
  return response.data;
};

const fetchLocations = async (): Promise<Location[]> => {
  const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api`;
  const response = await axios.get<LocationsResponse>(`${API_BASE_URL}/locations`);
  
  // Handle both response formats (array or object with data/locations property)
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.data || response.data.locations || [];
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const parseOpeningHours = (opening_hours_json: string): Record<string, { open: string; close: string }> => {
  try {
    return JSON.parse(opening_hours_json);
  } catch (error) {
    console.error('Failed to parse opening hours:', error);
    return {};
  }
};

const getValueIcon = (icon_name: string) => {
  const icons: Record<string, React.ReactNode> = {
    quality: <Award className="w-8 h-8" />,
    community: <Users className="w-8 h-8" />,
    innovation: <Sparkles className="w-8 h-8" />,
    sustainability: <Heart className="w-8 h-8" />
  };
  return icons[icon_name] || <Award className="w-8 h-8" />;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_About: React.FC = () => {
  // Global state - CRITICAL: Individual selectors only
  const available_locations = useAppStore(state => state.location_state.available_locations);

  // Fetch about page content using React Query
  const {
    data: page_content,
    isLoading: content_loading,
    error: content_error
  } = useQuery<PageContent, Error>({
    queryKey: ['about-page-content'],
    queryFn: fetchAboutPageContent,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Fetch locations using React Query
  const {
    data: locations_data,
    isLoading: locations_loading,
    error: locations_error
  } = useQuery<Location[], Error>({
    queryKey: ['locations'],
    queryFn: fetchLocations,
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: available_locations.length === 0, // Only fetch if not in global state
    select: (data) => data.map(loc => ({
      ...loc,
      delivery_radius_km: loc.delivery_radius_km ? Number(loc.delivery_radius_km) : null,
      delivery_fee: loc.delivery_fee ? Number(loc.delivery_fee) : null,
      free_delivery_threshold: loc.free_delivery_threshold ? Number(loc.free_delivery_threshold) : null,
      estimated_delivery_time_minutes: loc.estimated_delivery_time_minutes ? Number(loc.estimated_delivery_time_minutes) : null,
      estimated_preparation_time_minutes: Number(loc.estimated_preparation_time_minutes || 20)
    }))
  });

  // Determine which locations to use
  const locations_for_visit = available_locations.length > 0 ? available_locations : (locations_data || []);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Show loading state
  if (content_loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-luxury-gold-500 mx-auto mb-4"></div>
          <p className="font-sans text-kake-chocolate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (content_error || !page_content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="font-sans text-red-600 mb-4">Failed to load about page content</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 min-h-[48px] gradient-gold text-luxury-darkCharcoal font-bold rounded-xl hover:shadow-glow-gold-lg transition-all duration-300 transform hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-luxury-darkCharcoal py-20 lg:py-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-5"
          style={{
            backgroundImage: `url(${page_content.hero_image_url})`,
          }}
        ></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="glass-luxury backdrop-blur-glass rounded-3xl p-8 md:p-12 lg:p-16 shadow-luxury-lg animate-fade-in">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-luxury-champagne mb-6 leading-tight text-center">
                {page_content.page_title}
              </h1>
              
              <p className="font-sans text-lg md:text-xl text-luxury-champagne/90 mb-8 max-w-2xl mx-auto leading-relaxed text-center">
                Handcrafted desserts made with love, served with pride
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-kake-chocolate-500 mb-4">
                The Kake Story
              </h2>
              <div className="w-24 h-1 bg-luxury-gold-500 mx-auto rounded-full"></div>
            </div>
            
            <div 
              className="prose prose-lg max-w-none text-kake-chocolate-400 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: page_content.story_content }}
            />
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 lg:py-24 bg-kake-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-kake-chocolate-500 mb-4">
              Our Journey
            </h2>
            <p className="font-sans text-xl text-kake-chocolate-400 max-w-2xl mx-auto">
              Every milestone marks a moment we're proud of
            </p>
          </div>

          <div className="relative">
            {/* Continuous vertical orange line */}
            <div className="absolute left-1/2 top-8 bottom-8 transform -translate-x-1/2 w-0.5 bg-kake-caramel-500 rounded-full"></div>

            <div className="space-y-12 lg:space-y-16">
              {page_content.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`relative flex flex-col lg:flex-row items-center ${
                    index % 2 === 0 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline dot with orange border and cream background */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-3 h-3 bg-kake-cream-50 rounded-full border-2 border-kake-caramel-500 shadow-md z-10"></div>

                  {/* Content card */}
                  <div className={`w-full lg:w-5/12 ${index % 2 === 0 ? 'lg:text-right lg:pr-12' : 'lg:pl-12'}`}>
                    <div className="bg-white rounded-xl shadow-lg p-8 border border-kake-cream-200 hover:shadow-xl transition-shadow duration-200">
                      <div className="inline-block px-4 py-2 gradient-caramel text-white font-bold text-lg rounded-lg mb-4">
                        {milestone.year}
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-kake-chocolate-500 mb-3">
                        {milestone.title}
                      </h3>
                      <p className="font-sans text-kake-chocolate-400 leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-kake-chocolate-500 mb-4">
              Our Values
            </h2>
            <p className="font-sans text-xl text-kake-chocolate-400 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {page_content.values.map((value, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-xl bg-kake-cream-50 border border-kake-cream-200 hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-luxury-gold-500 text-luxury-darkCharcoal rounded-full mb-6">
                  {getValueIcon(value.icon_name)}
                </div>
                <h3 className="font-serif text-xl font-bold text-kake-chocolate-500 mb-3">
                  {value.value_name}
                </h3>
                <p className="font-sans text-kake-chocolate-400 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      {page_content.team_members && page_content.team_members.length > 0 && (
        <section className="py-16 lg:py-24 bg-kake-cream-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl lg:text-4xl font-bold text-kake-chocolate-500 mb-4">
                Meet the Team
              </h2>
              <p className="font-sans text-xl text-kake-chocolate-400 max-w-2xl mx-auto">
                The passionate people behind every delicious creation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {page_content.team_members.map((member, index) => (
                <div
                  key={index}
                  className="text-center"
                >
                  <div className="mb-6 relative inline-block">
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      className="w-48 h-48 rounded-full object-cover mx-auto border-4 border-white shadow-xl"
                    />
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-luxury-gold-500 rounded-full flex items-center justify-center shadow-lg">
                      <Heart className="w-6 h-6 text-luxury-darkCharcoal" fill="currentColor" />
                    </div>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-kake-chocolate-500 mb-2">
                    {member.name}
                  </h3>
                  <p className="font-sans text-luxury-gold-600 font-semibold mb-4">
                    {member.role}
                  </p>
                  <p className="font-sans text-kake-chocolate-400 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Visit Us Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-kake-chocolate-500 mb-4">
              Visit Us
            </h2>
            <p className="font-sans text-xl text-kake-chocolate-400 max-w-2xl mx-auto">
              Find us at one of our Dublin locations
            </p>
          </div>

          {/* Loading State */}
          {locations_loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="status" aria-live="polite" aria-label="Loading locations">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg border border-kake-cream-200 overflow-hidden animate-pulse">
                  <div className="p-6 h-28">
                    <div className="h-6 bg-kake-cream-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-kake-cream-100 rounded w-1/2"></div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-kake-cream-100 rounded w-full"></div>
                      <div className="h-4 bg-kake-cream-100 rounded w-5/6"></div>
                    </div>
                    <div className="h-4 bg-kake-cream-100 rounded w-3/4"></div>
                    <div className="h-4 bg-kake-cream-100 rounded w-4/5"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {locations_error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-red-700 text-center">
                Unable to load location details. Please try refreshing the page.
              </p>
            </div>
          )}

          {/* Locations Grid */}
          {!locations_loading && !locations_error && locations_for_visit.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {locations_for_visit.map((location) => {
                // Get today's hours from structured data or fallback to JSON parsing
                const todayIndex = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
                let todayHoursDisplay = 'Hours not set';
                let isClosed = false;
                
                if (location.opening_hours_structured && location.opening_hours_structured.length > 0) {
                  const todayHours = location.opening_hours_structured.find(h => h.day_of_week === todayIndex);
                  if (todayHours) {
                    if (todayHours.is_closed) {
                      todayHoursDisplay = 'Closed Today';
                      isClosed = true;
                    } else {
                      todayHoursDisplay = `Today: ${todayHours.opens_at} - ${todayHours.closes_at}`;
                    }
                  }
                } else if (location.opening_hours) {
                  // Fallback to legacy JSON parsing
                  const opening_hours = parseOpeningHours(location.opening_hours);
                  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                  const today_hours = opening_hours[today] || { open: 'Closed', close: '' };
                  if (today_hours.open !== 'Closed') {
                    todayHoursDisplay = `Today: ${today_hours.open} - ${today_hours.close}`;
                  } else {
                    todayHoursDisplay = 'Closed Today';
                    isClosed = true;
                  }
                }

                return (
                  <div
                    key={location.location_id}
                    className="bg-white rounded-2xl shadow-lg border border-kake-cream-200 overflow-hidden hover:shadow-xl hover:border-luxury-gold-500/50 transition-all duration-200 hover:scale-105"
                  >
                    <div className="p-6 bg-kake-cream-50 border-b border-kake-cream-200">
                      <h3 className="font-serif text-2xl font-bold text-kake-chocolate-500 mb-2">
                        {location.location_name}
                      </h3>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-luxury-gold-500" />
                        <span className={`text-sm font-semibold ${isClosed ? 'text-red-600' : 'text-luxury-gold-600'}`}>
                          {todayHoursDisplay}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-luxury-gold-500 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <p className="text-kake-chocolate-500 font-medium">{location.address_line1}</p>
                          {location.address_line2 && (
                            <p className="text-kake-chocolate-400">{location.address_line2}</p>
                          )}
                          <p className="text-kake-chocolate-400">{location.city}, {location.postal_code}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-luxury-gold-500 flex-shrink-0" />
                        <a
                          href={`tel:${location.phone_number}`}
                          className="text-kake-chocolate-400 hover:text-luxury-gold-600 transition-colors font-sans"
                        >
                          {location.phone_number}
                        </a>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-luxury-gold-500 flex-shrink-0" />
                        <a
                          href={`mailto:${location.email}`}
                          className="text-kake-chocolate-400 hover:text-luxury-gold-600 transition-colors font-sans"
                        >
                          {location.email}
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!locations_loading && !locations_error && locations_for_visit.length === 0 && (
            <div className="text-center py-12">
              <p className="text-kake-chocolate-400 text-lg font-sans">
                Location information coming soon
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 gradient-chocolate">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-kake-lightCream-100 mb-6">
            Ready to Experience Kake?
          </h2>
          <p className="font-sans text-xl text-kake-cream-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            Choose your location and discover our handcrafted desserts
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-4 min-h-[48px] rounded-xl font-bold text-lg gradient-gold text-luxury-darkCharcoal shadow-glow-gold hover:shadow-glow-gold-lg transition-all duration-300 transform hover:scale-105"
          >
            Start Ordering
          </Link>
        </div>
      </section>
    </>
  );
};

export default UV_About;