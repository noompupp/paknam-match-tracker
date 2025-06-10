
import { cn } from "@/lib/utils";
import { getResponsiveTeamName } from "@/utils/teamNameUtils";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";

interface ResponsiveTeamNameProps {
  teamName: string;
  className?: string;
  variant?: 'full' | 'mobile' | 'compact' | 'auto';
  maxLength?: number;
}

const ResponsiveTeamName = ({ 
  teamName, 
  className,
  variant = 'auto',
  maxLength
}: ResponsiveTeamNameProps) => {
  const { isMobile, isPortrait } = useDeviceOrientation();
  const responsiveNames = getResponsiveTeamName(teamName);

  const getDisplayName = () => {
    switch (variant) {
      case 'full':
        return responsiveNames.full;
      case 'mobile':
        return responsiveNames.mobile;
      case 'compact':
        return responsiveNames.compact;
      case 'auto':
      default:
        // Auto-select based on device and orientation
        if (isMobile && isPortrait) {
          return responsiveNames.mobile;
        } else if (isMobile) {
          return responsiveNames.mobile;
        }
        return responsiveNames.full;
    }
  };

  const displayName = getDisplayName();
  const finalName = maxLength && displayName.length > maxLength 
    ? displayName.substring(0, maxLength - 1) + '…'
    : displayName;

  return (
    <span className={cn("truncate", className)} title={responsiveNames.full}>
      {finalName}
    </span>
  );
};

export default ResponsiveTeamName;
