
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

interface TeamLogoDisplayProps {
  teamName?: string;
  teamLogo?: string;
  teamColor?: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

const TeamLogoDisplay = ({ 
  teamName = "Team", 
  teamLogo, 
  teamColor = "#3B82F6", 
  size = 'md',
  showName = false 
}: TeamLogoDisplayProps) => {
  const isMobile = useIsMobile();

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: isMobile ? 'h-16 w-16' : 'h-18 w-18',
    lg: isMobile ? 'h-20 w-20' : 'h-24 w-24'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: isMobile ? 'text-base' : 'text-base',
    lg: isMobile ? 'text-lg' : 'text-lg'
  };

  const fallbackTextSize = {
    sm: 'text-xs',
    md: isMobile ? 'text-sm' : 'text-base',
    lg: isMobile ? 'text-base' : 'text-lg'
  };

  const gapSize = isMobile ? 'gap-3' : 'gap-3';

  // Enhanced team logo source handling
  const getTeamLogoSource = () => {
    if (teamLogo) {
      // Handle different possible logo field names
      if (typeof teamLogo === 'string' && teamLogo.trim() !== '') {
        return teamLogo;
      }
    }
    return null;
  };

  const logoSource = getTeamLogoSource();

  // Break long team names into multiple lines on mobile if needed
  const formatTeamName = (name: string) => {
    if (!isMobile || name.length <= 12) return name;
    
    const words = name.split(' ');
    if (words.length === 1) return name;
    
    // Split into two lines for better mobile display
    const midPoint = Math.ceil(words.length / 2);
    const firstLine = words.slice(0, midPoint).join(' ');
    const secondLine = words.slice(midPoint).join(' ');
    
    return { firstLine, secondLine };
  };

  const formattedName = formatTeamName(teamName);
  const isMultiLine = typeof formattedName === 'object';

  return (
    <div className={`flex flex-col items-center ${gapSize}`}>
      <Avatar 
        className={`${sizeClasses[size]} shadow-lg ring-2 ring-offset-2 ring-white/20 bg-white`}
      >
        {logoSource && (
          <AvatarImage 
            src={logoSource} 
            alt={teamName} 
            className="object-contain p-1"
            onError={(e) => {
              console.log('Team logo failed to load:', logoSource);
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <AvatarFallback 
          className={`font-bold text-slate-700 shadow-inner ${fallbackTextSize[size]} bg-white`}
        >
          ⚽
        </AvatarFallback>
      </Avatar>
      {showName && (
        <div className="text-center max-w-[120px]">
          {isMultiLine ? (
            <div className={`${textSizeClasses[size]} font-semibold leading-tight text-center`}>
              <div className="break-words">{formattedName.firstLine}</div>
              <div className="break-words">{formattedName.secondLine}</div>
            </div>
          ) : (
            <span className={`${textSizeClasses[size]} font-semibold leading-tight break-words text-center block`}>
              {formattedName}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamLogoDisplay;
