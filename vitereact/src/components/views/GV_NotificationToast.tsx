import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/main';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration: number;
  dismissible: boolean;
  action: {
    label: string;
    callback: () => void;
  } | null;
}

// ============================================================================
// STYLE CONFIGURATION
// ============================================================================

const TOAST_STYLES = {
  success: {
    container: 'bg-green-50 border-green-200',
    text: 'text-green-800',
    icon: 'text-green-600',
    Icon: CheckCircle,
  },
  error: {
    container: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    icon: 'text-red-600',
    Icon: XCircle,
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    text: 'text-blue-800',
    icon: 'text-blue-600',
    Icon: Info,
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    text: 'text-yellow-800',
    icon: 'text-yellow-600',
    Icon: AlertTriangle,
  },
} as const;

const MAX_VISIBLE_TOASTS = 3;

// ============================================================================
// TOAST ITEM COMPONENT
// ============================================================================

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
  isHovered: boolean;
}

const ToastItem: React.FC<ToastItemProps> = ({
  toast,
  onDismiss,
  onMouseEnter,
  onMouseLeave,
  isHovered,
}) => {
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  
  const style = TOAST_STYLES[toast.type];
  const IconComponent = style.Icon;

  const handleActionClick = useCallback(async () => {
    if (!toast.action || isExecutingAction) return;

    setIsExecutingAction(true);
    try {
      await toast.action.callback();
      // Auto-dismiss after successful action
      onDismiss(toast.id);
    } catch (error) {
      console.error('Toast action error:', error);
      // Toast remains visible on error
    } finally {
      setIsExecutingAction(false);
    }
  }, [toast.action, toast.id, isExecutingAction, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      onMouseEnter={() => onMouseEnter(toast.id)}
      onMouseLeave={onMouseLeave}
      className={`
        ${style.container}
        relative flex items-start gap-3 p-4 rounded-lg border shadow-lg
        transition-all duration-300 ease-in-out
        transform-gpu
        ${isHovered ? 'scale-105 shadow-xl' : 'scale-100'}
        animate-slide-in-right
        w-full md:min-w-[320px] md:max-w-md
      `}
    >
      {/* Icon */}
      <div className="flex-shrink-0 pt-0.5">
        <IconComponent className={`w-5 h-5 ${style.icon}`} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${style.text} leading-relaxed`}>
          {toast.message}
        </p>
        
        {/* Optional Action Button */}
        {toast.action && (
          <button
            type="button"
            onClick={handleActionClick}
            disabled={isExecutingAction}
            className={`
              mt-2 text-xs font-semibold uppercase tracking-wide
              ${style.text}
              hover:underline focus:outline-none focus:underline
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-opacity duration-200
            `}
          >
            {isExecutingAction ? 'Processing...' : toast.action.label}
          </button>
        )}
      </div>

      {/* Close Button */}
      {toast.dismissible && (
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
          className={`
            flex-shrink-0 p-1 rounded-md
            ${style.text}
            hover:bg-black hover:bg-opacity-10
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
            ${toast.type === 'success' ? 'focus:ring-green-500' : ''}
            ${toast.type === 'error' ? 'focus:ring-red-500' : ''}
            ${toast.type === 'info' ? 'focus:ring-blue-500' : ''}
            ${toast.type === 'warning' ? 'focus:ring-yellow-500' : ''}
            transition-all duration-200
          `}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// ============================================================================
// MAIN NOTIFICATION TOAST COMPONENT
// ============================================================================

const GV_NotificationToast: React.FC = () => {
  // ====================================================================
  // ZUSTAND STATE ACCESS (using individual selectors)
  // ====================================================================
  
  const toasts = useAppStore(state => state.notification_state.toasts);
  const dismiss_toast = useAppStore(state => state.dismiss_toast);

  // ====================================================================
  // LOCAL STATE
  // ====================================================================
  
  const [hoveredToastId, setHoveredToastId] = useState<string | null>(null);

  // ====================================================================
  // COMPUTED VALUES
  // ====================================================================
  
  // Only show first 3 toasts (additional toasts queued)
  const visible_toasts = toasts.slice(0, MAX_VISIBLE_TOASTS);

  // ====================================================================
  // AUTO-DISMISS TIMER MANAGEMENT
  // ====================================================================
  
  // Track when each toast was created and paused
  const toastMetadataRef = React.useRef<{ 
    [key: string]: { 
      createdAt: number; 
      pausedAt: number | null; 
      totalPausedTime: number;
    } 
  }>({});

  useEffect(() => {
    const timers: { [key: string]: NodeJS.Timeout } = {};

    visible_toasts.forEach((toast) => {
      // Initialize metadata for new toasts
      if (!toastMetadataRef.current[toast.id]) {
        toastMetadataRef.current[toast.id] = {
          createdAt: Date.now(),
          pausedAt: null,
          totalPausedTime: 0,
        };
      }

      const metadata = toastMetadataRef.current[toast.id];
      
      // If hovering, mark as paused
      if (hoveredToastId === toast.id) {
        if (metadata.pausedAt === null) {
          metadata.pausedAt = Date.now();
        }
        // Don't set a timer while hovering
        return;
      }
      
      // If not hovering but was paused, accumulate paused time
      if (metadata.pausedAt !== null) {
        metadata.totalPausedTime += Date.now() - metadata.pausedAt;
        metadata.pausedAt = null;
      }

      // Calculate remaining time based on elapsed time minus paused time
      const elapsed = Date.now() - metadata.createdAt - metadata.totalPausedTime;
      const remainingTime = Math.max(100, toast.duration - elapsed);
      
      // Set timer for remaining duration
      timers[toast.id] = setTimeout(() => {
        dismiss_toast(toast.id);
        // Clean up metadata
        delete toastMetadataRef.current[toast.id];
      }, remainingTime);
    });

    // Clean up metadata for dismissed toasts
    Object.keys(toastMetadataRef.current).forEach(id => {
      if (!visible_toasts.find(t => t.id === id)) {
        delete toastMetadataRef.current[id];
      }
    });

    // Cleanup function - clear all timers
    return () => {
      Object.values(timers).forEach((timer) => clearTimeout(timer));
    };
  }, [visible_toasts, hoveredToastId, dismiss_toast]);

  // ====================================================================
  // EVENT HANDLERS
  // ====================================================================
  
  const handleMouseEnter = useCallback((id: string) => {
    setHoveredToastId(id);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredToastId(null);
  }, []);

  const handleDismiss = useCallback((id: string) => {
    dismiss_toast(id);
  }, [dismiss_toast]);

  // ====================================================================
  // RENDER
  // ====================================================================
  
  // Don't render container if no toasts
  if (visible_toasts.length === 0) {
    return null;
  }

  return (
    <>
      {/* Toast Container - Fixed positioning with responsive adjustments */}
      <div
        className="
          fixed z-[9999]
          top-4 left-1/2 -translate-x-1/2
          md:left-auto md:right-4 md:translate-x-0
          flex flex-col gap-3
          pointer-events-none
          w-full max-w-md px-4 md:px-0
        "
        aria-label="Notifications"
      >
        {visible_toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto"
          >
            <ToastItem
              toast={toast}
              onDismiss={handleDismiss}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              isHovered={hoveredToastId === toast.id}
            />
          </div>
        ))}
      </div>

      {/* Custom Animation Styles */}
      <style>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }

        @media (max-width: 768px) {
          .animate-slide-in-right {
            animation: fade-in 0.3s ease-out forwards;
          }
        }
      `}</style>
    </>
  );
};

export default GV_NotificationToast;