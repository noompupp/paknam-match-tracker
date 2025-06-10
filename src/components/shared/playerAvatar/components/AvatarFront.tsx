
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Member } from "@/types/database";
import { cn } from "@/lib/utils";
import { sizeClasses, badgeSizeClasses, getPlayerInitials } from "../utils/styleUtils";

interface AvatarFrontProps {
  player: Member;
  size: keyof typeof sizeClasses;
}

const AvatarFront = ({ player, size }: AvatarFrontProps) => {
  const displayNumber = player.number || '?';

  return (
    <div className="absolute inset-0 backface-hidden">
      {player.ProfileURL ? (
        <Avatar className={cn(sizeClasses[size], "border-2 border-primary/20")}>
          <AvatarImage src={player.ProfileURL} alt={player.name || 'Player'} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
            {getPlayerInitials(player.name || 'Player')}
          </AvatarFallback>
        </Avatar>
      ) : (
        <Badge 
          variant="outline" 
          className={cn(
            badgeSizeClasses[size],
            "rounded-full flex items-center justify-center font-bold bg-gradient-to-br from-primary/20 to-primary/10 border-primary/20 text-primary"
          )}
        >
          {displayNumber}
        </Badge>
      )}
    </div>
  );
};

export default AvatarFront;
