import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { ShoppingCart, Menu, X, User, LogOut, Home, Info, Package, Award, Settings, BookOpen, BarChart3, Heart, Ticket, MessageSquare, Cookie } from 'lucide-react';
import kakeLogo from '@/assets/images/kake-logo.png';

const GV_TopNav: React.FC = () => {
  // ============================================================================
  // STATE - Individual Zustand selectors (CRITICAL: no object destructuring)
  // ============================================================================
  
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const cartItems = useAppStore(state => state.cart_state.items);
  const logoutUser = useAppStore(state => state.logout_user);
  const openCartPanel = useAppStore(state => state.open_cart_panel);
  const showLoading = useAppStore(state => state.show_loading);
  const hideLoading = useAppStore(state => state.hide_loading);
  
  // Local state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  
  // Refs for click outside detection
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  
  // ============================================================================
  // DERIVED STATE
  // ============================================================================
  
  // Calculate total cart items count
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Close account dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [navigate]);
  
  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleToggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const handleToggleAccountDropdown = () => {
    setAccountDropdownOpen(!accountDropdownOpen);
  };
  
  const handleCartClick = () => {
    openCartPanel();
  };
  
  const handleLogout = async () => {
    try {
      showLoading('Logging out...');
      setAccountDropdownOpen(false);
      setMobileMenuOpen(false);
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      hideLoading();
    }
  };
  
  // const handleNavigateToAccount = () => {
  //   setAccountDropdownOpen(false);
  //   setMobileMenuOpen(false);
  //   
  //   if (currentUser?.user_type === 'admin') {
  //     navigate('/admin/dashboard');
  //   } else if (currentUser?.user_type === 'staff' || currentUser?.user_type === 'manager') {
  //     navigate('/staff/dashboard');
  //   } else {
  //     navigate('/account');
  //   }
  // };
  
  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================
  
  // Render account section for desktop
  const renderDesktopAccountSection = () => {
    if (!isAuthenticated || !currentUser) {
      return (
        <div className="flex items-center space-x-2">
          <Link
            to="/login"
            className="text-kake-chocolate-500 hover:text-kake-caramel-500 px-4 py-2 rounded-xl text-sm font-medium font-sans transition-all duration-300 hover:bg-white/60 touch-target tap-scale"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="gradient-caramel text-white px-4 py-2 rounded-xl text-sm font-medium font-sans shadow-caramel hover:shadow-caramel-lg transition-all duration-300 touch-target tap-scale glow-on-hover"
          >
            Sign Up
          </Link>
        </div>
      );
    }
    
    // Customer dropdown
    if (currentUser.user_type === 'customer') {
      return (
        <div className="relative" ref={accountDropdownRef}>
            <button
              onClick={handleToggleAccountDropdown}
              className="flex items-center space-x-2 text-kake-chocolate-500 hover:text-kake-caramel-500 px-3 py-2 rounded-xl text-sm font-medium font-sans transition-all duration-300 hover:bg-white/60 touch-target tap-scale"
              aria-expanded={accountDropdownOpen}
              aria-haspopup="true"
            >
              <div className="w-9 h-9 md:w-8 md:h-8 gradient-caramel rounded-full flex items-center justify-center shadow-caramel glow-on-hover">
                <span className="text-white font-semibold text-sm font-sans">
                  {currentUser.first_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden lg:block">{currentUser.first_name}</span>
            </button>
          
          {accountDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 glass-cream-strong rounded-2xl shadow-caramel-lg border border-kake-caramel-500/30 py-2 z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-kake-caramel-500/20">
                <p className="text-sm font-semibold text-kake-chocolate-500 font-sans">
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <p className="text-xs text-kake-chocolate-500/70 truncate font-sans">{currentUser.email}</p>
              </div>
              
              <div className="py-2">
                <Link
                  to="/account"
                  className="flex items-center px-4 py-3 text-sm text-kake-chocolate-700 hover:bg-white/70 hover:text-kake-caramel-600 transition-all duration-200 rounded-xl mx-2 touch-target"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <User className="w-4 h-4 mr-3" />
                  My Account
                </Link>
                
                <Link
                  to="/favorites"
                  className="flex items-center px-4 py-3 text-sm text-kake-chocolate-700 hover:bg-white/70 hover:text-kake-caramel-600 transition-all duration-200 rounded-xl mx-2 touch-target"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <Heart className="w-4 h-4 mr-3" />
                  Favorites
                </Link>
                
                <Link
                  to="/account?tab=orders"
                  className="flex items-center px-4 py-3 text-sm text-kake-chocolate-700 hover:bg-white/70 hover:text-kake-caramel-600 transition-all duration-200 rounded-xl mx-2 touch-target"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <Package className="w-4 h-4 mr-3" />
                  My Orders
                </Link>
                
                <Link
                  to="/account?tab=loyalty_points"
                  className="flex items-center px-4 py-3 text-sm text-kake-chocolate-700 hover:bg-white/70 hover:text-kake-caramel-600 transition-all duration-200 rounded-xl mx-2 touch-target"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <Award className="w-4 h-4 mr-3" />
                  Loyalty Points
                  <span className="ml-auto text-xs font-semibold text-white gradient-caramel px-2 py-1 rounded-full shadow-soft">
                    {currentUser.loyalty_points_balance}
                  </span>
                </Link>
              </div>
              
              <div className="border-t border-kake-caramel-500/20 pt-2 mt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 rounded-xl mx-2 touch-target"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Staff/Manager dropdown
    if (currentUser.user_type === 'staff' || currentUser.user_type === 'manager') {
      return (
        <div className="relative" ref={accountDropdownRef}>
          <button
            onClick={handleToggleAccountDropdown}
            className="flex items-center space-x-2 text-kake-chocolate-500 hover:text-kake-caramel-500 px-3 py-2 rounded-md text-sm font-medium font-sans transition-all duration-300 min-h-[44px]"
            aria-expanded={accountDropdownOpen}
            aria-haspopup="true"
          >
              <div className="w-8 h-8 gradient-caramel rounded-full flex items-center justify-center shadow-caramel">
                <span className="text-white font-semibold text-sm font-sans">
                  {currentUser.first_name.charAt(0).toUpperCase()}
                </span>
              </div>
            <span className="hidden lg:block">{currentUser.first_name}</span>
              <span className="hidden lg:block text-xs text-white gradient-caramel px-2 py-1 rounded-full font-sans shadow-caramel">
                Staff
              </span>
          </button>
          
          {accountDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white/95 rounded-lg shadow-caramel-lg border border-kake-caramel-500/30 py-2 z-50 backdrop-blur-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-kake-chocolate-500 font-sans">
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <p className="text-xs text-kake-chocolate-500/70 truncate font-sans">{currentUser.email}</p>
              </div>
              
              <div className="py-2">
                <Link
                  to="/staff/dashboard"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Staff Dashboard
                </Link>
                
                <Link
                  to="/staff/training"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <BookOpen className="w-4 h-4 mr-3" />
                  Training
                </Link>
                
                <Link
                  to="/feedback/submit"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <MessageSquare className="w-4 h-4 mr-3" />
                  Submit Feedback
                </Link>
              </div>
              
              <div className="border-t border-gray-100 pt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-white/90 hover:text-red-300 transition-all duration-300 font-sans"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Admin dropdown
    if (currentUser.user_type === 'admin') {
      return (
        <div className="relative" ref={accountDropdownRef}>
          <button
            onClick={handleToggleAccountDropdown}
            className="flex items-center space-x-2 text-kake-chocolate-500 hover:text-kake-caramel-500 px-3 py-2 rounded-md text-sm font-medium font-sans transition-all duration-300 min-h-[44px]"
            aria-expanded={accountDropdownOpen}
            aria-haspopup="true"
          >
              <div className="w-8 h-8 gradient-caramel rounded-full flex items-center justify-center shadow-caramel">
                <span className="text-white font-semibold text-sm font-sans">
                  {currentUser.first_name.charAt(0).toUpperCase()}
                </span>
              </div>
            <span className="hidden lg:block">{currentUser.first_name}</span>
              <span className="hidden lg:block text-xs text-white gradient-caramel px-2 py-1 rounded-full font-sans shadow-caramel">
                Admin
              </span>
          </button>
          
          {accountDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white/95 rounded-lg shadow-caramel-lg border border-kake-caramel-500/30 py-2 z-50 backdrop-blur-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-kake-chocolate-500 font-sans">
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <p className="text-xs text-kake-chocolate-500/70 truncate font-sans">{currentUser.email}</p>
              </div>
              
              <div className="py-2">
                <Link
                  to="/admin/dashboard"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Admin Dashboard
                </Link>
                
                <Link
                  to="/admin/products"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <Package className="w-4 h-4 mr-3" />
                  Products
                </Link>
                
                <Link
                  to="/admin/toppings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <Cookie className="w-4 h-4 mr-3" />
                  Toppings
                </Link>
                
                <Link
                  to="/admin/promo_codes"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <Ticket className="w-4 h-4 mr-3" />
                  Promo Codes
                </Link>
                
                <Link
                  to="/admin/feedback-all"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <MessageSquare className="w-4 h-4 mr-3" />
                  All Feedback
                </Link>
                
                <Link
                  to="/admin/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </Link>
                
                <Link
                  to="/feedback/submit"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <MessageSquare className="w-4 h-4 mr-3" />
                  Submit Feedback
                </Link>
              </div>
              
              <div className="border-t border-gray-100 pt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-white/90 hover:text-red-300 transition-all duration-300 font-sans"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };
  
  // Render mobile account section
  const renderMobileAccountSection = () => {
    if (!isAuthenticated || !currentUser) {
      return (
        <div className="px-4 py-4 border-t border-kake-caramel-500/20 space-y-3 mt-2">
          <Link
            to="/login"
            className="block w-full text-center px-4 py-3 text-kake-chocolate-500 hover:bg-white/70 active:bg-white/90 rounded-xl text-base font-medium font-sans transition-all duration-300 touch-target tap-scale"
            onClick={() => setMobileMenuOpen(false)}
          >
            Login
          </Link>
          <Link
            to="/register"
            className="block w-full text-center px-4 py-3 gradient-caramel text-white rounded-xl text-base font-medium font-sans shadow-caramel hover:shadow-caramel-lg transition-all duration-300 touch-target tap-scale glow-on-hover"
            onClick={() => setMobileMenuOpen(false)}
          >
            Sign Up
          </Link>
        </div>
      );
    }
    
    // Customer mobile menu
    if (currentUser.user_type === 'customer') {
      return (
        <div className="px-4 py-4 border-t border-kake-caramel-500/20 mt-2">
          <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-kake-caramel-500/20">
            <div className="w-12 h-12 gradient-caramel rounded-full flex items-center justify-center shadow-caramel">
              <span className="text-white font-semibold text-lg font-sans">
                {currentUser.first_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-kake-chocolate-500 font-sans truncate">
                {currentUser.first_name} {currentUser.last_name}
              </p>
              <p className="text-sm text-kake-chocolate-500/70 truncate font-sans">{currentUser.email}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Link
              to="/account"
                className="flex items-center px-4 py-3 text-base text-kake-chocolate-500 hover:bg-white/70 active:bg-white/90 hover:text-kake-caramel-500 rounded-xl transition-all duration-300 font-sans touch-target tap-scale"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="w-5 h-5 mr-3" />
              My Account
            </Link>
            
            <Link
              to="/favorites"
                className="flex items-center px-4 py-3 text-base text-kake-chocolate-500 hover:bg-white/70 active:bg-white/90 hover:text-kake-caramel-500 rounded-xl transition-all duration-300 font-sans touch-target tap-scale"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Heart className="w-5 h-5 mr-3" />
              Favorites
            </Link>
            
            <Link
              to="/account?tab=orders"
                className="flex items-center px-4 py-3 text-base text-kake-chocolate-500 hover:bg-white/70 active:bg-white/90 hover:text-kake-caramel-500 rounded-xl transition-all duration-300 font-sans touch-target tap-scale"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Package className="w-5 h-5 mr-3" />
              My Orders
            </Link>
            
            <Link
              to="/account?tab=loyalty_points"
                className="flex items-center px-4 py-3 text-base text-kake-chocolate-500 hover:bg-white/70 active:bg-white/90 hover:text-kake-caramel-500 rounded-xl transition-all duration-300 font-sans touch-target tap-scale"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Award className="w-5 h-5 mr-3" />
              Loyalty Points
                <span className="ml-auto text-xs font-semibold text-white gradient-caramel px-2.5 py-1 rounded-full font-sans shadow-caramel">
                  {currentUser.loyalty_points_balance}
                </span>
            </Link>
            
            <button
              onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-base text-red-600 hover:bg-red-50 active:bg-red-100 rounded-xl transition-all duration-300 font-sans touch-target tap-scale"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      );
    }
    
    // Staff mobile menu
    if (currentUser.user_type === 'staff' || currentUser.user_type === 'manager') {
      return (
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold">
                {currentUser.first_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {currentUser.first_name} {currentUser.last_name}
              </p>
              <p className="text-xs text-green-600 font-medium">Staff Member</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <Link
              to="/staff/dashboard"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <BarChart3 className="w-4 h-4 mr-3" />
              Staff Dashboard
            </Link>
            
            <Link
              to="/staff/training"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <BookOpen className="w-4 h-4 mr-3" />
              Training
            </Link>
            
            <button
              onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-white/90 hover:text-red-300 rounded-md transition-all duration-300 font-sans min-h-[44px]"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </button>
          </div>
        </div>
      );
    }
    
    // Admin mobile menu
    if (currentUser.user_type === 'admin') {
      return (
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-semibold">
                {currentUser.first_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {currentUser.first_name} {currentUser.last_name}
              </p>
              <p className="text-xs text-purple-600 font-medium">Administrator</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <Link
              to="/admin/dashboard"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <BarChart3 className="w-4 h-4 mr-3" />
              Dashboard
            </Link>
            
            <Link
              to="/admin/orders"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Package className="w-4 h-4 mr-3" />
              Orders
            </Link>
            
            <Link
              to="/admin/products"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Package className="w-4 h-4 mr-3" />
              Products
            </Link>
            
            <Link
              to="/admin/promo_codes"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Ticket className="w-4 h-4 mr-3" />
              Promo Codes
            </Link>
            
            <Link
              to="/admin/settings"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Link>
            
            <button
              onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-white/90 hover:text-red-300 rounded-md transition-all duration-300 font-sans min-h-[44px]"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </button>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <>
      {/* Fixed Navigation Bar with Glassmorphism */}
      <nav className="fixed top-0 left-0 right-0 glass-cream-strong shadow-soft-lg border-b border-kake-caramel-500/20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Left: Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2 tap-scale touch-target">
                <img src={kakeLogo} alt="Kake Logo" className="h-10 md:h-12 w-auto transition-transform duration-300 hover:scale-105" />
              </Link>
            </div>
            
            {/* Center: Desktop Navigation Links with Enhanced Interactions */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              <Link
                to="/"
                className="flex items-center text-kake-chocolate-500 hover:text-kake-caramel-500 px-4 py-2 rounded-xl text-sm font-medium font-sans transition-all duration-300 hover:bg-white/60 touch-target tap-scale"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
              
              <Link
                to="/about"
                className="flex items-center text-kake-chocolate-500 hover:text-kake-caramel-500 px-4 py-2 rounded-xl text-sm font-medium font-sans transition-all duration-300 hover:bg-white/60 touch-target tap-scale"
              >
                <Info className="w-4 h-4 mr-2" />
                About
              </Link>
            </div>
            
            {/* Right: Cart & Account Section */}
            <div className="flex items-center space-x-2 md:space-x-3">
              {/* Cart Icon with Badge - Mobile Optimized */}
              <button
                onClick={handleCartClick}
                className="relative p-2 md:p-3 text-kake-chocolate-500 hover:text-kake-caramel-500 rounded-full hover:bg-white/80 transition-all duration-300 touch-target tap-scale glow-on-hover"
                aria-label={`Shopping cart with ${cartItemCount} items`}
              >
                <ShoppingCart className="w-6 h-6 md:w-5 md:h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 gradient-caramel text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-soft-bounce shadow-caramel font-sans">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </button>
              
              {/* Desktop Account Section */}
              <div className="hidden md:block">
                {renderDesktopAccountSection()}
              </div>
              
              {/* Mobile: Hamburger Menu Button - Enhanced */}
              <button
                onClick={handleToggleMobileMenu}
                className="md:hidden p-3 text-kake-chocolate-500 hover:text-kake-caramel-500 rounded-full hover:bg-white/80 transition-all duration-300 touch-target tap-scale"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Panel - Glassmorphism with Slide Animation */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-cream-strong border-t border-kake-caramel-500/20 shadow-soft-lg animate-slide-up">
            <div className="container-mobile py-4 space-y-2">
              <Link
                to="/"
                className="flex items-center px-4 py-3 text-kake-chocolate-500 hover:bg-white/70 active:bg-white/90 hover:text-kake-caramel-500 rounded-xl text-base font-medium font-sans transition-all duration-300 touch-target tap-scale"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-5 h-5 mr-3" />
                Home
              </Link>
              
              <Link
                to="/about"
                className="flex items-center px-4 py-3 text-kake-chocolate-500 hover:bg-white/70 active:bg-white/90 hover:text-kake-caramel-500 rounded-xl text-base font-medium font-sans transition-all duration-300 touch-target tap-scale"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Info className="w-5 h-5 mr-3" />
                About
              </Link>
            </div>
            
            {/* Mobile Account Section */}
            {renderMobileAccountSection()}
          </div>
        )}
      </nav>
      
      {/* Spacer to prevent content from hiding under fixed nav */}
      <div className="h-16"></div>
    </>
  );
};

export default GV_TopNav;