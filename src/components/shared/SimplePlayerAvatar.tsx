
import { cn } from "@/lib/utils";

interface SimplePlayerAvatarProps {
  player: {
    id: number;
    name: string;
    team_name: string;
  };
  size?: "small" | "medium" | "large";
  className?: string;
}

const SimplePlayerAvatar = ({ player, size = "medium", className }: SimplePlayerAvatarProps) => {
  const sizeClasses = {
    small: "w-8 h-8 text-xs",
    medium: "w-10 h-10 text-sm",
    large: "w-12 h-12 text-base"
  };

  // Get initials from player name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div 
      className={cn(
        "rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 font-semibold text-primary",
        sizeClasses[size],
        className
      )}
    >
      {getInitials(player.name)}
    </div>
  );
};

export default SimplePlayerAvatar;
