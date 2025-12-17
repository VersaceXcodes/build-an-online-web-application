import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Mail, Phone, Instagram, Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import kakeLogo from '@/assets/images/kake-logo.png';

// TikTok SVG Icon component
const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    aria-hidden="true"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

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

interface SocialMediaLink {
  link_id: string;
  platform_name: string;
  platform_url: string;
  icon_type: 'lucide' | 'custom';
  icon_name: string | null;
  icon_url: string | null;
  hover_color: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const fetchLocations = async (): Promise<Location[]> => {
  const response = await axios.get<Location[]>(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/locations`
  );
  return response.data;
};

const fetchSocialLinks = async (): Promise<SocialMediaLink[]> => {
  const response = await axios.get<SocialMediaLink[]>(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/social-links`
  );
  return response.data;
};

const GV_Footer: React.FC = () => {
  // CRITICAL: Individual selectors - NO object destructuring
  const companyEmail = useAppStore(state => state.system_config_state.company_email);
  const companyPhone = useAppStore(state => state.system_config_state.company_phone);

  // Fetch locations dynamically
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });

  // Fetch social media links dynamically
  const { data: socialLinks = [] } = useQuery({
    queryKey: ['social-links'],
    queryFn: fetchSocialLinks,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });

  // Helper function to convert location name to URL slug
  const nameToSlug = (name: string): string => {
    return name.toLowerCase().trim().replace(/\s+/g, '-');
  };

  // Helper function to get Lucide icon component by name
  const getLucideIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.Link;
  };

  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="bg-gray-900 text-gray-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Main Footer Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            
            {/* Column 1: About & Locations */}
            <div className="space-y-4">
              <h3 className="text-white text-lg font-semibold mb-4">About Kake</h3>
              <Link 
                to="/about"
                className="block text-gray-300 hover:text-white transition-colors duration-200"
              >
                Our Story
              </Link>
              
              <div className="pt-4 mt-4 border-t border-gray-800">
                <h4 className="text-white text-sm font-semibold mb-3">Our Locations</h4>
                <div className="space-y-2">
                  {locations.map((location) => (
                    <Link 
                      key={location.location_id}
                      to={`/location/${nameToSlug(location.location_name)}`}
                      className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {location.location_name}
                    </Link>
                  ))}
                  {locations.length === 0 && (
                    <p className="text-gray-400 text-sm italic">Loading locations...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Column 2: Contact Information */}
            <div className="space-y-4">
              <h3 className="text-white text-lg font-semibold mb-4">Contact Us</h3>
              
              <a 
                href={`mailto:${companyEmail}`}
                className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200 group"
                aria-label="Send us an email"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <span className="text-sm break-all">{companyEmail}</span>
              </a>
              
              <a 
                href={`tel:${companyPhone}`}
                className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-200 group"
                aria-label="Call us"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-gray-700 transition-colors">
                  <Phone className="h-5 w-5" />
                </div>
                <span className="text-sm">{companyPhone}</span>
              </a>
            </div>

            {/* Column 3: Legal Links */}
            <div className="space-y-4">
              <h3 className="text-white text-lg font-semibold mb-4">Legal</h3>
              <div className="space-y-2">
                <Link 
                  to="/privacy"
                  className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Privacy Policy
                </Link>
                <Link 
                  to="/terms"
                  className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Terms & Conditions
                </Link>
                <Link 
                  to="/cookies"
                  className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                >
                  Cookie Policy
                </Link>
              </div>
            </div>

            {/* Column 4: Social Media */}
            <div className="space-y-4">
              <h3 className="text-white text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex items-center space-x-4">
                {socialLinks.length > 0 ? (
                  socialLinks.map((link) => {
                    const IconComponent = link.icon_type === 'lucide' && link.icon_name 
                      ? getLucideIcon(link.icon_name) 
                      : null;
                    
                    return (
                      <a
                        key={link.link_id}
                        href={link.platform_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center transition-colors duration-200 group"
                        style={{
                          ['--hover-color' as any]: link.hover_color
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = link.hover_color;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '';
                        }}
                        aria-label={`Follow us on ${link.platform_name}`}
                      >
                        {link.icon_type === 'lucide' && IconComponent ? (
                          <IconComponent className="h-5 w-5 text-gray-300 group-hover:text-white" />
                        ) : link.platform_name.toLowerCase() === 'tiktok' ? (
                          <TikTokIcon className="h-5 w-5 text-gray-300 group-hover:text-white" />
                        ) : link.icon_url ? (
                          <img 
                            src={link.icon_url} 
                            alt={link.platform_name} 
                            className="w-full h-full object-contain p-1.5" 
                          />
                        ) : (
                          <LucideIcons.Link className="h-5 w-5 text-gray-300 group-hover:text-white" />
                        )}
                      </a>
                    );
                  })
                ) : (
                  // Fallback to hardcoded links if database is empty
                  <>
                    <a
                      href="https://www.instagram.com/kakedesserts/?igsh=MXNyc2lhOTI1ZWliMQ%3D%3D"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors duration-200 group"
                      aria-label="Follow us on Instagram"
                    >
                      <Instagram className="h-5 w-5 text-gray-300 group-hover:text-white" />
                    </a>
                    <a
                      href="https://facebook.com/kake"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-200 group"
                      aria-label="Follow us on Facebook"
                    >
                      <Facebook className="h-5 w-5 text-gray-300 group-hover:text-white" />
                    </a>
                    <a
                      href="https://www.tiktok.com/@kakedesserts?lang=en"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors duration-200 group"
                      aria-label="Follow us on TikTok"
                    >
                      <TikTokIcon className="h-5 w-5 text-gray-300 group-hover:text-white" />
                    </a>
                  </>
                )}
              </div>
              
              <p className="text-sm text-gray-400 leading-relaxed mt-4">
                Stay connected with us on social media for the latest updates, special offers, and behind-the-scenes content!
              </p>
            </div>
          </div>

          {/* Bottom Bar - Copyright */}
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-col items-center md:items-start space-y-3">
                <img src={kakeLogo} alt="Kake Logo" className="h-8 w-auto" />
                <p className="text-sm text-gray-400">
                  © {currentYear} Kake. All rights reserved.
                </p>
              </div>
              
              <div className="flex items-center space-x-6">
                <Link 
                  to="/privacy"
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Privacy
                </Link>
                <Link 
                  to="/terms"
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Terms
                </Link>
                <Link 
                  to="/cookies"
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default GV_Footer;