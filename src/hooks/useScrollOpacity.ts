
import { useState, useEffect } from 'react';

interface UseScrollOpacityOptions {
  threshold?: number;
  maxScroll?: number;
}

export const useScrollOpacity = ({ 
  threshold = 20, 
  maxScroll = 100 
}: UseScrollOpacityOptions = {}) => {
  const [scrollY, setScrollY] = useState(0);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      if (currentScrollY <= threshold) {
        setOpacity(0);
      } else if (currentScrollY >= maxScroll) {
        setOpacity(1);
      } else {
        // Linear interpolation between threshold and maxScroll
        const progress = (currentScrollY - threshold) / (maxScroll - threshold);
        setOpacity(Math.min(1, Math.max(0, progress)));
      }
    };

    handleScroll(); // Set initial state
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, maxScroll]);

  return { scrollY, opacity };
};
