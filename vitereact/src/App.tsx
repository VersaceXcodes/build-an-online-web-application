import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';

// Global Shared Views
import GV_TopNav from '@/components/views/GV_TopNav';
import GV_Footer from '@/components/views/GV_Footer';
import GV_CartSlidePanel from '@/components/views/GV_CartSlidePanel';
import GV_LoadingOverlay from '@/components/views/GV_LoadingOverlay';
import GV_NotificationToast from '@/components/views/GV_NotificationToast';
import GV_ConfirmationModal from '@/components/views/GV_ConfirmationModal';
import GV_CookieBanner from '@/components/views/GV_CookieBanner';
import GV_SessionExpiryWarning from '@/components/views/GV_SessionExpiryWarning';

// Unique Views - Public
import UV_Landing from '@/components/views/UV_Landing';
import UV_About from '@/components/views/UV_About';
import UV_LocationInternal from '@/components/views/UV_LocationInternal';
// import UV_LocationExternal from '@/components/views/UV_LocationExternal';
import UV_Menu from '@/components/views/UV_Menu';
import UV_ProductDetail from '@/components/views/UV_ProductDetail';
import UV_CorporateOrderForm from '@/components/views/UV_CorporateOrderForm';
import UV_Login from '@/components/views/UV_Login';
import UV_Register from '@/components/views/UV_Register';
import UV_ForgotPassword from '@/components/views/UV_ForgotPassword';
import UV_ResetPassword from '@/components/views/UV_ResetPassword';

// Unique Views - Customer Protected
import UV_Checkout_Step1 from '@/components/views/UV_Checkout_Step1';
import UV_Checkout_Step2 from '@/components/views/UV_Checkout_Step2';
import UV_Checkout_Step3 from '@/components/views/UV_Checkout_Step3';
import UV_CustomerDashboard from '@/components/views/UV_CustomerDashboard';
import UV_OrderTracking from '@/components/views/UV_OrderTracking';
import UV_FeedbackForm from '@/components/views/UV_FeedbackForm';

// Unique Views - Staff Protected
import UV_StaffDashboard from '@/components/views/UV_StaffDashboard';
import UV_StaffInventoryAlerts from '@/components/views/UV_StaffInventoryAlerts';
import UV_StaffTraining from '@/components/views/UV_StaffTraining';
import UV_StaffFeedbackSubmission from '@/components/views/UV_StaffFeedbackSubmission';

// Unique Views - Admin Protected
import UV_AdminDashboard from '@/components/views/UV_AdminDashboard';
import UV_AdminOrders from '@/components/views/UV_AdminOrders';
import UV_AdminProducts from '@/components/views/UV_AdminProducts';
import UV_AdminUsers from '@/components/views/UV_AdminUsers';
import UV_AdminTraining from '@/components/views/UV_AdminTraining';
import UV_AdminFeedbackCustomer from '@/components/views/UV_AdminFeedbackCustomer';
import UV_AdminFeedbackStaff from '@/components/views/UV_AdminFeedbackStaff';
import UV_AdminInventoryAlerts from '@/components/views/UV_AdminInventoryAlerts';
import UV_AdminSettings from '@/components/views/UV_AdminSettings';
import UV_AdminReports from '@/components/views/UV_AdminReports';

// ============================================================================
// QUERY CLIENT CONFIGURATION
// ============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// ============================================================================
// LOADING SPINNER COMPONENT
// ============================================================================

const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg font-medium">Loading Kake...</p>
    </div>
  </div>
);

// ============================================================================
// PROTECTED ROUTE WRAPPERS
// ============================================================================

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const isLoading = useAppStore(state => state.authentication_state.authentication_status.is_loading);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const RoleProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles: Array<'customer' | 'staff' | 'manager' | 'admin'>;
}> = ({ children, allowedRoles }) => {
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const isLoading = useAppStore(state => state.authentication_state.authentication_status.is_loading);
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (currentUser && !allowedRoles.includes(currentUser.user_type)) {
    // Redirect based on user role
    if (currentUser.user_type === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (currentUser.user_type === 'staff' || currentUser.user_type === 'manager') {
      return <Navigate to="/staff/dashboard" replace />;
    } else {
      return <Navigate to="/account" replace />;
    }
  }
  
  return <>{children}</>;
};

// ============================================================================
// LAYOUT WRAPPER WITH CONDITIONAL SHARED COMPONENTS
// ============================================================================

const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  // Determine if we should show footer based on route
  const showFooter = ![
    '/staff/', 
    '/admin/'
  ].some(prefix => location.pathname.startsWith(prefix));
  
  // Determine if we should show cart panel based on route
  const showCartPanel = ![
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/staff/',
    '/admin/',
    '/checkout'
  ].some(path => location.pathname.startsWith(path));
  
  // Determine if we should show cookie banner (public routes only)
  const showCookieBanner = ![
    '/staff/',
    '/admin/',
    '/account',
    '/orders/',
    '/feedback/',
    '/checkout'
  ].some(path => location.pathname.startsWith(path));
  
  const cookieConsentGiven = useAppStore(state => state.ui_state.cookie_consent_given);
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  
  return (
    <>
      {/* Top Navigation - Always visible */}
      <GV_TopNav />
      
      {/* Main Content Area */}
      <main className="min-h-screen">
        {children}
      </main>
      
      {/* Footer - Conditional based on route */}
      {showFooter && <GV_Footer />}
      
      {/* Cart Slide Panel - Conditional based on route */}
      {showCartPanel && <GV_CartSlidePanel />}
      
      {/* Loading Overlay - Global */}
      <GV_LoadingOverlay />
      
      {/* Notification Toasts - Global */}
      <GV_NotificationToast />
      
      {/* Confirmation Modal - Global */}
      <GV_ConfirmationModal />
      
      {/* Cookie Banner - Only on public routes for first-time visitors */}
      {showCookieBanner && !cookieConsentGiven && <GV_CookieBanner />}
      
      {/* Session Expiry Warning - Only for authenticated users */}
      {isAuthenticated && <GV_SessionExpiryWarning />}
    </>
  );
};

