import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { ShoppingCart, Menu, X, User, LogOut, Home, Info, Package, Award, Settings, BookOpen, BarChart3 } from 'lucide-react';

const GV_TopNav: React.FC = () => {
  // ============================================================================
  // STATE - Individual Zustand selectors (CRITICAL: no object destructuring)
  // ============================================================================
  
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const cartItems = useAppStore(state => state.cart_state.items);
  const logoutUser = useAppStore(state => state.logout_user);
  const openCartPanel = useAppStore(state => state.open_cart_panel);
  
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
      await logoutUser();
      setAccountDropdownOpen(false);
      setMobileMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const handleNavigateToAccount = () => {
    setAccountDropdownOpen(false);
    setMobileMenuOpen(false);
    
    if (currentUser?.user_type === 'admin') {
      navigate('/admin/dashboard');
    } else if (currentUser?.user_type === 'staff' || currentUser?.user_type === 'manager') {
      navigate('/staff/dashboard');
    } else {
      navigate('/account');
    }
  };
  
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
            className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
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
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            aria-expanded={accountDropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {currentUser.first_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="hidden lg:block">{currentUser.first_name}</span>
          </button>
          
          {accountDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
              </div>
              
              <div className="py-2">
                <Link
                  to="/account"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <User className="w-4 h-4 mr-3" />
                  My Account
                </Link>
                
                <Link
                  to="/account?tab=orders"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <Package className="w-4 h-4 mr-3" />
                  My Orders
                </Link>
                
                <Link
                  to="/account?tab=loyalty_points"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <Award className="w-4 h-4 mr-3" />
                  Loyalty Points
                  <span className="ml-auto text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {currentUser.loyalty_points_balance}
                  </span>
                </Link>
              </div>
              
              <div className="border-t border-gray-100 pt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            aria-expanded={accountDropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold text-sm">
                {currentUser.first_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="hidden lg:block">{currentUser.first_name}</span>
            <span className="hidden lg:block text-xs text-gray-500 bg-green-100 px-2 py-1 rounded-full">
              Staff
            </span>
          </button>
          
          {accountDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
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
              </div>
              
              <div className="border-t border-gray-100 pt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
            className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            aria-expanded={accountDropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-semibold text-sm">
                {currentUser.first_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="hidden lg:block">{currentUser.first_name}</span>
            <span className="hidden lg:block text-xs text-gray-500 bg-purple-100 px-2 py-1 rounded-full">
              Admin
            </span>
          </button>
          
          {accountDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
              </div>
              
              <div className="py-2">
                <Link
                  to="/admin/dashboard"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Dashboard
                </Link>
                
                <Link
                  to="/admin/orders"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <Package className="w-4 h-4 mr-3" />
                  Orders
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
                  to="/admin/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </Link>
              </div>
              
              <div className="border-t border-gray-100 pt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
        <div className="px-4 py-3 border-t border-gray-200 space-y-2">
          <Link
            to="/login"
            className="block w-full text-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Login
          </Link>
          <Link
            to="/register"
            className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
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
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3 pb-3 border-b border-gray-100">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {currentUser.first_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {currentUser.first_name} {currentUser.last_name}
              </p>
              <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <Link
              to="/account"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="w-4 h-4 mr-3" />
              My Account
            </Link>
            
            <Link
              to="/account?tab=orders"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Package className="w-4 h-4 mr-3" />
              My Orders
            </Link>
            
            <Link
              to="/account?tab=loyalty_points"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Award className="w-4 h-4 mr-3" />
              Loyalty Points
              <span className="ml-auto text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                {currentUser.loyalty_points_balance}
              </span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
              className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
              to="/admin/settings"
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-md transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
      {/* Fixed Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-blue-600">Kake</div>
              </Link>
            </div>
            
            {/* Center: Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
              
              <Link
                to="/about"
                className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
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
                className="relative p-2 text-gray-700 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all duration-200"
                aria-label={`Shopping cart with ${cartItemCount} items`}
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
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
                className="md:hidden p-2 text-gray-700 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
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
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              <Link
                to="/"
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md text-sm font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-4 h-4 mr-3" />
                Home
              </Link>
              
              <Link
                to="/about"
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md text-sm font-medium transition-colors"
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