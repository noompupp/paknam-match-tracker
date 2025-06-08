
import { useScrollOpacity } from '@/hooks/useScrollOpacity';

const TopNotchBackground = () => {
  const { opacity } = useScrollOpacity({ threshold: 20, maxScroll: 80 });

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-40 pointer-events-none transition-all duration-200 ease-out will-change-transform"
      style={{
        height: 'var(--safe-area-inset-top)',
        background: `var(--header-background)`,
        backdropFilter: `blur(${Math.max(8, 8 + (opacity * 4))}px)`,
        WebkitBackdropFilter: `blur(${Math.max(8, 8 + (opacity * 4))}px)`,
        borderBottom: `1px solid var(--header-border)`,
        boxShadow: `0 1px 3px var(--header-shadow, rgba(0, 0, 0, ${Math.max(0.15, 0.15 + (opacity * 0.1))}))`
      }}
    />
  );
};

export default TopNotchBackground;
