import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { CheckCircle2, XCircle, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ResetPasswordRequest {
  token: string;
  password: string;
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

interface ErrorResponse {
  error: string;
  message: string;
  error_code?: string;
}

interface PasswordRequirements {
  min_length: boolean;
  has_uppercase: boolean;
  has_lowercase: boolean;
  has_number: boolean;
  passwords_match: boolean;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/auth/reset-password`,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Global state actions (individual selectors)
  const showToast = useAppStore(state => state.show_toast);
  
  // Extract token from URL
  const reset_token = searchParams.get('token') || '';
  
  // Local state
  const [new_password, setNewPassword] = useState('');
  const [confirm_password, setConfirmPassword] = useState('');
  const [show_password, setShowPassword] = useState(false);
  const [show_confirm_password, setShowConfirmPassword] = useState(false);
  const [form_errors, setFormErrors] = useState<{
    password: string | null;
    token: string | null;
  }>({
    password: null,
    token: null,
  });
  const [reset_success, setResetSuccess] = useState(false);
  
  // Check for token on mount
  useEffect(() => {
    if (!reset_token) {
      setFormErrors(prev => ({
        ...prev,
        token: 'Invalid or missing reset token. Please request a new password reset.',
      }));
    } else {
      setFormErrors(prev => ({
        ...prev,
        token: null,
      }));
    }
  }, [reset_token]);
  
  // Real-time password validation (memoized for performance)
  const password_requirements_met: PasswordRequirements = useMemo(() => {
    return {
      min_length: new_password.length >= 8,
      has_uppercase: /[A-Z]/.test(new_password),
      has_lowercase: /[a-z]/.test(new_password),
      has_number: /[0-9]/.test(new_password),
      passwords_match: new_password === confirm_password && new_password.length > 0,
    };
  }, [new_password, confirm_password]);
  
  // Check if all requirements are met
  const all_requirements_met = useMemo(() => {
    return Object.values(password_requirements_met).every(req => req === true);
  }, [password_requirements_met]);
  
  // Reset password mutation
  const resetPasswordMutation = useMutation<ResetPasswordResponse, Error, ResetPasswordRequest>({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      setResetSuccess(true);
      showToast('success', 'Password reset successful! Redirecting to login...');
      
      // Redirect to login after 1.5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    },
    onError: (error: any) => {
      const errorData: ErrorResponse = error.response?.data;
      const errorCode = errorData?.error_code;
      let errorMessage = errorData?.message || 'Failed to reset password';
      
      // Handle specific error codes
      if (errorCode === 'INVALID_TOKEN') {
        setFormErrors(prev => ({
          ...prev,
          token: 'This password reset link is invalid. Please request a new one.',
        }));
      } else if (errorCode === 'TOKEN_EXPIRED') {
        setFormErrors(prev => ({
          ...prev,
          token: 'This password reset link has expired. Please request a new one.',
        }));
      } else if (errorCode === 'TOKEN_USED') {
        setFormErrors(prev => ({
          ...prev,
          token: 'This password reset link has already been used. Please request a new one.',
        }));
      } else if (errorCode === 'MISSING_FIELDS') {
        setFormErrors(prev => ({
          ...prev,
          password: 'Please enter a new password.',
        }));
      } else {
        setFormErrors(prev => ({
          ...prev,
          token: errorMessage,
        }));
      }
      
      showToast('error', errorMessage);
    },
  });
  
  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setFormErrors({
      password: null,
      token: null,
    });
    
    // Validate token exists
    if (!reset_token) {
      setFormErrors(prev => ({
        ...prev,
        token: 'Invalid reset link. Please request a new password reset.',
      }));
      return;
    }
    
    // Validate all password requirements
    if (!all_requirements_met) {
      setFormErrors(prev => ({
        ...prev,
        password: 'Please meet all password requirements.',
      }));
      return;
    }
    
    // Submit password reset
    resetPasswordMutation.mutate({
      token: reset_token,
      password: new_password,
    });
  };
  
  // Handle password input change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    // Clear password error when user starts typing
    if (form_errors.password) {
      setFormErrors(prev => ({
        ...prev,
        password: null,
      }));
    }
  };
  
  // Handle confirm password change
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    // Clear password error
    if (form_errors.password) {
      setFormErrors(prev => ({
        ...prev,
        password: null,
      }));
    }
  };
  
  const is_loading = resetPasswordMutation.isPending;

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Card Container */}
          <div className="bg-white shadow-xl shadow-gray-200/50 rounded-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <Lock className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white">Reset Password</h2>
              <p className="text-blue-100 text-sm mt-2">Create a new secure password for your account</p>
            </div>
            
            {/* Token Error Banner */}
            {form_errors.token && !reset_success && (
              <div className="bg-red-50 border-b border-red-200 px-6 py-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-red-800 text-sm font-medium">Invalid Reset Link</p>
                    <p className="text-red-700 text-sm mt-1">{form_errors.token}</p>
                    <Link
                      to="/forgot-password"
                      className="text-red-900 text-sm font-semibold hover:text-red-700 underline mt-2 inline-block"
                    >
                      Request New Password Reset
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            {/* Success State */}
            {reset_success && (
              <div className="px-8 py-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-4 rounded-full">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Complete!</h3>
                <p className="text-gray-600 mb-6">
                  Your password has been successfully updated. You can now log in with your new password.
                </p>
                <p className="text-sm text-gray-500">Redirecting to login page...</p>
              </div>
            )}
            
            {/* Form - Only show if not success and token exists */}
            {!reset_success && reset_token && (
              <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
                {/* New Password Field */}
                <div>
                  <label htmlFor="new_password" className="block text-sm font-semibold text-gray-900 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new_password"
                      name="new_password"
                      type={show_password ? 'text' : 'password'}
                      value={new_password}
                      onChange={handlePasswordChange}
                      required
                      autoComplete="new-password"
                      placeholder="Enter new password"
                      disabled={is_loading}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-4 ${
                        form_errors.password
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      aria-describedby={form_errors.password ? 'password-error' : 'password-requirements'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!show_password)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      aria-label={show_password ? 'Hide password' : 'Show password'}
                    >
                      {show_password ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {form_errors.password && (
                    <p id="password-error" className="mt-2 text-sm text-red-600">
                      {form_errors.password}
                    </p>
                  )}
                </div>
                
                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-semibold text-gray-900 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm_password"
                      name="confirm_password"
                      type={show_confirm_password ? 'text' : 'password'}
                      value={confirm_password}
                      onChange={handleConfirmPasswordChange}
                      required
                      autoComplete="new-password"
                      placeholder="Confirm new password"
                      disabled={is_loading}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-4 ${
                        confirm_password && !password_requirements_met.passwords_match
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!show_confirm_password)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      aria-label={show_confirm_password ? 'Hide password' : 'Show password'}
                    >
                      {show_confirm_password ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {confirm_password && !password_requirements_met.passwords_match && (
                    <p className="mt-2 text-sm text-red-600">Passwords do not match</p>
                  )}
                </div>
                
                {/* Password Requirements Indicator */}
                <div id="password-requirements" className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Password Requirements
                  </p>
                  <div className="space-y-2" aria-live="polite">
                    {/* Minimum Length */}
                    <div className="flex items-center space-x-2">
                      {password_requirements_met.min_length ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${
                        password_requirements_met.min_length ? 'text-green-700 font-medium' : 'text-gray-600'
                      }`}>
                        At least 8 characters
                      </span>
                    </div>
                    
                    {/* Uppercase */}
                    <div className="flex items-center space-x-2">
                      {password_requirements_met.has_uppercase ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${
                        password_requirements_met.has_uppercase ? 'text-green-700 font-medium' : 'text-gray-600'
                      }`}>
                        One uppercase letter (A-Z)
                      </span>
                    </div>
                    
                    {/* Lowercase */}
                    <div className="flex items-center space-x-2">
                      {password_requirements_met.has_lowercase ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${
                        password_requirements_met.has_lowercase ? 'text-green-700 font-medium' : 'text-gray-600'
                      }`}>
                        One lowercase letter (a-z)
                      </span>
                    </div>
                    
                    {/* Number */}
                    <div className="flex items-center space-x-2">
                      {password_requirements_met.has_number ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${
                        password_requirements_met.has_number ? 'text-green-700 font-medium' : 'text-gray-600'
                      }`}>
                        One number (0-9)
                      </span>
                    </div>
                    
                    {/* Passwords Match */}
                    <div className="flex items-center space-x-2">
                      {password_requirements_met.passwords_match ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${
                        password_requirements_met.passwords_match ? 'text-green-700 font-medium' : 'text-gray-600'
                      }`}>
                        Passwords match
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!all_requirements_met || is_loading || !!form_errors.token}
                    className="w-full flex justify-center items-center px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {is_loading ? (
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
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Resetting Password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </div>
                
                {/* Back to Login Link */}
                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  >
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
            
            {/* No Token State */}
            {!reset_token && !reset_success && (
              <div className="px-8 py-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-red-100 p-4 rounded-full">
                    <AlertCircle className="h-12 w-12 text-red-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Invalid Reset Link</h3>
                <p className="text-gray-600 mb-6">
                  This password reset link is invalid or missing. Please request a new password reset.
                </p>
                <div className="flex flex-col space-y-3">
                  <Link
                    to="/forgot-password"
                    className="px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Request New Reset Link
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-all duration-200"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help?{' '}
              <a
                href={`mailto:${useAppStore.getState().system_config_state.company_email}`}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_ResetPassword;