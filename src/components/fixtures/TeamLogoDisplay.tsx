
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar className={sizeClasses[size]} style={{ borderColor: teamColor, borderWidth: '2px' }}>
        {teamLogo && <AvatarImage src={teamLogo} alt={teamName} />}
        <AvatarFallback 
          className="font-bold text-white"
          style={{ backgroundColor: teamColor }}
        >
          {teamName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {showName && (
        <span className={`${textSizeClasses[size]} font-medium text-center`}>
          {teamName}
        </span>
      )}
    </div>
  );
};

export default TeamLogoDisplay;
