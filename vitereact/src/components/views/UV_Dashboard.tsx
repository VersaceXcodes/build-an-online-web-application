// Shows proper auth state access and logout

import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';

const UV_Dashboard: React.FC = () => {
  // CRITICAL: Individual selectors, no object destructuring
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const logoutUser = useAppStore(state => state.logout_user);

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <>
      <div className="min-h-screen bg-luxury-darkCharcoal">
        {/* Navigation */}
        <nav className="glass-luxury shadow-luxury border-b border-luxury-gold-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="font-serif text-xl font-semibold text-luxury-champagne">Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  to="/profile"
                  className="text-luxury-champagne hover:text-luxury-gold-500 px-3 py-2 rounded-md text-sm font-medium font-sans transition-all duration-300 min-h-[44px] flex items-center"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600/80 text-white px-4 py-2 rounded-md text-sm font-medium font-sans hover:bg-red-700 transition-all duration-300 shadow-glow-gold-sm hover:shadow-glow-gold min-h-[44px]"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Main content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="glass-luxury border border-luxury-gold-500/30 rounded-lg p-8 shadow-glow-gold-lg">
              <div className="text-center">
                <h2 className="font-serif text-2xl font-bold text-luxury-champagne mb-4">
                  Welcome back, {currentUser?.first_name} {currentUser?.last_name}!
                </h2>
                <p className="font-sans text-luxury-champagne/80 mb-4">
                  This is your protected dashboard. You can only see this because you're authenticated.
                </p>
                <div className="glass-luxury-darker border border-luxury-gold-500/20 rounded-md p-4">
                  <p className="text-luxury-champagne/90 text-sm font-sans">
                    <strong className="text-luxury-gold-500">Email:</strong> {currentUser?.email}
                  </p>
                  <p className="text-luxury-champagne/90 text-sm mt-1 font-sans">
                    <strong className="text-luxury-gold-500">User ID:</strong> {currentUser?.user_id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default UV_Dashboard;