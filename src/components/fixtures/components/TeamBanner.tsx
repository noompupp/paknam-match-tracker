
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

  // Enhanced background styling with stronger gradients
  const getBackgroundStyle = () => {
    if (!team.color) {
      return {};
    }
    
    // Create stronger, more vibrant gradients using team colors
    const teamColor = team.color;
    const lightOpacity = 'rgba(' + hexToRgb(teamColor) + ', 0.25)'; // Increased from 0.12
    const mediumOpacity = 'rgba(' + hexToRgb(teamColor) + ', 0.15)'; // Increased from 0.06
    const softOpacity = 'rgba(' + hexToRgb(teamColor) + ', 0.08)'; // Increased from 0.02
    const borderOpacity = 'rgba(' + hexToRgb(teamColor) + ', 0.35)'; // Increased from 0.2
    
    return {
      background: variant === 'home' 
        ? `linear-gradient(135deg, ${lightOpacity} 0%, ${mediumOpacity} 40%, ${softOpacity} 100%)`
        : `linear-gradient(225deg, ${lightOpacity} 0%, ${mediumOpacity} 40%, ${softOpacity} 100%)`,
      borderColor: borderOpacity
    };
  };

  const getBackgroundClassName = () => {
    if (team.color) {
      return 'border-opacity-20';
    }
    
    return variant === 'home' 
      ? 'bg-gradient-to-br from-primary/20 via-primary/12 to-primary/6 border-primary/30' 
      : 'bg-gradient-to-bl from-secondary/20 via-secondary/12 to-secondary/6 border-secondary/30';
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
      {/* Enhanced decorative elements with stronger opacity */}
      <div className="absolute inset-0 opacity-15">
        <div className={`absolute ${shouldReverse ? '-top-4 -left-4' : '-top-4 -right-4'} w-24 h-24 rounded-full ${
          variant === 'home' ? 'bg-primary' : 'bg-secondary'
        }`} style={isTeamColored ? { backgroundColor: team.color } : {}} />
        <div className={`absolute ${shouldReverse ? '-bottom-2 -right-2' : '-bottom-2 -left-2'} w-16 h-16 rounded-full ${
          variant === 'home' ? 'bg-primary' : 'bg-secondary'
        }`} style={isTeamColored ? { backgroundColor: team.color } : {}} />
      </div>

      {/* Premier League-style accent line */}
      <div 
        className={`absolute ${shouldReverse ? 'left-0' : 'right-0'} top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-current to-transparent opacity-30`}
        style={isTeamColored ? { color: team.color } : {}}
      />

      <div className="relative p-5">
        <div className={`flex items-center gap-4 ${flexDirection}`}>
          <div className="relative">
            <TeamLogo team={team} size="large" showColor={true} />
            {/* Enhanced glow effect around logo */}
            <div 
              className="absolute inset-0 rounded-full blur-xl opacity-40 -z-10"
              style={isTeamColored ? { backgroundColor: team.color } : {}}
            />
          </div>
          
          <div className={`flex-1 min-w-0 ${shouldReverse ? 'text-right' : ''}`}>
            <h3 className="font-bold text-xl mb-3 truncate text-foreground">
              {team.name}
            </h3>
            
            {/* Enhanced Position and Points Row */}
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

            {/* Enhanced Record Stats with better spacing */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-background/60 backdrop-blur-sm border border-border/30">
                <Trophy className="h-4 w-4 text-green-600" />
                <span className="font-bold text-lg">{team.won}</span>
                <span className="text-muted-foreground text-xs">Wins</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-background/60 backdrop-blur-sm border border-border/30">
                <div className="w-4 h-4 bg-yellow-500 rounded-full border border-yellow-600"></div>
                <span className="font-bold text-lg">{team.drawn}</span>
                <span className="text-muted-foreground text-xs">Draws</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-background/60 backdrop-blur-sm border border-border/30">
                <div className="w-4 h-4 bg-red-500 rounded-full border border-red-600"></div>
                <span className="font-bold text-lg">{team.lost}</span>
                <span className="text-muted-foreground text-xs">Losses</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Team Label with accent styling */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className={`flex items-center justify-between ${shouldReverse ? 'flex-row-reverse' : ''}`}>
            <p className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
              {variant === 'home' ? 'Home Team' : 'Away Team'}
            </p>
            {/* Enhanced team color indicator */}
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
