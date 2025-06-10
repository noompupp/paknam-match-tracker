
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { Team } from "@/types/database";
import TeamLogo from "../../teams/TeamLogo";

interface TeamBannerProps {
  team: Team;
  variant: 'home' | 'away';
  className?: string;
}

const TeamBanner = ({ team, variant, className = "" }: TeamBannerProps) => {
  const getPositionColor = (position: number) => {
    if (position <= 3) return 'text-green-600 font-bold';
    if (position <= 6) return 'text-blue-600 font-semibold';
    if (position <= 9) return 'text-orange-600';
    return 'text-muted-foreground';
  };

  const bannerGradient = variant === 'home' 
    ? 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20' 
    : 'bg-gradient-to-l from-secondary/10 via-secondary/5 to-transparent border-secondary/20';

  return (
    <div className={`${bannerGradient} border rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-4">
        <TeamLogo team={team} size="large" />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg mb-2 truncate">{team.name}</h3>
          
          {/* Position and Points Row */}
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="outline" className={`text-sm ${getPositionColor(team.position)}`}>
              #{team.position}
            </Badge>
            <span className="text-sm text-muted-foreground font-medium">
              {team.points} pts
            </span>
          </div>

          {/* Record Stats */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-1">
              <Trophy className="h-3 w-3 text-green-600" />
              <span className="font-medium">{team.won}</span>
              <span className="text-muted-foreground">W</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="font-medium">{team.drawn}</span>
              <span className="text-muted-foreground">D</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="font-medium">{team.lost}</span>
              <span className="text-muted-foreground">L</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Team Label */}
      <div className="mt-3 pt-3 border-t border-border/30">
        <p className="text-xs text-muted-foreground font-medium">
          {variant === 'home' ? 'Home Team' : 'Away Team'}
        </p>
      </div>
    </div>
  );
};

export default TeamBanner;
