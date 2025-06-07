
import { useThemeDetection } from '@/hooks/useThemeDetection';
import { usePlatformDetection } from '@/hooks/usePlatformDetection';
import { cn } from '@/lib/utils';

interface TopNotchBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const TopNotchBackground = ({ children, className }: TopNotchBackgroundProps) => {
  const { isDark, systemTheme } = useThemeDetection();
  const { isStandalone, isIOS } = usePlatformDetection();

  // Only apply top notch background in PWA mode on iOS
  if (!isStandalone || !isIOS) {
    return <>{children}</>;
  }

  return (
    <div className={cn("top-notch-container", className)}>
      {/* Dynamic top notch background */}
      <div 
        className={cn(
          "top-notch-background",
          isDark ? "theme-dark" : "theme-light"
        )}
        data-theme={systemTheme}
      />
      
      {/* Content */}
      <div className="top-notch-content">
        {children}
      </div>
    </div>
  );
};

export default TopNotchBackground;
