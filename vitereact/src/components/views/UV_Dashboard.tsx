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
      <div className="min-h-screen bg-kake-cream-50">
        {/* Navigation - Mobile-First with Glassmorphism */}
        <nav className="glass-cream-strong shadow-soft-lg border-b border-kake-caramel-500/20">
          <div className="container-mobile max-w-7xl mx-auto">
            <div className="flex justify-between items-center h-16 md:h-18">
              <div className="flex items-center">
                <h1 className="font-serif text-lg sm:text-xl md:text-2xl font-semibold text-kake-chocolate-500">Dashboard</h1>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                <Link 
                  to="/profile"
                  className="text-kake-chocolate-500 hover:text-kake-caramel-500 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium font-sans transition-all duration-300 hover:bg-white/60 touch-target tap-scale"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-xl text-sm font-medium font-sans hover:bg-red-700 transition-all duration-300 shadow-soft hover:shadow-caramel touch-target tap-scale"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Main content - Enhanced Spacing and Glassmorphism */}
        <main className="container-mobile max-w-7xl mx-auto py-6 sm:py-8 md:py-10 lg:py-12">
          <div className="glass-cream border border-kake-caramel-500/20 rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 shadow-caramel-lg">
            <div className="text-center max-w-2xl mx-auto">
              <div className="mb-6 sm:mb-8">
                <div className="w-20 h-20 sm:w-24 sm:h-24 gradient-caramel rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-caramel-lg">
                  <span className="text-white font-bold text-3xl sm:text-4xl font-sans">
                    {currentUser?.first_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-kake-chocolate-500 mb-3 sm:mb-4">
                  Welcome back, {currentUser?.first_name}!
                </h2>
                <p className="font-sans text-base sm:text-lg text-kake-chocolate-500/80 mb-6 sm:mb-8 leading-relaxed px-4">
                  This is your protected dashboard. You can only see this because you're authenticated.
                </p>
              </div>
              
              <div className="glass-cream-strong border border-kake-caramel-500/20 rounded-xl p-5 sm:p-6 space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 p-3 sm:p-4 bg-white/40 rounded-lg">
                  <span className="font-sans text-sm sm:text-base font-semibold text-kake-caramel-500">Email:</span>
                  <span className="font-sans text-sm sm:text-base text-kake-chocolate-500 break-all">{currentUser?.email}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 p-3 sm:p-4 bg-white/40 rounded-lg">
                  <span className="font-sans text-sm sm:text-base font-semibold text-kake-caramel-500">User ID:</span>
                  <span className="font-sans text-sm sm:text-base text-kake-chocolate-500 font-mono">{currentUser?.user_id}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 p-3 sm:p-4 bg-white/40 rounded-lg">
                  <span className="font-sans text-sm sm:text-base font-semibold text-kake-caramel-500">Name:</span>
                  <span className="font-sans text-sm sm:text-base text-kake-chocolate-500">{currentUser?.first_name} {currentUser?.last_name}</span>
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