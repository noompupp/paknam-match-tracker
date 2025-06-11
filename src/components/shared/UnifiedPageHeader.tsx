
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import StickyBackground from "@/components/shared/StickyBackground";
import TournamentLogo from "@/components/TournamentLogo";
import LanguageToggle from "@/components/shared/LanguageToggle";

interface UnifiedPageHeaderProps {
  children?: ReactNode;
  className?: string;
  showBorder?: boolean;
  variant?: 'default' | 'transparent';
  title?: string;
  showLanguageToggle?: boolean;
  logoSize?: 'small' | 'medium' | 'large';
}

const UnifiedPageHeader = ({
  children,
  className,
  showBorder = true,
  variant = 'default',
  title,
  showLanguageToggle = true,
  logoSize = 'small'
}: UnifiedPageHeaderProps) => {
  // If title is provided, use the new flex layout
  if (title) {
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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left side: Logo and Title */}
            <div className="flex items-center gap-3">
              <TournamentLogo size={logoSize} />
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h1>
            </div>
            
            {/* Right side: Language Toggle */}
            {showLanguageToggle && (
              <div className="flex items-center">
                <LanguageToggle />
              </div>
            )}
          </div>
        </div>
      </StickyBackground>
    );
  }

  // Fallback to legacy layout for components that haven't been updated yet
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
