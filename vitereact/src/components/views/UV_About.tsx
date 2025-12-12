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
  opening_hours: string;
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
// STATIC CONTENT (Future: Admin-managed via CMS)
// ============================================================================

const STATIC_ABOUT_CONTENT: PageContent = {
  hero_image_url: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?q=80&w=2070",
  page_title: "Our Story",
  story_content: `
    <p>Kake was founded in 2020 with a simple mission: to bring artisan-quality desserts to every corner of Dublin. What started as a small bakery in Blanchardstown has grown into a beloved local brand serving three vibrant communities.</p>
    <p>Our journey began with a passion for traditional baking methods combined with innovative flavors. We believe that every dessert tells a story, and we're honored to be part of yours—whether it's a birthday celebration, a corporate event, or simply a well-deserved treat after a long day.</p>
    <p>Today, we continue to handcraft each dessert with the same care and attention that defined our first day. From our signature croissants to our seasonal specials, every item reflects our commitment to quality, community, and the joy of sharing delicious food.</p>
  `,
  milestones: [
    {
      year: "2020",
      title: "Kake Founded",
      description: "Started our journey in Blanchardstown with a small team and big dreams"
    },
    {
      year: "2021",
      title: "Tallaght Opening",
      description: "Expanded to our second location, bringing Kake to South Dublin"
    },
    {
      year: "2022",
      title: "Community Impact",
      description: "Served over 50,000 customers and launched our loyalty program"
    },
    {
      year: "2023",
      title: "Glasnevin Partnership",
      description: "Partnered with Just Eat and Deliveroo to reach even more dessert lovers"
    },
    {
      year: "2024",
      title: "Growing Strong",
      description: "Continuing to innovate with new flavors and sustainable practices"
    }
  ],
  values: [
    {
      icon_name: "quality",
      value_name: "Quality Craftsmanship",
      description: "We use only the finest ingredients and traditional baking methods to create desserts that exceed expectations"
    },
    {
      icon_name: "community",
      value_name: "Community First",
      description: "Supporting local suppliers and giving back to our Dublin communities through partnerships and events"
    },
    {
      icon_name: "innovation",
      value_name: "Creative Innovation",
      description: "Blending classic techniques with modern flavors to create unique seasonal offerings and signature items"
    },
    {
      icon_name: "sustainability",
      value_name: "Sustainability",
      description: "Committed to reducing waste, sourcing responsibly, and making choices that benefit our planet"
    }
  ],
  team_members: [
    {
      photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400",
      name: "Sarah O'Brien",
      role: "Co-Founder & Head Baker",
      bio: "Sarah brings 15 years of artisan baking experience and a passion for creating memorable dessert experiences"
    },
    {
      photo_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400",
      name: "Michael Chen",
      role: "Co-Founder & Operations",
      bio: "Michael's expertise in hospitality and operations ensures Kake delivers excellence at every touchpoint"
    },
    {
      photo_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400",
      name: "Emma Walsh",
      role: "Pastry Chef",
      bio: "Emma's creative flair and attention to detail bring our seasonal specials and signature items to life"
    }
  ]
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

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
  // Local state
  const [page_content] = useState<PageContent>(STATIC_ABOUT_CONTENT);

  // Global state - CRITICAL: Individual selectors only
  const available_locations = useAppStore(state => state.location_state.available_locations);
  // const fetch_locations_action = useAppStore(state => state.fetch_locations);

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

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[500px] lg:h-[600px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${page_content.hero_image_url})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-purple-600/80"></div>
        </div>
        
        <div className="relative h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-fade-in">
              {page_content.page_title}
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 max-w-2xl mx-auto">
              Handcrafted desserts made with love, served with pride
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                The Kake Story
              </h2>
              <div className="w-24 h-1 bg-purple-600 mx-auto rounded-full"></div>
            </div>
            
            <div 
              className="prose prose-lg max-w-none text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: page_content.story_content }}
            />
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Every milestone marks a moment we're proud of
            </p>
          </div>

          <div className="relative">
            {/* Timeline line (desktop only) */}
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-purple-300"></div>

            <div className="space-y-12 lg:space-y-16">
              {page_content.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`relative flex flex-col lg:flex-row items-center ${
                    index % 2 === 0 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-600 rounded-full border-4 border-white shadow-lg z-10"></div>

                  {/* Content card */}
                  <div className={`w-full lg:w-5/12 ${index % 2 === 0 ? 'lg:text-right lg:pr-12' : 'lg:pl-12'}`}>
                    <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-100 hover:shadow-xl transition-shadow duration-200">
                      <div className="inline-block px-4 py-2 bg-purple-600 text-white font-bold text-lg rounded-lg mb-4">
                        {milestone.year}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
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
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {page_content.values.map((value, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 text-white rounded-full mb-6">
                  {getValueIcon(value.icon_name)}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.value_name}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      {page_content.team_members && page_content.team_members.length > 0 && (
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Meet the Team
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <Heart className="w-6 h-6 text-white" fill="currentColor" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-purple-600 font-semibold mb-4">
                    {member.role}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
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
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Visit Us
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find us at one of our Dublin locations
            </p>
          </div>

          {/* Loading State */}
          {locations_loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="status" aria-live="polite" aria-label="Loading locations">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-pulse">
                  <div className="bg-gradient-to-r from-purple-200 to-pink-200 p-6 h-28">
                    <div className="h-6 bg-purple-300 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-purple-200 rounded w-1/2"></div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/5"></div>
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
                const opening_hours = parseOpeningHours(location.opening_hours);
                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                const today_hours = opening_hours[today] || { open: 'Closed', close: '' };

                return (
                  <div
                    key={location.location_id}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-200 hover:scale-105"
                  >
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {location.location_name}
                      </h3>
                      <div className="flex items-center text-purple-100">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">
                          {today_hours.open !== 'Closed' 
                            ? `Today: ${today_hours.open} - ${today_hours.close}`
                            : 'Closed Today'}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">{location.address_line1}</p>
                          {location.address_line2 && (
                            <p className="text-gray-900">{location.address_line2}</p>
                          )}
                          <p className="text-gray-900">{location.city}, {location.postal_code}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        <a
                          href={`tel:${location.phone_number}`}
                          className="text-gray-900 hover:text-purple-600 transition-colors"
                        >
                          {location.phone_number}
                        </a>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        <a
                          href={`mailto:${location.email}`}
                          className="text-gray-900 hover:text-purple-600 transition-colors"
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
              <p className="text-gray-600 text-lg">
                Location information coming soon
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Experience Kake?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Choose your location and discover our handcrafted desserts
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-bold text-lg bg-white text-purple-600 hover:bg-gray-100 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Start Ordering
          </Link>
        </div>
      </section>
    </>
  );
};

export default UV_About;