// ============================================================================
// APP INITIALIZER - HANDLES AUTH AND SYSTEM SETUP
// ============================================================================

const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLoading = useAppStore(state => state.authentication_state.authentication_status.is_loading);
  const initializeAuth = useAppStore(state => state.initialize_auth);
  const loadSystemSettings = useAppStore(state => state.load_system_settings);
  const fetchLocations = useAppStore(state => state.fetch_locations);
  const systemConfigLoaded = useAppStore(state => state.system_config_state.loaded);
  
  useEffect(() => {
    // Initialize app on mount
    const initializeApp = async () => {
      try {
        // Initialize authentication state
        await initializeAuth();
        
        // Load system settings if not already loaded
        if (!systemConfigLoaded) {
          await loadSystemSettings();
        }
        
        // Fetch available locations
        await fetchLocations();
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };
    
    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Show loading spinner during initial auth check
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return <>{children}</>;
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppInitializer>
          <LayoutWrapper>
            <Routes>
              {/* ========================================== */}
              {/* PUBLIC ROUTES */}
              {/* ========================================== */}
              
              <Route path="/" element={<UV_Landing />} />
              <Route path="/about" element={<UV_About />} />
              
              {/* Location Routes */}
              <Route path="/location/:location_name" element={<UV_LocationInternal />} />
              <Route path="/location/:location_name/menu" element={<UV_Menu />} />
              <Route path="/location/:location_name/product/:product_id" element={<UV_ProductDetail />} />
              
              {/* Corporate Orders */}
              <Route path="/corporate-order" element={<UV_CorporateOrderForm />} />
              
              {/* Authentication Routes */}
              <Route path="/login" element={<UV_Login />} />
              <Route path="/register" element={<UV_Register />} />
              <Route path="/forgot-password" element={<UV_ForgotPassword />} />
              <Route path="/reset-password" element={<UV_ResetPassword />} />
              
              {/* ========================================== */}
              {/* CUSTOMER PROTECTED ROUTES */}
              {/* ========================================== */}
              
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <UV_Checkout_Step1 />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/checkout/payment" 
                element={
                  <ProtectedRoute>
                    <UV_Checkout_Step2 />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/order-confirmation/:order_id" 
                element={
                  <ProtectedRoute>
                    <UV_Checkout_Step3 />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/account" 
                element={
                  <RoleProtectedRoute allowedRoles={['customer']}>
                    <UV_CustomerDashboard />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/orders/:order_id" 
                element={<UV_OrderTracking />} 
              />
              
              <Route 
                path="/feedback/order/:order_id" 
                element={<UV_FeedbackForm />} 
              />
              
              {/* ========================================== */}
              {/* STAFF PROTECTED ROUTES */}
              {/* ========================================== */}
              
              <Route 
                path="/staff/dashboard" 
                element={
                  <RoleProtectedRoute allowedRoles={['staff', 'manager', 'admin']}>
                    <UV_StaffDashboard />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/staff/inventory/alerts" 
                element={
                  <RoleProtectedRoute allowedRoles={['staff', 'manager', 'admin']}>
                    <UV_StaffInventoryAlerts />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/staff/training" 
                element={
                  <RoleProtectedRoute allowedRoles={['staff', 'manager', 'admin']}>
                    <UV_StaffTraining />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/staff/courses/:course_id" 
                element={
                  <RoleProtectedRoute allowedRoles={['staff', 'manager', 'admin']}>
                    <UV_StaffTraining />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/staff/courses/:course_id/lesson/:lesson_id" 
                element={
                  <RoleProtectedRoute allowedRoles={['staff', 'manager', 'admin']}>
                    <UV_StaffTraining />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/staff/feedback/submit" 
                element={
                  <RoleProtectedRoute allowedRoles={['staff', 'manager', 'admin']}>
                    <UV_StaffFeedbackSubmission />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/staff/feedback/my-feedback" 
                element={
                  <RoleProtectedRoute allowedRoles={['staff', 'manager', 'admin']}>
                    <UV_StaffFeedbackSubmission />
                  </RoleProtectedRoute>
                } 
              />
              
              {/* ========================================== */}
              {/* ADMIN PROTECTED ROUTES */}
              {/* ========================================== */}
              
              <Route 
                path="/admin/dashboard" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <UV_AdminDashboard />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/orders" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <UV_AdminOrders />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/products" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <UV_AdminProducts />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/users" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <UV_AdminUsers />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/training" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <UV_AdminTraining />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/training/create" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <UV_AdminTraining />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/training/:course_id/edit" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <UV_AdminTraining />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/training/progress" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <UV_AdminTraining />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/feedback" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <UV_AdminFeedbackCustomer />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/staff-feedback" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <UV_AdminFeedbackStaff />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/inventory/alerts" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <UV_AdminInventoryAlerts />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/settings" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <UV_AdminSettings />
                  </RoleProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/reports" 
                element={
                  <RoleProtectedRoute allowedRoles={['admin']}>
                    <UV_AdminReports />
                  </RoleProtectedRoute>
                } 
              />
              
              {/* ========================================== */}
              {/* FALLBACK ROUTE */}
              {/* ========================================== */}
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </LayoutWrapper>
        </AppInitializer>
      </Router>
    </QueryClientProvider>
  );
};

export default App;