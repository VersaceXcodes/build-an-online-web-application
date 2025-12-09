import React, { useEffect } from 'react';
import { useAppStore } from '@/store/main';
import { X, Clock, AlertTriangle } from 'lucide-react';

const GV_SessionExpiryWarning: React.FC = () => {
  // CRITICAL: Individual selectors to prevent infinite loops
  const sessionWarningVisible = useAppStore(state => state.notification_state.session_warning_visible);
  const secondsUntilExpiry = useAppStore(state => state.notification_state.session_expires_in_seconds);
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const stopSessionCountdown = useAppStore(state => state.stop_session_countdown);
  const logoutUser = useAppStore(state => state.logout_user);

  // Auto-logout when countdown reaches 0
  useEffect(() => {
    if (sessionWarningVisible && secondsUntilExpiry !== null && secondsUntilExpiry <= 0) {
      handleAutoLogout();
    }
  }, [secondsUntilExpiry, sessionWarningVisible]);

  // Handle automatic logout
  const handleAutoLogout = async () => {
    await logoutUser();
  };

  // Handle "Stay Logged In" button click
  const handleStayLoggedIn = () => {
    // Reset the session warning countdown
    // In production, this would call POST /api/auth/refresh-session
    // For MVP, we reset the warning and user activity will extend the session
    stopSessionCountdown();
  };

  // Handle dismiss (close) button
  const handleDismiss = () => {
    // Hide warning but countdown continues in background
    stopSessionCountdown();
  };

  // Format seconds into MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine color based on time remaining
  const getColorClass = (seconds: number): { bg: string; border: string; text: string; button: string } => {
    if (seconds < 60) {
      // Less than 1 minute - RED (urgent)
      return {
        bg: 'bg-red-50',
        border: 'border-red-300',
        text: 'text-red-900',
        button: 'bg-red-600 hover:bg-red-700'
      };
    } else if (seconds < 180) {
      // 1-3 minutes - YELLOW (warning)
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-300',
        text: 'text-yellow-900',
        button: 'bg-yellow-600 hover:bg-yellow-700'
      };
    } else {
      // > 3 minutes - ORANGE (notice)
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-300',
        text: 'text-orange-900',
        button: 'bg-orange-600 hover:bg-orange-700'
      };
    }
  };

  // Don't render if user not authenticated or warning not visible
  if (!currentUser || !sessionWarningVisible || secondsUntilExpiry === null) {
    return null;
  }

  const colors = getColorClass(secondsUntilExpiry);

  return (
    <>
      {/* Modal Overlay Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-warning-title"
        aria-describedby="session-warning-description"
      >
        {/* Modal Content */}
        <div 
          className={`relative max-w-md w-full ${colors.bg} border-2 ${colors.border} rounded-xl shadow-2xl p-6 space-y-6`}
        >
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Dismiss warning"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Warning Icon and Title */}
          <div className="flex items-start space-x-4">
            <div className={`flex-shrink-0 ${secondsUntilExpiry < 60 ? 'animate-pulse' : ''}`}>
              <AlertTriangle className={`w-12 h-12 ${colors.text}`} />
            </div>
            <div className="flex-1">
              <h3 
                id="session-warning-title"
                className={`text-xl font-bold ${colors.text} mb-2`}
              >
                Session Expiring Soon
              </h3>
              <p 
                id="session-warning-description"
                className={`text-sm ${colors.text} opacity-90`}
              >
                Your session will expire due to inactivity. Click "Stay Logged In" to continue your session.
              </p>
            </div>
          </div>

          {/* Countdown Timer Display */}
          <div className="bg-white rounded-lg p-6 shadow-inner">
            <div className="flex items-center justify-center space-x-3">
              <Clock className={`w-8 h-8 ${colors.text}`} />
              <div className="text-center">
                <div className={`text-5xl font-bold ${colors.text} tabular-nums tracking-tight`}>
                  {formatTime(secondsUntilExpiry)}
                </div>
                <div className="text-sm text-gray-600 mt-1 font-medium">
                  Time remaining
                </div>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-700 text-center">
              {secondsUntilExpiry < 60 ? (
                <span className="font-semibold text-red-600">
                  ⚠️ Less than a minute remaining! You will be logged out automatically.
                </span>
              ) : secondsUntilExpiry < 180 ? (
                <span className="font-semibold text-yellow-700">
                  Your work will be saved, but you'll need to log in again to continue.
                </span>
              ) : (
                <span className="text-gray-600">
                  Click any button or perform any action to extend your session.
                </span>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleStayLoggedIn}
              className={`flex-1 ${colors.button} text-white px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                secondsUntilExpiry < 60 ? 'focus:ring-red-300 animate-pulse' : 
                secondsUntilExpiry < 180 ? 'focus:ring-yellow-300' : 'focus:ring-orange-300'
              }`}
            >
              Stay Logged In
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 border border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-100"
            >
              Dismiss
            </button>
          </div>

          {/* Additional Info */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              For your security, sessions expire after 30 minutes of inactivity
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default GV_SessionExpiryWarning;