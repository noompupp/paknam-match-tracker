
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  canRefresh: boolean;
  isActive: boolean;
  progress: number;
}

const PullToRefreshIndicator = ({
  pullDistance,
  isRefreshing,
  canRefresh,
  isActive,
  progress
}: PullToRefreshIndicatorProps) => {
  if (!isActive) return null;

  const translateY = Math.min(pullDistance - 40, 60);
  const scale = Math.min(0.8 + (progress * 0.4), 1.2);
  const opacity = Math.min(progress * 2, 1);

  return (
    <div 
      className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
      style={{
        transform: `translateX(-50%) translateY(${translateY}px)`,
        opacity
      }}
    >
      <div 
        className={cn(
          "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200",
          "bg-white/90 backdrop-blur-sm border shadow-lg",
          canRefresh ? "bg-primary text-primary-foreground border-primary/20" : "border-border/20"
        )}
        style={{ transform: `scale(${scale})` }}
      >
        <RefreshCw 
          className={cn(
            "h-5 w-5 transition-transform duration-200",
            isRefreshing && "animate-spin",
            canRefresh && !isRefreshing && "animate-pulse"
          )}
          style={{
            transform: isRefreshing ? 'none' : `rotate(${progress * 180}deg)`
          }}
        />
      </div>
      
      {/* Pull hint text */}
      {pullDistance > 20 && !isRefreshing && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <div className="px-3 py-1 bg-black/80 text-white text-xs rounded-full backdrop-blur-sm">
            {canRefresh ? 'Release to refresh' : 'Pull to refresh'}
          </div>
        </div>
      )}
      
      {/* Refreshing text */}
      {isRefreshing && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <div className="px-3 py-1 bg-primary/90 text-primary-foreground text-xs rounded-full backdrop-blur-sm">
            Refreshing...
          </div>
        </div>
      )}
    </div>
  );
};

export default PullToRefreshIndicator;
