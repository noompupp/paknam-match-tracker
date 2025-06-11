
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
  const opacityClasses = {
    light: "bg-background/80",
    medium: "bg-background/95", 
    heavy: "bg-background/98"
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'header':
        return cn(
          "sticky top-0 z-40",
          "border-b border-border/50",
          opacityClasses[opacity],
          blur && "backdrop-blur-md saturate-150",
          "transition-all duration-200"
        );
      case 'navigation':
        return cn(
          "sticky top-0 z-30",
          "border-b border-border/30",
          opacityClasses[opacity],
          blur && "backdrop-blur-sm",
          "transition-all duration-200"
        );
      case 'section':
        return cn(
          "relative",
          opacityClasses[opacity],
          blur && "backdrop-blur-sm"
        );
      default:
        return "";
    }
  };

  return (
    <div className={cn(getVariantClasses(), className)}>
      {children}
    </div>
  );
};

export default StickyBackground;
