import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import axios from 'axios';

const UV_ForgotPassword: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Local component state
  const [email, setEmail] = useState('');
  const [is_loading, setIsLoading] = useState(false);
  const [success_message, setSuccessMessage] = useState<string | null>(null);
  const [form_errors, setFormErrors] = useState<{ email: string | null }>({ email: null });

  // Global state - individual selectors to prevent infinite loops
  const showToast = useAppStore(state => state.show_toast);
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  
  // Navigation
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/account');
    }
  }, [isAuthenticated, navigate]);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateEmail = (email_value: string): string | null => {
    if (!email_value) {
      return 'Email address is required';
    }
    
    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email_regex.test(email_value)) {
      return 'Please enter a valid email address';
    }
    
    return null;
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const new_email = e.target.value;
    setEmail(new_email);
    
    // Clear error when user starts typing
    if (form_errors.email) {
      setFormErrors({ email: null });
    }
    
    // Clear success message if user modifies email after success
    if (success_message) {
      setSuccessMessage(null);
    }
  };

  const handleEmailBlur = () => {
    const error = validateEmail(email);
    setFormErrors({ email: error });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const email_error = validateEmail(email);
    if (email_error) {
      setFormErrors({ email: email_error });
      return;
    }
    
    // Clear any previous errors
    setFormErrors({ email: null });
    setIsLoading(true);
    
    try {
      // API call to request password reset
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/auth/forgot-password`,
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Set success message (generic for security)
      setSuccessMessage(
        response.data.message || 
        'If an account exists with this email, you will receive password reset instructions shortly.'
      );
      
      // Clear email field
      setEmail('');
      
      // Show success toast
      showToast(
        'success',
        'Password reset instructions sent! Please check your email.',
        5000
      );
      
    } catch (error: any) {
      // Even on error, show generic success message for security
      // This prevents email enumeration attacks
      setSuccessMessage(
        'If an account exists with this email, you will receive password reset instructions shortly.'
      );
      
      console.error('Password reset request error:', error);
      
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Forgot Password?
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              No worries! Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8">
              {/* Success Message */}
              {success_message && (
                <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg 
                      className="h-6 w-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-green-800 mb-1">
                        Check Your Email
                      </h3>
                      <p className="text-sm text-green-700 leading-relaxed">
                        {success_message}
                      </p>
                      <p className="text-xs text-green-600 mt-2">
                        If you don't receive an email within 5 minutes, please check your spam folder.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form */}
              {!success_message && (
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {/* Email Input */}
                  <div>
                    <label 
                      htmlFor="email" 
                      className="block text-sm font-semibold text-gray-900 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={handleEmailBlur}
                      disabled={is_loading}
                      placeholder="you@example.com"
                      className={`
                        w-full px-4 py-3 rounded-lg border-2 transition-all duration-200
                        focus:outline-none focus:ring-4
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${form_errors.email 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                        }
                      `}
                      aria-invalid={!!form_errors.email}
                      aria-describedby={form_errors.email ? "email-error" : undefined}
                    />
                    
                    {/* Error Message */}
                    {form_errors.email && (
                      <p 
                        id="email-error" 
                        className="mt-2 text-sm text-red-600 flex items-center"
                        role="alert"
                      >
                        <svg 
                          className="h-4 w-4 mr-1 flex-shrink-0" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                        {form_errors.email}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={is_loading || !!form_errors.email}
                    className="
                      w-full px-6 py-3 rounded-lg font-medium text-white
                      bg-blue-600 hover:bg-blue-700
                      shadow-lg hover:shadow-xl
                      transition-all duration-200
                      focus:outline-none focus:ring-4 focus:ring-blue-100
                      disabled:opacity-50 disabled:cursor-not-allowed
                      disabled:hover:bg-blue-600 disabled:hover:shadow-lg
                    "
                  >
                    {is_loading ? (
                      <span className="flex items-center justify-center">
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
                        Sending Reset Link...
                      </span>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>
              )}

              {/* Success State Actions */}
              {success_message && (
                <div className="space-y-4">
                  <Link
                    to="/login"
                    className="
                      block w-full text-center px-6 py-3 rounded-lg font-medium
                      bg-blue-600 text-white
                      hover:bg-blue-700
                      shadow-lg hover:shadow-xl
                      transition-all duration-200
                      focus:outline-none focus:ring-4 focus:ring-blue-100
                    "
                  >
                    Return to Login
                  </Link>
                  
                  <button
                    onClick={() => {
                      setSuccessMessage(null);
                      setEmail('');
                    }}
                    className="
                      block w-full text-center px-6 py-3 rounded-lg font-medium
                      bg-gray-100 text-gray-900 border border-gray-300
                      hover:bg-gray-200
                      transition-all duration-200
                      focus:outline-none focus:ring-4 focus:ring-gray-100
                    "
                  >
                    Send Another Reset Link
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Remember your password?
                </p>
                <Link
                  to="/login"
                  className="
                    inline-flex items-center text-blue-600 hover:text-blue-700
                    font-medium text-sm transition-colors duration-200
                  "
                >
                  <svg 
                    className="h-4 w-4 mr-2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                    />
                  </svg>
                  Back to Login
                </Link>
              </div>

              {/* Additional Help */}
              {!success_message && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center leading-relaxed">
                    Need help? Contact us at{' '}
                    <a 
                      href="mailto:info@kake.ie" 
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      info@kake.ie
                    </a>
                    {' '}or call{' '}
                    <a 
                      href="tel:+35312345678" 
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      +353 1 234 5678
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              For security reasons, we don't disclose whether an email address is registered.
              <br />
              Password reset links are valid for 60 minutes.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_ForgotPassword;