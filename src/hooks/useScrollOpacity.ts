
import { useState, useEffect, useCallback } from 'react';

interface UseScrollOpacityOptions {
  threshold?: number;
  maxScroll?: number;
}

export const useScrollOpacity = ({ threshold = 20, maxScroll = 100 }: UseScrollOpacityOptions = {}) => {
  const [opacity, setOpacity] = useState(0);

  const updateOpacity = useCallback(() => {
    const scrollY = window.scrollY;
    
    // Prevent negative values and ensure smooth calculation
    const clampedScroll = Math.max(0, scrollY - threshold);
    const effectiveRange = Math.max(1, maxScroll - threshold); // Prevent division by zero
    
    // Calculate opacity with smooth transitions
    let newOpacity = Math.min(1, clampedScroll / effectiveRange);
    
    // Apply easing for smoother transitions
    newOpacity = newOpacity * newOpacity; // Quadratic easing
    
    setOpacity(newOpacity);
  }, [threshold, maxScroll]);

  useEffect(() => {
    // Use passive listener for better performance
    const options = { passive: true };
    
    // Add throttling to prevent excessive updates
    let ticking = false;
    const throttledUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateOpacity();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial calculation
    updateOpacity();
    
    window.addEventListener('scroll', throttledUpdate, options);
    window.addEventListener('resize', throttledUpdate, options);

    return () => {
      window.removeEventListener('scroll', throttledUpdate);
      window.removeEventListener('resize', throttledUpdate);
    };
  }, [updateOpacity]);

  return { opacity };
};
