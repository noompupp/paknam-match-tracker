
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

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '59, 130, 246'; // fallback blue
  };

  // Premier League-style diagonal gradient background
  const getBackgroundStyle = () => {
    if (!team.color) {
      return {};
    }
    
    const teamColor = team.color;
    const primaryOpacity = 'rgba(' + hexToRgb(teamColor) + ', 0.15)';
    const secondaryOpacity = 'rgba(' + hexToRgb(teamColor) + ', 0.25)';
    const accentOpacity = 'rgba(' + hexToRgb(teamColor) + ', 0.08)';
    
    // Premier League-style diagonal stripe pattern
    return {
      background: variant === 'home' 
        ? `linear-gradient(135deg, ${secondaryOpacity} 0%, ${primaryOpacity} 25%, ${accentOpacity} 50%, ${primaryOpacity} 75%, ${secondaryOpacity} 100%)`
        : `linear-gradient(-135deg, ${secondaryOpacity} 0%, ${primaryOpacity} 25%, ${accentOpacity} 50%, ${primaryOpacity} 75%, ${secondaryOpacity} 100%)`,
      borderColor: `rgba(${hexToRgb(teamColor)}, 0.3)`
    };
  };

  const getBackgroundClassName = () => {
    if (team.color) {
      return 'border-opacity-30';
    }
    
    return variant === 'home' 
      ? 'bg-gradient-to-br from-primary/15 via-primary/8 to-primary/15 border-primary/30' 
      : 'bg-gradient-to-bl from-secondary/15 via-secondary/8 to-secondary/15 border-secondary/30';
  };

  const backgroundStyle = getBackgroundStyle();
  const backgroundClassName = getBackgroundClassName();
  const isTeamColored = !!team.color;

  // Determine if we should reverse the layout for away team
  const shouldReverse = variant === 'away';
  const flexDirection = shouldReverse ? 'flex-row-reverse' : '';

  return (
    <div 
      className={`relative overflow-hidden rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${backgroundClassName} ${className}`}
      style={backgroundStyle}
    >
      {/* Premier League-style diagonal accent stripes */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className={`absolute inset-0 ${variant === 'home' ? 'bg-gradient-to-br' : 'bg-gradient-to-bl'} from-transparent via-current to-transparent`}
          style={isTeamColored ? { color: team.color } : {}}
        />
        {/* Additional diagonal pattern for depth */}
        <div 
          className={`absolute ${shouldReverse ? 'top-0 left-0' : 'top-0 right-0'} w-32 h-32 opacity-20 transform ${shouldReverse ? 'rotate-45' : '-rotate-45'}`}
          style={isTeamColored ? { 
            background: `linear-gradient(45deg, transparent 40%, ${team.color} 50%, transparent 60%)`
          } : {}}
        />
      </div>

      {/* Premier League-style side accent */}
      <div 
        className={`absolute ${shouldReverse ? 'left-0' : 'right-0'} top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-current to-transparent opacity-40`}
        style={isTeamColored ? { color: team.color } : {}}
      />

      <div className="relative p-5">
        <div className={`flex items-center gap-4 ${flexDirection}`}>
          <div className="relative">
            <TeamLogo team={team} size="large" showColor={true} />
            {/* Enhanced logo glow */}
            <div 
              className="absolute inset-0 rounded-full blur-lg opacity-30 -z-10"
              style={isTeamColored ? { backgroundColor: team.color } : {}}
            />
          </div>
          
          <div className={`flex-1 min-w-0 ${shouldReverse ? 'text-right' : ''}`}>
            <h3 className="font-bold text-xl mb-3 truncate text-foreground">
              {team.name}
            </h3>
            
            {/* Position and Points Row */}
            <div className={`flex items-center gap-4 mb-4 ${shouldReverse ? 'flex-row-reverse' : ''}`}>
              <Badge 
                variant="outline" 
                className={`text-sm border-2 px-3 py-1 font-semibold ${getPositionColor(team.position)}`}
                style={isTeamColored ? { 
                  borderColor: team.color + '60',
                  backgroundColor: team.color + '15'
                } : {}}
              >
                #{team.position}
              </Badge>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {team.points}
                </span>
                <span className="text-sm text-muted-foreground font-medium">
                  points
                </span>
              </div>
            </div>

            {/* Record Stats - Mobile optimized labels */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-background/60 backdrop-blur-sm border border-border/30">
                <Trophy className="h-4 w-4 text-green-600" />
                <span className="font-bold text-lg">{team.won}</span>
                <span className="text-muted-foreground text-xs hidden sm:inline">Wins</span>
                <span className="text-muted-foreground text-xs sm:hidden">W</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-background/60 backdrop-blur-sm border border-border/30">
                <div className="w-4 h-4 bg-yellow-500 rounded-full border border-yellow-600"></div>
                <span className="font-bold text-lg">{team.drawn}</span>
                <span className="text-muted-foreground text-xs hidden sm:inline">Draws</span>
                <span className="text-muted-foreground text-xs sm:hidden">D</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-background/60 backdrop-blur-sm border border-border/30">
                <div className="w-4 h-4 bg-red-500 rounded-full border border-red-600"></div>
                <span className="font-bold text-lg">{team.lost}</span>
                <span className="text-muted-foreground text-xs hidden sm:inline">Losses</span>
                <span className="text-muted-foreground text-xs sm:hidden">L</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Team Label */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className={`flex items-center justify-between ${shouldReverse ? 'flex-row-reverse' : ''}`}>
            <p className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
              {variant === 'home' ? 'Home Team' : 'Away Team'}
            </p>
            {team.color && (
              <div 
                className="w-4 h-4 rounded-full border-2 border-white/30 shadow-lg"
                style={{ backgroundColor: team.color }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamBanner;
