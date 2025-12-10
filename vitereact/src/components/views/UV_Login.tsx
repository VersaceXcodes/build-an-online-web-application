import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import kakeLogo from '@/assets/images/kake-logo.png';

const UV_Login: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // URL parameters
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirectUrl = searchParams.get('redirect') || '/';
  
  // Local form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email: string | null;
    password: string | null;
  }>({
    email: null,
    password: null,
  });
  
  // Global state - CRITICAL: Use individual selectors, NO object destructuring
  const isLoading = useAppStore(state => state.authentication_state.authentication_status.is_loading);
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authError = useAppStore(state => state.authentication_state.error_message);
  const loginUser = useAppStore(state => state.login_user);
  const clearAuthError = useAppStore(state => state.clear_auth_error);
  
  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Redirect based on user type
      if (currentUser.user_type === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (currentUser.user_type === 'staff' || currentUser.user_type === 'manager') {
        navigate('/staff/dashboard', { replace: true });
      } else if (currentUser.user_type === 'customer') {
        navigate(redirectUrl === '/login' ? '/account' : redirectUrl, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, currentUser, navigate, redirectUrl]);
  
  // Clear auth errors on mount
  useEffect(() => {
    clearAuthError();
    
    return () => {
      clearAuthError();
    };
  }, [clearAuthError]);
  
  // ============================================================================
  // VALIDATION
  // ============================================================================
  
  const validateEmail = (value: string): string | null => {
    if (!value) {
      return 'Email is required';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    
    return null;
  };
  
  const validatePassword = (value: string): string | null => {
    if (!value) {
      return 'Password is required';
    }
    
    return null;
  };
  
  const validateForm = (): boolean => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    setFormErrors({
      email: emailError,
      password: passwordError,
    });
    
    return !emailError && !passwordError;
  };
  
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear errors on change
    if (formErrors.email) {
      setFormErrors(prev => ({ ...prev, email: null }));
    }
    if (authError) {
      clearAuthError();
    }
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // Clear errors on change
    if (formErrors.password) {
      setFormErrors(prev => ({ ...prev, password: null }));
    }
    if (authError) {
      clearAuthError();
    }
  };
  
  const handleEmailBlur = () => {
    const error = validateEmail(email);
    setFormErrors(prev => ({ ...prev, email: error }));
  };
  
  const handlePasswordBlur = () => {
    const error = validatePassword(password);
    setFormErrors(prev => ({ ...prev, password: error }));
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous errors
    clearAuthError();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      // Call global store login action
      await loginUser(email, password, rememberMe);
      
      // Redirect handled in useEffect based on currentUser
    } catch (error) {
      // Error is handled by the global store
      console.error('Login error:', error);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Card Container */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="text-center">
                <img src={kakeLogo} alt="Kake Logo" className="h-16 w-auto mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">
                  Welcome to Kake
                </h2>
                <p className="text-blue-100 text-base">
                  Sign in to your account to continue
                </p>
              </div>
            </div>
            
            {/* Form Container */}
            <div className="px-8 py-8">
              {/* Auth Error Banner */}
              {authError && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md" role="alert" aria-live="polite">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800 font-medium">
                        {authError}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={handleEmailBlur}
                      disabled={isLoading}
                      placeholder="your.email@example.com"
                      data-testid="login-email-input"
                      className={`
                        block w-full pl-10 pr-4 py-3 
                        border-2 rounded-lg
                        text-gray-900 placeholder-gray-400
                        focus:outline-none focus:ring-4 focus:ring-blue-100
                        transition-all duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${formErrors.email 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
                        }
                      `}
                      aria-invalid={!!formErrors.email}
                      aria-describedby={formErrors.email ? "email-error" : undefined}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="mt-2 text-sm text-red-600" id="email-error" role="alert">
                      {formErrors.email}
                    </p>
                  )}
                </div>
                
                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={handlePasswordBlur}
                      disabled={isLoading}
                      placeholder="Enter your password"
                      data-testid="login-password-input"
                      className={`
                        block w-full pl-10 pr-12 py-3 
                        border-2 rounded-lg
                        text-gray-900 placeholder-gray-400
                        focus:outline-none focus:ring-4 focus:ring-blue-100
                        transition-all duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${formErrors.password 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
                        }
                      `}
                      aria-invalid={!!formErrors.password}
                      aria-describedby={formErrors.password ? "password-error" : undefined}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="mt-2 text-sm text-red-600" id="password-error" role="alert">
                      {formErrors.password}
                    </p>
                  )}
                </div>
                
                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember_me"
                      name="remember_me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isLoading}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50"
                    />
                    <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700 font-medium">
                      Remember me for 30 days
                    </label>
                  </div>
                  
                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors focus:outline-none focus:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                
                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    data-testid="login-submit-button"
                    className="
                      w-full flex justify-center items-center
                      px-6 py-3 
                      bg-blue-600 hover:bg-blue-700 
                      text-white font-semibold text-base
                      rounded-lg
                      shadow-lg hover:shadow-xl
                      focus:outline-none focus:ring-4 focus:ring-blue-100
                      transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:hover:shadow-lg
                    "
                  >
                    {isLoading ? (
                      <>
                        <svg 
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24"
                        >
                          <circle 
                            className="opacity-25" 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="4"
                          />
                          <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </div>
                
                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">
                      Or
                    </span>
                  </div>
                </div>
                
                {/* OAuth Options - Placeholder for future implementation */}
                <div>
                  <button
                    type="button"
                    disabled
                    className="
                      w-full flex justify-center items-center
                      px-6 py-3 
                      bg-white hover:bg-gray-50
                      text-gray-700 font-medium text-base
                      border-2 border-gray-300
                      rounded-lg
                      focus:outline-none focus:ring-4 focus:ring-gray-100
                      transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                    <span className="ml-2 text-xs text-gray-500">(Coming Soon)</span>
                  </button>
                </div>
              </form>
              
              {/* Registration Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    to={`/register${redirectUrl !== '/' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                    className="font-semibold text-blue-600 hover:text-blue-700 transition-colors focus:outline-none focus:underline"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>
            </div>
          </div>
          
          {/* Security Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="text-blue-600 hover:text-blue-700 underline">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Login;