
import { cn } from "@/lib/utils";
import { usePlatformDetection } from "@/hooks/usePlatformDetection";

interface MobileBottomSpacerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const MobileBottomSpacer = ({
  className,
  size = 'lg'
}: MobileBottomSpacerProps) => {
  const { isMobile } = usePlatformDetection();
  
  if (!isMobile) return null;

  const sizeClasses = {
    sm: "h-16",
    md: "h-20", 
    lg: "h-24",
    xl: "h-32"
  };

  return (
    <div className={cn(
      "mobile-bottom-spacer",
      sizeClasses[size],
      "w-full",
      className
    )} />
  );
};

export default MobileBottomSpacer;
