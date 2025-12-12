import React from 'react';
import { useAppStore } from '@/store/main';

/**
 * GV_LoadingOverlay Component
 * 
 * Full-screen semi-transparent overlay with centered spinner animation and
 * context-specific loading messages. Prevents user interaction during critical
 * operations (payment processing, order submission, data loading).
 * 
 * Controlled by global ui_state: loading_overlay_visible and loading_message
 */
const GV_LoadingOverlay: React.FC = () => {
  // CRITICAL: Use individual selectors to avoid infinite re-renders
  const isVisible = useAppStore(state => state.ui_state.loading_overlay_visible);
  const loadingMessage = useAppStore(state => state.ui_state.loading_message);

  // Early return if not visible - no need to render anything
  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Full-screen overlay */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-kake-chocolate-900/50 backdrop-blur-md transition-all duration-300 animate-frosting-blur"
        role="dialog"
        aria-modal="true"
        aria-busy="true"
        aria-live="assertive"
        aria-label="Loading content"
      >
        {/* Content container */}
        <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-white rounded-2xl shadow-caramel-lg border-2 border-kake-cream-300 max-w-sm w-full mx-4 animate-cream-fade-in">
          {/* Spinner Animation */}
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="h-16 w-16 rounded-full border-4 border-kake-cream-300"></div>
            
            {/* Inner animated spinner */}
            <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-kake-caramel-500 border-t-transparent animate-spin shadow-caramel"></div>
            
            {/* Center dot for visual appeal */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full gradient-caramel animate-pulse"></div>
          </div>

          {/* Loading Message */}
          <div className="text-center space-y-2">
            <p className="text-lg font-bold text-kake-chocolate-800">
              {loadingMessage || 'Loading...'}
            </p>
            
            {/* Subtle hint text */}
            <p className="text-sm text-warm-600">
              Please wait...
            </p>
          </div>

          {/* Optional: Animated dots for additional visual feedback */}
          <div className="flex items-center justify-center space-x-1">
            <span className="h-2 w-2 gradient-caramel rounded-full animate-bounce shadow-soft" style={{ animationDelay: '0ms' }}></span>
            <span className="h-2 w-2 gradient-caramel rounded-full animate-bounce shadow-soft" style={{ animationDelay: '150ms' }}></span>
            <span className="h-2 w-2 gradient-caramel rounded-full animate-bounce shadow-soft" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    </>
  );
};

export default GV_LoadingOverlay;