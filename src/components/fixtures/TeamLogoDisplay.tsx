
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
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: isPremierLeagueStyle ? 'h-32 w-32' : 'h-20 w-20',
    xl: 'h-40 w-40'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: isPremierLeagueStyle ? 'text-xl' : 'text-lg',
    xl: 'text-2xl'
  };

  const fallbackTextSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: isPremierLeagueStyle ? 'text-2xl' : 'text-lg',
    xl: 'text-3xl'
  };

  const containerClasses = isPremierLeagueStyle 
    ? `${sizeClasses[size]} border-2 border-gray-200` 
    : `${sizeClasses[size]} shadow-lg ring-2 ring-offset-2 ring-gray-200 rounded-full`;

  return (
    <div className="flex flex-col items-center gap-3">
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
          className={`text-center px-4 py-2 rounded-lg ${isPremierLeagueStyle ? 'font-bold text-white' : ''}`}
          style={isPremierLeagueStyle ? {
            background: `linear-gradient(135deg, ${teamColor} 0%, ${teamColor}cc 100%)`
          } : {}}
        >
          <span className={`${textSizeClasses[size]} font-semibold leading-tight`}>
            {teamName}
          </span>
        </div>
      )}
    </div>
  );
};

export default TeamLogoDisplay;
