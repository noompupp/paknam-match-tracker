
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
      "bg-gradient-to-br from-primary/10 via-background to-secondary/10",
      "w-full",
      "overflow-x-hidden",
      "min-h-screen",
      isMobile && isIOS && "referee-ios-safe",
      isMobile && !isIOS && "referee-mobile-container",
      !isMobile && "min-h-screen",
      className
    )}>
      <div className={cn(
        "referee-content",
        spacingClasses[spacing],
        "w-full",
        "max-w-none sm:max-w-7xl"
      )}>
        {children}
      </div>
    </div>
  );
};

export default RefereePageContainer;
