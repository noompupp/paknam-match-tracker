
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import StickyBackground from "@/components/shared/StickyBackground";

interface UnifiedPageHeaderProps {
  children: ReactNode;
  className?: string;
  showBorder?: boolean;
  variant?: 'default' | 'transparent';
}

const UnifiedPageHeader = ({
  children,
  className,
  showBorder = true,
  variant = 'default'
}: UnifiedPageHeaderProps) => {
  return (
    <StickyBackground 
      variant="header" 
      className={cn(
        "mobile-safe-header",
        showBorder && "border-b",
        className
      )}
      opacity={variant === 'transparent' ? 'light' : 'medium'}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </div>
    </StickyBackground>
  );
};

export default UnifiedPageHeader;
