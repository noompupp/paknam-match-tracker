
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamLogoDisplayProps {
  teamName?: string;
  teamLogo?: string;
  teamColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  isPremierLeagueStyle?: boolean;
}

const TeamLogoDisplay = ({ 
  teamName = "Team", 
  teamLogo, 
  teamColor = "#3B82F6", 
  size = 'md',
  showName = false,
  isPremierLeagueStyle = false
}: TeamLogoDisplayProps) => {
  // Function to calculate if a color is light or dark
  const isLightColor = (color: string) => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance using the standard formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  // Determine text color based on team color brightness
  const getContrastTextColor = (bgColor: string) => {
    return isLightColor(bgColor) ? '#1f2937' : '#ffffff'; // dark gray or white
  };

  const sizeClasses = {
    sm: 'h-10 w-10 md:h-12 md:w-12',
    md: isPremierLeagueStyle ? 'h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20' : 'h-16 w-16',
    lg: isPremierLeagueStyle ? 'h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24' : 'h-20 w-20',
    xl: 'h-32 w-32 md:h-40 md:w-40'
  };

  const textSizeClasses = {
    sm: 'text-xs md:text-sm',
    md: isPremierLeagueStyle ? 'text-xs md:text-sm lg:text-base' : 'text-base',
    lg: isPremierLeagueStyle ? 'text-sm md:text-base lg:text-lg' : 'text-lg',
    xl: 'text-xl md:text-2xl'
  };

  const fallbackTextSize = {
    sm: 'text-xs md:text-sm',
    md: isPremierLeagueStyle ? 'text-sm md:text-lg lg:text-xl' : 'text-sm',
    lg: isPremierLeagueStyle ? 'text-lg md:text-xl lg:text-2xl' : 'text-lg',
    xl: 'text-2xl md:text-3xl'
  };

  const containerClasses = isPremierLeagueStyle 
    ? `${sizeClasses[size]} border-2 border-gray-200` 
    : `${sizeClasses[size]} shadow-lg ring-2 ring-offset-2 ring-gray-200 rounded-full`;

  const contrastTextColor = getContrastTextColor(teamColor);

  // Enhanced name width for mobile
  const nameContainerClasses = size === 'sm' 
    ? 'w-20 md:w-auto max-w-[120px] md:max-w-none' 
    : 'w-auto max-w-[150px] md:max-w-none';

  return (
    <div className="flex flex-col items-center gap-1 md:gap-2">
      <Avatar 
        className={containerClasses}
        style={isPremierLeagueStyle ? { 
          borderColor: teamColor,
          borderRadius: '8px'
        } : { 
          borderColor: teamColor 
        }}
      >
        {teamLogo && (
          <AvatarImage 
            src={teamLogo} 
            alt={teamName} 
            className={isPremierLeagueStyle ? "object-contain rounded-lg" : "object-cover"}
          />
        )}
        <AvatarFallback 
          className={`font-bold text-white shadow-inner ${fallbackTextSize[size]} ${isPremierLeagueStyle ? 'rounded-lg' : ''}`}
          style={{ 
            backgroundColor: teamColor,
            background: `linear-gradient(135deg, ${teamColor} 0%, ${teamColor}dd 100%)`
          }}
        >
          {teamName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {showName && (
        <div 
          className={`text-center px-2 py-1 rounded-lg relative ${nameContainerClasses} ${isPremierLeagueStyle ? 'font-bold' : ''}`}
          style={isPremierLeagueStyle ? {
            background: `linear-gradient(135deg, ${teamColor} 0%, ${teamColor}bb 100%)`,
            backdropFilter: 'blur(1px)',
            border: `1px solid ${teamColor}33`
          } : {}}
        >
          {/* Enhanced overlay for better text contrast */}
          {isPremierLeagueStyle && (
            <div 
              className="absolute inset-0 rounded-lg"
              style={{
                background: isLightColor(teamColor) 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(0.5px)'
              }}
            />
          )}
          <span 
            className={`${textSizeClasses[size]} font-bold leading-tight text-center block relative z-10`}
            style={isPremierLeagueStyle ? {
              color: contrastTextColor,
              textShadow: isLightColor(teamColor) 
                ? '0 1px 3px rgba(0, 0, 0, 0.4)' 
                : '0 1px 3px rgba(255, 255, 255, 0.4)',
              wordBreak: 'break-word',
              hyphens: 'auto'
            } : {
              wordBreak: 'break-word',
              hyphens: 'auto'
            }}
          >
            {teamName}
          </span>
        </div>
      )}
    </div>
  );
};

export default TeamLogoDisplay;
