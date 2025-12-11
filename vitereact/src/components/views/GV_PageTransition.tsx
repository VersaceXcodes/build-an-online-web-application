import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import kakeDrippingLogo from '@/assets/images/kake-dripping-logo.png';

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * GV_PageTransition - Branded page transition animation using Kake logo
 * 
 * Features:
 * - Animates the Kake logo from header to center of screen
 * - Shows full-screen branded overlay during transitions
 * - Respects reduced-motion preferences
 * - Hardware-accelerated animations (transform/opacity)
 * - Prevents double-clicks during transitions
 */
const GV_PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // ============================================================================
  // DETECT REDUCED MOTION PREFERENCE
  // ============================================================================
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // ============================================================================
  // HANDLE ROUTE CHANGES
  // ============================================================================
  useEffect(() => {
    // Trigger transition animation on route change
    setIsTransitioning(true);

    // Reset transition state after animation completes
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 600); // Total transition time: 600ms

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // ============================================================================
  // ANIMATION VARIANTS
  // ============================================================================

  // Full-screen overlay variants
  const overlayVariants = prefersReducedMotion
    ? {
        // Reduced motion: simple fade
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
      }
    : {
        // Full animation
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: {
            duration: 0.15,
            ease: 'easeIn',
          },
        },
        exit: {
          opacity: 0,
          transition: {
            duration: 0.2,
            ease: 'easeOut',
            delay: 0.1,
          },
        },
      };

  // Logo animation variants
  const logoVariants = prefersReducedMotion
    ? {
        // Reduced motion: static logo
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
      }
    : {
        // Full animation: bounce and drip wiggle
        initial: {
          scale: 0.9,
          opacity: 0,
          y: -20,
        },
        animate: {
          scale: [0.9, 1.05, 1.0],
          opacity: 1,
          y: [0, -8, 0, 5, 0],
          transition: {
            duration: 0.6,
            times: [0, 0.3, 0.5, 0.7, 1],
            ease: [0.34, 1.56, 0.64, 1], // Bounce easing
          },
        },
        exit: {
          scale: 0.8,
          opacity: 0,
          y: -30,
          transition: {
            duration: 0.2,
            ease: 'easeIn',
          },
        },
      };

  // Page content variants
  const pageVariants = {
    initial: {
      opacity: 0,
      scale: 0.98,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
        delay: 0.1,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    },
  };

  // ============================================================================
  // DISABLE NAVIGATION DURING TRANSITION
  // ============================================================================
  useEffect(() => {
    if (isTransitioning) {
      // Add pointer-events: none to navigation elements during transition
      document.body.style.pointerEvents = 'none';
      
      // Re-enable after transition
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = '';
      }, 600);
      
      return () => {
        clearTimeout(timer);
        document.body.style.pointerEvents = '';
      };
    }
  }, [isTransitioning]);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <>
      {/* Transition Overlay */}
      <AnimatePresence mode="wait">
        {isTransitioning && (
          <motion.div
            key="page-transition-overlay"
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #FAF7F2 0%, #F5EFE6 50%, #F9F5EC 100%)',
              pointerEvents: 'auto',
            }}
            variants={overlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Animated Logo */}
            <motion.img
              src={kakeDrippingLogo}
              alt="Kake"
              className="w-32 h-auto md:w-40"
              style={{
                willChange: 'transform, opacity',
                filter: 'drop-shadow(0 4px 16px rgba(198, 153, 99, 0.3))',
              }}
              variants={logoVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content with Transition */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ willChange: 'transform, opacity' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default GV_PageTransition;
