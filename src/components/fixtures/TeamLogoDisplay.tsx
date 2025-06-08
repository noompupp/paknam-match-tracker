
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
    sm: 'h-10 w-10',
    md: isMobile ? 'h-16 w-16' : 'h-16 w-16',
    lg: isMobile ? 'h-20 w-20' : 'h-24 w-24'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: isMobile ? 'text-base' : 'text-base',
    lg: isMobile ? 'text-lg' : 'text-lg'
  };

  const fallbackTextSize = {
    sm: 'text-xs',
    md: isMobile ? 'text-base' : 'text-base',
    lg: isMobile ? 'text-xl' : 'text-2xl'
  };

  const gapSize = isMobile ? 'gap-3' : 'gap-3';

  // Enhanced team name formatting for mobile
  const formatTeamName = (name: string) => {
    if (!isMobile || name.length <= 14) return name;
    
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
      {/* Enhanced logo display with better mobile sizing */}
      <div className={`${sizeClasses[size]} flex items-center justify-center premier-card-shadow`}>
        {teamLogo ? (
          <img 
            src={teamLogo} 
            alt={teamName} 
            className={`${sizeClasses[size]} object-cover rounded-lg`}
          />
        ) : (
          <div 
            className={`${sizeClasses[size]} rounded-lg flex items-center justify-center font-bold text-white ${fallbackTextSize[size]} premier-card-shadow`}
            style={{ 
              backgroundColor: teamColor,
              background: `linear-gradient(135deg, ${teamColor} 0%, ${teamColor}dd 100%)`
            }}
          >
            {teamName.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      {showName && (
        <div className="text-center max-w-[140px]">
          {isMultiLine ? (
            <div className={`${textSizeClasses[size]} font-semibold leading-tight`}>
              <div className="break-words">{formattedName.firstLine}</div>
              <div className="break-words">{formattedName.secondLine}</div>
            </div>
          ) : (
            <span className={`${textSizeClasses[size]} font-semibold leading-tight break-words`}>
              {formattedName}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamLogoDisplay;
