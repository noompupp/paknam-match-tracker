
import React from "react";
import ScrollSafeContainer from "@/components/ui/scroll-safe-container";
import { cn } from "@/lib/utils";

interface RefereePageContainerProps {
  children: React.ReactNode;
  className?: string;
}

const RefereePageContainer = ({ children, className }: RefereePageContainerProps) => {
  return (
    <ScrollSafeContainer 
      className={cn(
        "referee-page-container",
        "px-4 md:px-6 lg:px-8",
        "py-4 md:py-6",
        "space-y-4 md:space-y-6",
        "min-h-screen",
        className
      )}
      enableTopSafePadding={true}
      enableBottomSafePadding={true}
    >
      <div className="mx-auto max-w-7xl w-full">
        {children}
      </div>
    </ScrollSafeContainer>
  );
};

export default RefereePageContainer;
