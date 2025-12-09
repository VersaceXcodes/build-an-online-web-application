import React, { useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/main';
import { AlertTriangle, Info, X } from 'lucide-react';

/**
 * GV_ConfirmationModal Component
 * 
 * Global confirmation dialog for critical user actions.
 * Provides backdrop overlay, centered modal, and action-specific styling.
 * 
 * Features:
 * - Backdrop click dismissal
 * - Escape key dismissal
 * - Focus trapping
 * - Danger action styling (red confirm button)
 * - Keyboard navigation support
 * 
 * Triggered via: useAppStore().show_confirmation({ ... })
 * Closed via: useAppStore().hide_confirmation()
 */
const GV_ConfirmationModal: React.FC = () => {
  // =========================================================================
  // ZUSTAND STORE ACCESS - CRITICAL: Individual selectors only!
  // =========================================================================
  
  const confirmationModal = useAppStore(state => state.ui_state.confirmation_modal);
  const hideConfirmation = useAppStore(state => state.hide_confirmation);

  // =========================================================================
  // DERIVED STATE
  // =========================================================================
  
  const isVisible = confirmationModal?.visible || false;
  const modalTitle = confirmationModal?.title || 'Confirm Action';
  const modalMessage = confirmationModal?.message || 'Are you sure you want to proceed?';
  const confirmButtonText = confirmationModal?.confirm_text || 'Confirm';
  const cancelButtonText = confirmationModal?.cancel_text || 'Cancel';
  const isDangerAction = confirmationModal?.danger_action || false;
  const onConfirmCallback = confirmationModal?.on_confirm;
  const onCancelCallback = confirmationModal?.on_cancel;

  // =========================================================================
  // EVENT HANDLERS
  // =========================================================================

  /**
   * Handle confirm button click
   * Executes confirm callback and closes modal
   */
  const handleConfirm = useCallback(() => {
    if (onConfirmCallback) {
      onConfirmCallback();
    }
    hideConfirmation();
  }, [onConfirmCallback, hideConfirmation]);

  /**
   * Handle cancel button click or backdrop click
   * Executes cancel callback and closes modal
   */
  const handleCancel = useCallback(() => {
    if (onCancelCallback) {
      onCancelCallback();
    }
    hideConfirmation();
  }, [onCancelCallback, hideConfirmation]);

  /**
   * Handle backdrop click (click outside modal)
   * Only dismiss if clicking the backdrop, not the modal content
   */
  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  }, [handleCancel]);

  // =========================================================================
  // KEYBOARD HANDLING - Escape key dismissal
  // =========================================================================

  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, handleCancel]);

  // =========================================================================
  // BODY SCROLL LOCK - Prevent background scrolling when modal open
  // =========================================================================

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  // =========================================================================
  // FOCUS TRAP - Keep focus within modal
  // =========================================================================

  useEffect(() => {
    if (!isVisible) return;

    const modalElement = document.getElementById('confirmation-modal-container');
    if (!modalElement) return;

    // Focus the first focusable element (confirm or cancel button)
    const focusableElements = modalElement.querySelectorAll(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (firstElement) {
      firstElement.focus();
    }

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift+Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => {
      document.removeEventListener('keydown', handleTab);
    };
  }, [isVisible]);

  // =========================================================================
  // RENDER - Return null if not visible
  // =========================================================================

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity z-50"
        aria-hidden="true"
        onClick={handleBackdropClick}
      />

      {/* Modal Container - Centered */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-20">
        <div
          id="confirmation-modal-container"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          className="relative w-full max-w-lg transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all animate-in fade-in-0 zoom-in-95 duration-200"
        >
          {/* Modal Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {/* Icon - Conditional based on danger action */}
                {isDangerAction ? (
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                ) : (
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    <Info className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                )}

                {/* Title */}
                <h3
                  id="modal-title"
                  className={`text-xl font-bold leading-tight ${
                    isDangerAction ? 'text-red-900' : 'text-gray-900'
                  }`}
                >
                  {modalTitle}
                </h3>
              </div>

              {/* Close button (X) */}
              <button
                type="button"
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="px-6 pb-6">
            <p
              id="modal-description"
              className="text-base text-gray-600 leading-relaxed whitespace-pre-wrap"
            >
              {modalMessage}
            </p>
          </div>

          {/* Modal Footer - Action Buttons */}
          <div className="bg-gray-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 rounded-lg border border-gray-300 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 shadow-sm"
            >
              {cancelButtonText}
            </button>

            {/* Confirm Button - Conditional styling based on danger */}
            <button
              type="button"
              onClick={handleConfirm}
              className={`
                w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 rounded-lg border border-transparent text-base font-medium text-white focus:outline-none focus:ring-4 transition-all duration-200 shadow-lg hover:shadow-xl
                ${
                  isDangerAction
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-100'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-100'
                }
              `}
              autoFocus={isDangerAction}
            >
              {isDangerAction && (
                <AlertTriangle className="h-5 w-5 mr-2" aria-hidden="true" />
              )}
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GV_ConfirmationModal;