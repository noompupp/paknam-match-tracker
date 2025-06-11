
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StickyBackgroundProps {
  children: ReactNode;
  className?: string;
  variant?: 'header' | 'navigation' | 'section';
  blur?: boolean;
  opacity?: 'light' | 'medium' | 'heavy';
}

const StickyBackground = ({
  children,
  className,
  variant = 'header',
  blur = true,
  opacity = 'medium'
}: StickyBackgroundProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'header':
        return cn(
          "sticky top-0 z-40",
          "border-b border-border/50",
          "sticky-background-enhanced",
          "transition-all duration-200"
        );
      case 'navigation':
        return cn(
          "sticky top-0 z-30",
          "border-b border-border/30",
          "sticky-background-enhanced", 
          "transition-all duration-200",
          "px-4 py-2" // Add consistent padding
        );
      case 'section':
        return cn(
          "relative",
          "bg-background/95",
          blur && "backdrop-blur-sm"
        );
      default:
        return "";
    }
  };

  return (
    <div 
      className={cn(getVariantClasses(), className)}
      style={{
        background: variant !== 'section' ? 'var(--header-background)' : undefined,
        backdropFilter: variant !== 'section' && blur ? 'var(--header-backdrop-blur)' : undefined,
        borderColor: variant !== 'section' ? 'var(--header-border)' : undefined
      }}
    >
      {children}
    </div>
  );
};

export default StickyBackground;
