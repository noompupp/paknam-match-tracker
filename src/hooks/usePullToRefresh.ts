
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePlatformDetection } from './usePlatformDetection';
import { useDataRefresh } from './useDataRefresh';

interface PullToRefreshOptions {
  threshold?: number;
  maxPull?: number;
  resistance?: number;
  enabled?: boolean;
}

export const usePullToRefresh = (options: PullToRefreshOptions = {}) => {
  const {
    threshold = 80,
    maxPull = 120,
    resistance = 2.5,
    enabled = true
  } = options;

  const { isStandalone, isMobile } = usePlatformDetection();
  const { refreshAllData } = useDataRefresh();
  
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  
  const touchStartY = useRef<number | null>(null);
  const lastTouchY = useRef<number | null>(null);
  const isAtTop = useRef(true);

  // Check if we're at the top of the page
  const checkScrollPosition = useCallback(() => {
    isAtTop.current = window.scrollY <= 5;
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || !isStandalone || !isMobile || isRefreshing) return;
    
    checkScrollPosition();
    if (!isAtTop.current) return;

    touchStartY.current = e.touches[0].clientY;
    lastTouchY.current = e.touches[0].clientY;
  }, [enabled, isStandalone, isMobile, isRefreshing, checkScrollPosition]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !isStandalone || !isMobile || isRefreshing) return;
    if (touchStartY.current === null || lastTouchY.current === null) return;
    if (!isAtTop.current) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;

    // Only handle downward swipes from the top
    if (deltaY > 0) {
      e.preventDefault();
      
      // Apply resistance to the pull
      const resistedDistance = Math.min(deltaY / resistance, maxPull);
      setPullDistance(resistedDistance);
      
      // Determine if we've pulled enough to trigger refresh
      setCanRefresh(resistedDistance >= threshold);
    }

    lastTouchY.current = currentY;
  }, [enabled, isStandalone, isMobile, isRefreshing, threshold, maxPull, resistance]);

  // Handle touch end
  const handleTouchEnd = useCallback(async () => {
    if (!enabled || !isStandalone || !isMobile || isRefreshing) return;
    if (touchStartY.current === null) return;

    if (canRefresh && pullDistance >= threshold) {
      setIsRefreshing(true);
      
      try {
        await refreshAllData();
        
        // Add a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Pull to refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    // Reset state
    setPullDistance(0);
    setCanRefresh(false);
    touchStartY.current = null;
    lastTouchY.current = null;
  }, [enabled, isStandalone, isMobile, isRefreshing, canRefresh, pullDistance, threshold, refreshAllData]);

  // Add event listeners
  useEffect(() => {
    if (!enabled || !isStandalone || !isMobile) return;

    const options = { passive: false };
    
    document.addEventListener('touchstart', handleTouchStart, options);
    document.addEventListener('touchmove', handleTouchMove, options);
    document.addEventListener('touchend', handleTouchEnd, options);
    document.addEventListener('scroll', checkScrollPosition, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('scroll', checkScrollPosition);
    };
  }, [enabled, isStandalone, isMobile, handleTouchStart, handleTouchMove, handleTouchEnd, checkScrollPosition]);

  return {
    pullDistance,
    isRefreshing,
    canRefresh,
    isActive: pullDistance > 0 || isRefreshing,
    progress: Math.min(pullDistance / threshold, 1)
  };
};
