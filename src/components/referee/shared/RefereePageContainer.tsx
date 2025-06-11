
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { usePlatformDetection } from "@/hooks/usePlatformDetection";

interface RefereePageContainerProps {
  children: ReactNode;
  className?: string;
  spacing?: 'tight' | 'normal' | 'loose';
}

const RefereePageContainer = ({
  children,
  className,
  spacing = 'normal'
}: RefereePageContainerProps) => {
  const { isMobile, isIOS } = usePlatformDetection();
  
  const spacingClasses = {
    tight: "space-y-4",
    normal: "space-y-6", 
    loose: "space-y-8"
  };

  return (
    <div className={cn(
      "gradient-bg w-full overflow-x-hidden min-h-screen",
      isMobile && isIOS && "referee-ios-safe",
      isMobile && !isIOS && "referee-mobile-container mobile-safe-page",
      !isMobile && "min-h-screen",
      className
    )}>
      <div className={cn(
        "referee-content container-responsive",
        spacingClasses[spacing],
        "w-full max-w-none sm:max-w-7xl py-4 sm:py-8"
      )}>
        {children}
      </div>
    </div>
  );
};

export default RefereePageContainer;
