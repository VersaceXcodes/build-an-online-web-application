import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { Cookie, X, Settings, CheckCircle, Shield } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const GV_CookieBanner: React.FC = () => {
  // CRITICAL: Individual selectors to avoid infinite loops
  const cookieConsentGiven = useAppStore(state => state.ui_state.cookie_consent_given);
  const setCookieConsent = useAppStore(state => state.set_cookie_consent);

  // Local state
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const [cookieCategories, setCookieCategories] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    timestamp: new Date().toISOString(),
  });

  // Check localStorage on mount
  useEffect(() => {
    const storedConsent = localStorage.getItem('kake_cookie_consent');
    
    if (storedConsent) {
      try {
        const parsed: CookiePreferences = JSON.parse(storedConsent);
        const consentDate = new Date(parsed.timestamp);
        const now = new Date();
        const monthsDiff = (now.getTime() - consentDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        
        // Check if consent is still valid (12 months)
        if (monthsDiff < 12) {
          setCookieCategories(parsed);
          setCookieConsent(true);
          setIsBannerVisible(false);
          
          // Apply preferences (load scripts based on consent)
          applyScriptPreferences(parsed);
          return;
        } else {
          // Consent expired, clear it
          localStorage.removeItem('kake_cookie_consent');
        }
      } catch (error) {
        console.error('Error parsing cookie consent:', error);
        localStorage.removeItem('kake_cookie_consent');
      }
    }
    
    // Show banner if no valid consent
    if (!cookieConsentGiven) {
      setIsBannerVisible(true);
    }
  }, [cookieConsentGiven, setCookieConsent]);

  // Apply script preferences (enable/disable analytics and marketing)
  const applyScriptPreferences = (preferences: CookiePreferences) => {
    // This would load/unload analytics scripts
    if (preferences.analytics) {
      // Load Google Analytics or similar
      // window.gtag('consent', 'update', { analytics_storage: 'granted' });
      console.log('Analytics cookies enabled');
    } else {
      // Disable analytics
      // window.gtag('consent', 'update', { analytics_storage: 'denied' });
      console.log('Analytics cookies disabled');
    }
    
    if (preferences.marketing) {
      // Load marketing pixels/tags
      console.log('Marketing cookies enabled');
    } else {
      // Disable marketing
      console.log('Marketing cookies disabled');
    }
  };

  // Save preferences to localStorage
  const savePreferencesToStorage = (preferences: CookiePreferences) => {
    localStorage.setItem('kake_cookie_consent', JSON.stringify(preferences));
  };

  // Accept all cookies
  const acceptAllCookies = () => {
    const preferences: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    
    setCookieCategories(preferences);
    savePreferencesToStorage(preferences);
    setCookieConsent(true);
    setIsBannerVisible(false);
    applyScriptPreferences(preferences);
  };

  // Decline non-essential cookies
  const declineCookies = () => {
    const preferences: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    
    setCookieCategories(preferences);
    savePreferencesToStorage(preferences);
    setCookieConsent(true);
    setIsBannerVisible(false);
    applyScriptPreferences(preferences);
  };

  // Show preferences modal
  const showPreferencesModal = () => {
    setPreferencesModalOpen(true);
  };

  // Close preferences modal
  const closePreferencesModal = () => {
    setPreferencesModalOpen(false);
  };

  // Save custom preferences
  const saveCustomPreferences = () => {
    const preferences: CookiePreferences = {
      ...cookieCategories,
      timestamp: new Date().toISOString(),
    };
    
    savePreferencesToStorage(preferences);
    setCookieConsent(true);
    setPreferencesModalOpen(false);
    setIsBannerVisible(false);
    applyScriptPreferences(preferences);
  };

  // Toggle preference category
  const toggleCategory = (category: 'analytics' | 'marketing') => {
    setCookieCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Don't render if consent already given or banner explicitly hidden
  if (!isBannerVisible) {
    return null;
  }

  return (
    <>
      {/* Cookie Banner */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-2xl"
        role="dialog"
        aria-label="Cookie consent banner"
        aria-describedby="cookie-banner-description"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Message Section */}
            <div className="flex items-start sm:items-center gap-3 flex-1">
              <div className="flex-shrink-0">
                <Cookie className="h-6 w-6 text-purple-600" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p 
                  id="cookie-banner-description"
                  className="text-sm sm:text-base text-gray-700 leading-relaxed"
                >
                  We use cookies to ensure you get the best experience on our website. 
                  By continuing to use Kake, you accept our use of essential, analytics, 
                  and marketing cookies.{' '}
                  <Link 
                    to="/cookies" 
                    className="text-purple-600 hover:text-purple-700 font-medium underline underline-offset-2 transition-colors"
                  >
                    Learn more
                  </Link>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:flex-shrink-0">
              <button
                onClick={showPreferencesModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all duration-200 whitespace-nowrap"
                aria-label="Manage cookie preferences"
              >
                <Settings className="inline-block h-4 w-4 mr-2" aria-hidden="true" />
                Manage Preferences
              </button>

              <button
                onClick={declineCookies}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all duration-200 whitespace-nowrap"
                aria-label="Decline non-essential cookies"
              >
                Decline
              </button>

              <button
                onClick={acceptAllCookies}
                className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-200 shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap"
                aria-label="Accept all cookies"
              >
                <CheckCircle className="inline-block h-4 w-4 mr-2" aria-hidden="true" />
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {preferencesModalOpen && (
        <div 
          className="fixed inset-0 z-[60] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
        >
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={closePreferencesModal}
            aria-hidden="true"
          ></div>

          {/* Modal Content */}
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 sm:px-8 sm:py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="h-6 w-6 text-white" aria-hidden="true" />
                    <h2 
                      id="cookie-preferences-title"
                      className="text-xl sm:text-2xl font-bold text-white"
                    >
                      Cookie Preferences
                    </h2>
                  </div>
                  <button
                    onClick={closePreferencesModal}
                    className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600 rounded-lg p-1 transition-colors"
                    aria-label="Close preferences modal"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6 sm:px-8 sm:py-8 space-y-6">
                <p className="text-gray-600 leading-relaxed">
                  We use different types of cookies to enhance your experience. 
                  You can choose which categories to enable below.
                </p>

                {/* Cookie Categories */}
                <div className="space-y-4">
                  {/* Essential Cookies (Always Required) */}
                  <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-5 w-5 text-gray-600" aria-hidden="true" />
                          <h3 className="text-base font-semibold text-gray-900">
                            Essential Cookies
                          </h3>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                            Always Active
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          These cookies are necessary for the website to function and cannot be disabled. 
                          They include session management, cart persistence, and security features.
                        </p>
                      </div>
                      <div className="ml-4">
                        <input
                          type="checkbox"
                          checked={true}
                          disabled={true}
                          className="h-5 w-5 text-purple-600 border-gray-300 rounded cursor-not-allowed opacity-50"
                          aria-label="Essential cookies (always enabled)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 mb-2">
                          Analytics Cookies
                        </h3>
                        <p className="text-sm text-gray-600">
                          These cookies help us understand how you use our website, allowing us to 
                          improve your experience with better features and performance.
                        </p>
                      </div>
                      <div className="ml-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cookieCategories.analytics}
                            onChange={() => toggleCategory('analytics')}
                            className="sr-only peer"
                            aria-label="Toggle analytics cookies"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 mb-2">
                          Marketing Cookies
                        </h3>
                        <p className="text-sm text-gray-600">
                          These cookies enable personalized advertising and promotional content. 
                          They help us show you relevant offers and special promotions.
                        </p>
                      </div>
                      <div className="ml-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cookieCategories.marketing}
                            onChange={() => toggleCategory('marketing')}
                            className="sr-only peer"
                            aria-label="Toggle marketing cookies"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Privacy Links */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <Link 
                    to="/privacy" 
                    className="text-purple-600 hover:text-purple-700 font-medium underline underline-offset-2 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  <span className="text-gray-400">•</span>
                  <Link 
                    to="/cookies" 
                    className="text-purple-600 hover:text-purple-700 font-medium underline underline-offset-2 transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 sm:px-8 sm:py-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <button
                    onClick={closePreferencesModal}
                    className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveCustomPreferences}
                    className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-200 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <CheckCircle className="inline-block h-4 w-4 mr-2" aria-hidden="true" />
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GV_CookieBanner;