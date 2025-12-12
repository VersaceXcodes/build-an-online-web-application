import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import kakeLogo from '@/assets/images/kake-logo.png';

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

/**
 * GV_SplashScreen - Initial loading splash screen with pulsating Kake logo
 * 
 * Features:
 * - Shows on first app load only
 * - Pulsating logo animation on solid chocolate background
 * - Respects reduced-motion preferences
 * - Auto-hides after duration
 */
const GV_SplashScreen: React.FC<SplashScreenProps> = ({ 
  onComplete, 
  duration = 2000 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Auto-hide after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        setTimeout(onComplete, 500); // Wait for exit animation
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[10000] flex items-center justify-center gradient-chocolate"
          style={{
            background: 'linear-gradient(135deg, #5C311E 0%, #452517 50%, #5C311E 100%)',
          }}
        >
          {/* Pulsating Logo */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            animate={
              prefersReducedMotion
                ? { opacity: 1, scale: 1 }
                : {
                    opacity: [0, 1, 1, 1],
                    scale: [0.8, 1.1, 1, 1.05, 1],
                  }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0.3 }
                : {
                    duration: 1.5,
                    times: [0, 0.2, 0.4, 0.7, 1],
                    ease: 'easeInOut',
                  }
            }
            className="relative"
          >
            {/* Glow effect behind logo */}
            <motion.div
              className="absolute inset-0 blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(241, 154, 0, 0.3) 0%, transparent 70%)',
              }}
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }
              }
              transition={
                prefersReducedMotion
                  ? {}
                  : {
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }
              }
            />

            {/* Logo */}
            <motion.img
              src={kakeLogo}
              alt="Kake Logo"
              className="relative w-32 h-auto md:w-40 lg:w-48"
              animate={
                prefersReducedMotion
                  ? {}
                  : {
                      scale: [1, 1.05, 1],
                    }
              }
              transition={
                prefersReducedMotion
                  ? {}
                  : {
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }
              }
            />
          </motion.div>

          {/* Optional: Loading text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 2,
              times: [0, 0.2, 0.8, 1],
              ease: 'easeInOut',
            }}
            className="absolute bottom-20 text-kake-cream-200 font-sans text-sm tracking-wider"
          >
            Handcrafted with love
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GV_SplashScreen;
