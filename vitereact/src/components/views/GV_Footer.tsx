import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { Mail, Phone, Instagram, Facebook } from 'lucide-react';
import kakeLogo from '@/assets/images/kake-logo.png';
import tiktokLogo from '@/assets/images/tiktok-logo.png';

const GV_Footer: React.FC = () => {
  // CRITICAL: Individual selectors - NO object destructuring
  const companyEmail = useAppStore(state => state.system_config_state.company_email);
  const companyPhone = useAppStore(state => state.system_config_state.company_phone);

  // Social media URLs (hardcoded for MVP - will be admin-configurable later)
  const social_media_urls = {
    instagram: 'https://instagram.com/kake',
    facebook: 'https://facebook.com/kake',
    tiktok: 'https://www.tiktok.com/@kakedesserts?lang=en'
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
                  <Link 
                    to="/location/london-flagship"
                    className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    London Flagship
                  </Link>
                  <Link 
                    to="/location/manchester-store"
                    className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Manchester Store
                  </Link>
                  <Link 
                    to="/location/birmingham-store"
                    className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Birmingham Store
                  </Link>
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
                {social_media_urls.instagram && (
                  <a
                    href={social_media_urls.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors duration-200 group"
                    aria-label="Follow us on Instagram"
                  >
                    <Instagram className="h-5 w-5 text-gray-300 group-hover:text-white" />
                  </a>
                )}
                
                {social_media_urls.facebook && (
                  <a
                    href={social_media_urls.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-200 group"
                    aria-label="Follow us on Facebook"
                  >
                    <Facebook className="h-5 w-5 text-gray-300 group-hover:text-white" />
                  </a>
                )}
                
                {social_media_urls.tiktok && (
                  <a
                    href={social_media_urls.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors duration-200 group p-1.5"
                    aria-label="Follow us on TikTok"
                  >
                    <img src={tiktokLogo} alt="TikTok" className="w-full h-full object-contain" />
                  </a>
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