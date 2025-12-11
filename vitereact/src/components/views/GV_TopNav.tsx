import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { ShoppingCart, Menu, X, User, LogOut, Home, Info, Package, Award, Settings, BookOpen, BarChart3, Heart, Ticket, MessageSquare } from 'lucide-react';
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
        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="text-luxury-champagne hover:text-luxury-gold-500 px-4 py-2 rounded-lg text-sm font-medium font-sans transition-all duration-300 min-h-[44px] md:min-h-[40px] flex items-center"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="gradient-gold text-luxury-darkCharcoal px-4 py-2 rounded-lg text-sm font-medium font-sans shadow-glow-gold hover:shadow-glow-gold-lg transition-all duration-300 active:scale-95 min-h-[44px] md:min-h-[40px] flex items-center"
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
              className="flex items-center space-x-2 text-luxury-champagne hover:text-luxury-gold-500 px-3 py-2 rounded-lg text-sm font-medium font-sans transition-all duration-300 min-h-[44px] md:min-h-[40px]"
              aria-expanded={accountDropdownOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 gradient-gold rounded-full flex items-center justify-center shadow-glow-gold-sm">
                <span className="text-luxury-darkCharcoal font-semibold text-sm font-sans">
                  {currentUser.first_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden lg:block">{currentUser.first_name}</span>
            </button>
          
          {accountDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 glass-luxury rounded-xl shadow-glow-gold-lg border border-luxury-gold-500/30 py-2 z-50 animate-cream-fade-in backdrop-blur-glass">
              <div className="px-4 py-3 border-b border-luxury-gold-500/20">
                <p className="text-sm font-semibold text-luxury-champagne font-sans">
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <p className="text-xs text-luxury-champagne/70 truncate font-sans">{currentUser.email}</p>
              </div>
              
              <div className="py-2">
                <Link
                  to="/account"
                  className="flex items-center px-4 py-2 text-sm text-kake-chocolate-700 hover:bg-kake-cream-200 hover:text-kake-caramel-600 transition-all duration-200 rounded-md mx-2"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <User className="w-4 h-4 mr-3" />
                  My Account
                </Link>
                
                <Link
                  to="/favorites"
                  className="flex items-center px-4 py-2 text-sm text-kake-chocolate-700 hover:bg-kake-cream-200 hover:text-kake-caramel-600 transition-all duration-200 rounded-md mx-2"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <Heart className="w-4 h-4 mr-3" />
                  Favorites
                </Link>
                
                <Link
                  to="/account?tab=orders"
                  className="flex items-center px-4 py-2 text-sm text-kake-chocolate-700 hover:bg-kake-cream-200 hover:text-kake-caramel-600 transition-all duration-200 rounded-md mx-2"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <Package className="w-4 h-4 mr-3" />
                  My Orders
                </Link>
                
                <Link
                  to="/account?tab=loyalty_points"
                  className="flex items-center px-4 py-2 text-sm text-kake-chocolate-700 hover:bg-kake-cream-200 hover:text-kake-caramel-600 transition-all duration-200 rounded-md mx-2"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <Award className="w-4 h-4 mr-3" />
                  Loyalty Points
                  <span className="ml-auto text-xs font-semibold text-white gradient-caramel px-2 py-1 rounded-full shadow-soft">
                    {currentUser.loyalty_points_balance}
                  </span>
                </Link>
              </div>
              
              <div className="border-t border-kake-cream-300 pt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-kake-berry-600 hover:bg-kake-berry-50 transition-all duration-200 rounded-md mx-2"
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
            className="flex items-center space-x-2 text-luxury-champagne hover:text-luxury-gold-500 px-3 py-2 rounded-md text-sm font-medium font-sans transition-all duration-300 min-h-[44px]"
            aria-expanded={accountDropdownOpen}
            aria-haspopup="true"
          >
              <div className="w-8 h-8 gradient-gold rounded-full flex items-center justify-center shadow-glow-gold-sm">
                <span className="text-luxury-darkCharcoal font-semibold text-sm font-sans">
                  {currentUser.first_name.charAt(0).toUpperCase()}
                </span>
              </div>
            <span className="hidden lg:block">{currentUser.first_name}</span>
              <span className="hidden lg:block text-xs text-luxury-darkCharcoal gradient-gold px-2 py-1 rounded-full font-sans shadow-glow-gold-sm">
                Staff
              </span>
          </button>
          
          {accountDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 glass-luxury rounded-lg shadow-glow-gold-lg border border-luxury-gold-500/30 py-2 z-50 backdrop-blur-glass">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-luxury-champagne font-sans">
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <p className="text-xs text-luxury-champagne/70 truncate font-sans">{currentUser.email}</p>
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
                  className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:glass-luxury-darker hover:text-red-300 transition-all duration-300 font-sans"
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
            className="flex items-center space-x-2 text-luxury-champagne hover:text-luxury-gold-500 px-3 py-2 rounded-md text-sm font-medium font-sans transition-all duration-300 min-h-[44px]"
            aria-expanded={accountDropdownOpen}
            aria-haspopup="true"
          >
              <div className="w-8 h-8 gradient-gold rounded-full flex items-center justify-center shadow-glow-gold-sm">
                <span className="text-luxury-darkCharcoal font-semibold text-sm font-sans">
                  {currentUser.first_name.charAt(0).toUpperCase()}
                </span>
              </div>
            <span className="hidden lg:block">{currentUser.first_name}</span>
              <span className="hidden lg:block text-xs text-luxury-darkCharcoal gradient-gold px-2 py-1 rounded-full font-sans shadow-glow-gold-sm">
                Admin
              </span>
          </button>
          
          {accountDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 glass-luxury rounded-lg shadow-glow-gold-lg border border-luxury-gold-500/30 py-2 z-50 backdrop-blur-glass">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-luxury-champagne font-sans">
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <p className="text-xs text-luxury-champagne/70 truncate font-sans">{currentUser.email}</p>
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
                  to="/admin/promo_codes"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <Ticket className="w-4 h-4 mr-3" />
                  Promo Codes
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
                  className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:glass-luxury-darker hover:text-red-300 transition-all duration-300 font-sans"
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
        <div className="px-4 py-3 border-t border-luxury-gold-500/30 space-y-2">
          <Link
            to="/login"
            className="block w-full text-center px-4 py-2 text-luxury-champagne hover:glass-luxury-darker rounded-lg text-sm font-medium font-sans transition-all duration-300 min-h-[44px] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(false)}
          >
            Login
          </Link>
          <Link
            to="/register"
            className="block w-full text-center px-4 py-2 gradient-gold text-luxury-darkCharcoal rounded-lg text-sm font-medium font-sans shadow-glow-gold hover:shadow-glow-gold-lg transition-all duration-300 min-h-[44px] flex items-center justify-center"
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
        <div className="px-4 py-3 border-t border-luxury-gold-500/30">
          <div className="flex items-center space-x-3 mb-3 pb-3 border-b border-luxury-gold-500/20">
            <div className="w-10 h-10 gradient-gold rounded-full flex items-center justify-center shadow-glow-gold-sm">
              <span className="text-luxury-darkCharcoal font-semibold font-sans">
                {currentUser.first_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-luxury-champagne font-sans">
                {currentUser.first_name} {currentUser.last_name}
              </p>
              <p className="text-xs text-luxury-champagne/70 truncate font-sans">{currentUser.email}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <Link
              to="/account"
                className="flex items-center px-3 py-2 text-sm text-luxury-champagne/80 hover:glass-luxury-darker hover:text-luxury-gold-500 rounded-md transition-all duration-300 font-sans min-h-[44px]"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="w-4 h-4 mr-3" />
              My Account
            </Link>
            
            <Link
              to="/favorites"
                className="flex items-center px-3 py-2 text-sm text-luxury-champagne/80 hover:glass-luxury-darker hover:text-luxury-gold-500 rounded-md transition-all duration-300 font-sans min-h-[44px]"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Heart className="w-4 h-4 mr-3" />
              Favorites
            </Link>
            
            <Link
              to="/account?tab=orders"
                className="flex items-center px-3 py-2 text-sm text-luxury-champagne/80 hover:glass-luxury-darker hover:text-luxury-gold-500 rounded-md transition-all duration-300 font-sans min-h-[44px]"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Package className="w-4 h-4 mr-3" />
              My Orders
            </Link>
            
            <Link
              to="/account?tab=loyalty_points"
                className="flex items-center px-3 py-2 text-sm text-luxury-champagne/80 hover:glass-luxury-darker hover:text-luxury-gold-500 rounded-md transition-all duration-300 font-sans min-h-[44px]"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Award className="w-4 h-4 mr-3" />
              Loyalty Points
                <span className="ml-auto text-xs font-semibold text-luxury-darkCharcoal gradient-gold px-2 py-1 rounded-full font-sans shadow-glow-gold-sm">
                  {currentUser.loyalty_points_balance}
                </span>
            </Link>
            
            <button
              onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:glass-luxury-darker hover:text-red-300 rounded-md transition-all duration-300 font-sans min-h-[44px]"
            >
              <LogOut className="w-4 h-4 mr-3" />
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
                className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:glass-luxury-darker hover:text-red-300 rounded-md transition-all duration-300 font-sans min-h-[44px]"
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
                className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:glass-luxury-darker hover:text-red-300 rounded-md transition-all duration-300 font-sans min-h-[44px]"
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
      {/* Fixed Navigation Bar with Dark Luxury Glass-morphism */}
      <nav className="fixed top-0 left-0 right-0 glass-luxury backdrop-blur-glass shadow-luxury border-b border-luxury-gold-500/30 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2">
                <img src={kakeLogo} alt="Kake Logo" className="h-10 w-auto" />
              </Link>
            </div>
            
            {/* Center: Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="flex items-center text-luxury-champagne hover:text-luxury-gold-500 px-3 py-2 rounded-lg text-sm font-medium font-sans transition-all duration-300 drip-border-bottom"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
              
              <Link
                to="/about"
                className="flex items-center text-luxury-champagne hover:text-luxury-gold-500 px-3 py-2 rounded-lg text-sm font-medium font-sans transition-all duration-300 drip-border-bottom"
              >
                <Info className="w-4 h-4 mr-2" />
                About
              </Link>
            </div>
            
            {/* Right: Cart & Account Section */}
            <div className="flex items-center space-x-4">
              {/* Cart Icon with Badge (hidden in checkout) */}
              <button
                onClick={handleCartClick}
                className="relative p-2 text-luxury-champagne hover:text-luxury-gold-500 rounded-full hover:glass-luxury-darker transition-all duration-300 min-w-[44px] min-h-[44px] md:min-w-[auto] md:min-h-[auto]"
                aria-label={`Shopping cart with ${cartItemCount} items`}
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 gradient-gold text-luxury-darkCharcoal text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-soft-bounce shadow-glow-gold font-sans">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </button>
              
              {/* Desktop Account Section */}
              <div className="hidden md:block">
                {renderDesktopAccountSection()}
              </div>
              
              {/* Mobile: Hamburger Menu Button */}
              <button
                onClick={handleToggleMobileMenu}
                className="md:hidden p-2 text-luxury-champagne hover:text-luxury-gold-500 rounded-md hover:glass-luxury-darker transition-all duration-300 min-w-[44px] min-h-[44px]"
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
        
        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-luxury backdrop-blur-glass border-t border-luxury-gold-500/30 shadow-glow-gold-lg animate-cream-fade-in">
            <div className="px-4 py-3 space-y-1">
              <Link
                to="/"
                className="flex items-center px-3 py-2 text-luxury-champagne hover:glass-luxury-darker hover:text-luxury-gold-500 rounded-lg text-sm font-medium font-sans transition-all duration-300 min-h-[44px]"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-4 h-4 mr-3" />
                Home
              </Link>
              
              <Link
                to="/about"
                className="flex items-center px-3 py-2 text-luxury-champagne hover:glass-luxury-darker hover:text-luxury-gold-500 rounded-lg text-sm font-medium font-sans transition-all duration-300 min-h-[44px]"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Info className="w-4 h-4 mr-3" />
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