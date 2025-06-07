
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
    md: isMobile ? 'h-12 w-12' : 'h-16 w-16',
    lg: isMobile ? 'h-16 w-16' : 'h-20 w-20'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: isMobile ? 'text-sm' : 'text-base',
    lg: isMobile ? 'text-base' : 'text-lg'
  };

  const fallbackTextSize = {
    sm: 'text-xs',
    md: isMobile ? 'text-xs' : 'text-sm',
    lg: isMobile ? 'text-sm' : 'text-lg'
  };

  const gapSize = isMobile ? 'gap-2' : 'gap-3';

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
        <div className="text-center">
          <span className={`${textSizeClasses[size]} font-semibold leading-tight ${isMobile ? 'break-words' : ''}`}>
            {isMobile && teamName.length > 12 ? (
              <>
                {teamName.split(' ').map((word, index) => (
                  <span key={index} className="block">
                    {word}
                  </span>
                ))}
              </>
            ) : (
              teamName
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default TeamLogoDisplay;
