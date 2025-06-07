
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
    sm: 'h-10 w-10',
    md: isMobile ? 'h-14 w-14' : 'h-16 w-16',
    lg: isMobile ? 'h-18 w-18' : 'h-20 w-20'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: isMobile ? 'text-base' : 'text-base',
    lg: isMobile ? 'text-lg' : 'text-lg'
  };

  const fallbackTextSize = {
    sm: 'text-xs',
    md: isMobile ? 'text-sm' : 'text-sm',
    lg: isMobile ? 'text-base' : 'text-lg'
  };

  const gapSize = isMobile ? 'gap-3' : 'gap-3';

  // Break long team names into multiple lines on mobile
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
        className={`${sizeClasses[size]} shadow-lg ring-2 ring-offset-2 ring-gray-200`} 
        style={{ 
          borderColor: teamColor
        }}
      >
        {teamLogo && (
          <AvatarImage 
            src={teamLogo} 
            alt={teamName} 
            className="object-cover"
          />
        )}
        <AvatarFallback 
          className={`font-bold text-white shadow-inner ${fallbackTextSize[size]}`}
          style={{ 
            backgroundColor: teamColor,
            background: `linear-gradient(135deg, ${teamColor} 0%, ${teamColor}dd 100%)`
          }}
        >
          {teamName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {showName && (
        <div className="text-center max-w-[120px]">
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
