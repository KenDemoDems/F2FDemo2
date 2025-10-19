import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export function ScrollIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollTop / docHeight, 1);

      setScrollProgress(progress);

      // Show indicator when user starts scrolling
      if (scrollTop > 50 && !hasScrolled) {
        setHasScrolled(true);
        setIsVisible(true);
      }

      // Show indicator when scrolling
      if (hasScrolled) {
        setIsVisible(true);

        // Clear existing timeout
        clearTimeout(timeoutId);

        // Hide after 2 seconds of no scrolling
        timeoutId = setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [hasScrolled]);

  if (!hasScrolled || !isVisible) return null;

  return (
    <motion.div
      className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden lg:block"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-96">
        {/* String/Line */}
        <div className="absolute left-1/2 top-0 w-0.5 h-full bg-gray-300 -translate-x-1/2"></div>

        {/* Moving Circle */}
        <motion.div
          className="absolute left-1/2 w-4 h-4 bg-emerald-500 rounded-full -translate-x-1/2 shadow-lg"
          style={{
            top: `${scrollProgress * (384 - 16)}px`,
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
        </motion.div>

        {/* Progress markers */}
        <div className="absolute left-1/2 top-0 w-2 h-2 bg-gray-400 rounded-full -translate-x-1/2"></div>
        <div className="absolute left-1/2 bottom-0 w-2 h-2 bg-gray-400 rounded-full -translate-x-1/2"></div>
      </div>
    </motion.div>
  );
}
