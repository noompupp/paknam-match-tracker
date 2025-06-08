
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
      "referee-full-background",
      isMobile && isIOS && "referee-ios-safe",
      isMobile && !isIOS && "referee-mobile-container",
      !isMobile && "min-h-screen bg-background",
      className
    )}>
      <div className={cn(
        "referee-content",
        spacingClasses[spacing]
      )}>
        {children}
      </div>
    </div>
  );
};

export default RefereePageContainer;
