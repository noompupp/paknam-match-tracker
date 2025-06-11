
import { useScrollOpacity } from '@/hooks/useScrollOpacity';

const TopNotchBackground = () => {
  const { opacity } = useScrollOpacity({ threshold: 20, maxScroll: 80 });

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-40 pointer-events-none transition-all duration-200 ease-out will-change-transform bg-background/95 backdrop-blur-lg border-b border-border"
      style={{
        height: 'var(--safe-area-inset-top)',
        opacity: Math.max(0.95, 0.95 + (opacity * 0.05))
      }}
    />
  );
};

export default TopNotchBackground;
