
import { useScrollOpacity } from '@/hooks/useScrollOpacity';

const TopNotchBackground = () => {
  const { opacity } = useScrollOpacity({ threshold: 20, maxScroll: 80 });

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-40 pointer-events-none transition-all duration-300 ease-out"
      style={{
        height: 'var(--safe-area-inset-top)',
        background: `var(--header-background)`,
        backdropFilter: `blur(${6 + (opacity * 6)}px)`,
        WebkitBackdropFilter: `blur(${6 + (opacity * 6)}px)`,
        borderBottom: `1px solid var(--header-border)`,
        boxShadow: `0 1px 3px var(--header-shadow, rgba(0, 0, 0, ${opacity * 0.1}))`
      }}
    />
  );
};

export default TopNotchBackground;
