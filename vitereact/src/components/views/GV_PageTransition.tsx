import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import kakeDrippingLogo from '@/assets/images/kake-dripping-logo.png';

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * GV_PageTransition - Branded page transition animation using Kake logo
 * 
 * Animation Sequence:
 * 1. Header logo scales up (1.0 → 1.1) and becomes focus
 * 2. Full-screen overlay appears with centered logo
 * 3. Logo animates with bounce + drip wiggle (0.9 → 1.05 → 1.0)
 * 4. Logo scales down and returns to header position
 * 5. Overlay fades out, revealing new page
 * 
 * Features:
 * - Hardware-accelerated animations (transform/opacity)
 * - Respects reduced-motion preferences
 * - Prevents double-clicks during transitions
 * - Timeout failsafe prevents stuck overlays
 */
const GV_PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const prevLocationRef = useRef(location.pathname);

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
    // Only trigger transition if pathname actually changed
    if (prevLocationRef.current !== location.pathname) {
      prevLocationRef.current = location.pathname;
      
      // Trigger transition animation
      setIsTransitioning(true);

      // Reset transition state after animation completes
      // Total: 150ms (fade in) + 400ms (bounce) + 200ms (fade out) = 750ms
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 750);

      // Failsafe: ensure transition never gets stuck
      const failsafeTimer = setTimeout(() => {
        setIsTransitioning(false);
      }, 2000);

      return () => {
        clearTimeout(timer);
        clearTimeout(failsafeTimer);
      };
    }
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
        // Full animation sequence
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
          },
        },
      };

  // Logo animation variants - complex multi-stage animation
  const logoVariants = prefersReducedMotion
    ? {
        // Reduced motion: static centered logo with simple fade
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
      }
    : {
        // Full animation: header → center → bounce → wiggle → return to header
        initial: {
          scale: 1.1,
          opacity: 0,
          y: -200, // Start from header position
        },
        animate: {
          scale: [1.1, 0.9, 1.05, 1.0, 1.0],
          opacity: [0, 1, 1, 1, 1],
          y: [-200, 0, 0, 0, 0],
          // Drip wiggle effect (subtle vertical movement)
          transition: {
            duration: 0.65,
            times: [0, 0.2, 0.4, 0.6, 1],
            ease: [0.34, 1.56, 0.64, 1], // Bounce easing
            scale: {
              duration: 0.65,
              times: [0, 0.2, 0.4, 0.6, 1],
              ease: 'easeInOut',
            },
            y: {
              duration: 0.65,
              times: [0, 0.2, 0.4, 0.6, 1],
              ease: 'easeOut',
            },
            opacity: {
              duration: 0.15,
              ease: 'easeIn',
            },
          },
        },
        exit: {
          scale: 0.7,
          opacity: 0,
          y: -200, // Return to header position
          transition: {
            duration: 0.25,
            ease: 'easeIn',
          },
        },
      };

  // Drip wiggle animation (subtle up/down movement)
  const dripWiggleVariants = prefersReducedMotion
    ? {}
    : {
        animate: {
          y: [0, -5, 3, -2, 0],
          transition: {
            duration: 0.5,
            delay: 0.25,
            ease: 'easeInOut',
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
      opacity: 0.7,
      scale: 1,
      transition: {
        duration: 0.15,
        ease: 'easeIn',
      },
    },
  };

  // ============================================================================
  // DISABLE NAVIGATION DURING TRANSITION
  // ============================================================================
  useEffect(() => {
    if (isTransitioning) {
      // Disable all pointer events during transition
      document.body.style.pointerEvents = 'none';
      document.body.style.cursor = 'wait';
      
      // Re-enable after transition completes
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = '';
        document.body.style.cursor = '';
      }, 750);
      
      return () => {
        clearTimeout(timer);
        document.body.style.pointerEvents = '';
        document.body.style.cursor = '';
      };
    }
  }, [isTransitioning]);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <>
      {/* Transition Overlay with Animated Logo */}
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
            {/* Animated Logo Container */}
            <motion.div
              variants={dripWiggleVariants}
              animate="animate"
            >
              <motion.img
                src={kakeDrippingLogo}
                alt="Kake"
                className="w-32 h-auto md:w-48 lg:w-56"
                style={{
                  willChange: 'transform, opacity',
                  filter: 'drop-shadow(0 8px 24px rgba(198, 153, 99, 0.4))',
                }}
                variants={logoVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              />
            </motion.div>
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
