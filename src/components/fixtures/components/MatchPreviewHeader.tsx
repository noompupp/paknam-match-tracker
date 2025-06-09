
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Trophy, TrendingUp } from "lucide-react";
import { Fixture, Team } from "@/types/database";
import { formatDateDisplay, formatTimeDisplay } from "@/utils/timeUtils";
import { RefereeTeamAssignment, refereeAssignmentService } from "@/services/fixtures/refereeAssignmentService";
import TeamLogo from "../../teams/TeamLogo";

interface MatchPreviewHeaderProps {
  fixture: Fixture;
  homeTeam: Team;
  awayTeam: Team;
  refereeAssignment?: RefereeTeamAssignment;
  venue?: string;
}

const MatchPreviewHeader = ({ 
  fixture, 
  homeTeam, 
  awayTeam, 
  refereeAssignment,
  venue 
}: MatchPreviewHeaderProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 hover:bg-green-700';
      case 'live':
        return 'bg-red-600 hover:bg-red-700 animate-pulse';
      case 'scheduled':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-muted hover:bg-muted/80';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Full Time';
      case 'live':
        return 'Live';
      case 'scheduled':
        return 'Scheduled';
      default:
        return status.toUpperCase();
    }
  };

  const getPositionColor = (position: number) => {
    if (position <= 3) return 'text-green-600 font-bold';
    if (position <= 6) return 'text-blue-600 font-semibold';
    if (position <= 9) return 'text-orange-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6 pb-6 border-b border-border/50">
      {/* Match Status and Date Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <Badge className={`${getStatusColor(fixture.status)} text-white font-medium px-4 py-2 text-sm`}>
          {getStatusText(fixture.status)}
        </Badge>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{formatDateDisplay(fixture.match_date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{formatTimeDisplay(fixture.match_time)}</span>
          </div>
        </div>
      </div>

      {/* Enhanced Teams Section - Mobile First */}
      <div className="space-y-6">
        {/* Mobile Layout - Stacked */}
        <div className="block sm:hidden space-y-6">
          {/* Home Team */}
          <div className="bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-lg border border-primary/20">
            <div className="flex items-center gap-4">
              <TeamLogo team={homeTeam} size="large" />
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-2">{homeTeam.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={`text-sm ${getPositionColor(homeTeam.position)}`}>
                    #{homeTeam.position}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {homeTeam.points} pts
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    <span>{homeTeam.won}W</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span>{homeTeam.drawn}D</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span>{homeTeam.lost}L</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border/30">
              <p className="text-xs text-muted-foreground">Home Team</p>
            </div>
          </div>

          {/* Score Section */}
          <div className="text-center py-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border">
            {fixture.status === 'completed' ? (
              <div className="space-y-2">
                <div className="text-4xl font-bold tracking-tight">
                  {fixture.home_score || 0} - {fixture.away_score || 0}
                </div>
                <p className="text-sm text-muted-foreground">Final Score</p>
              </div>
            ) : fixture.status === 'live' ? (
              <div className="space-y-2">
                <div className="text-4xl font-bold tracking-tight text-red-600">
                  {fixture.home_score || 0} - {fixture.away_score || 0}
                </div>
                <p className="text-sm text-red-600 font-medium animate-pulse">LIVE</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold text-muted-foreground">VS</div>
                <p className="text-sm text-muted-foreground">Kick Off</p>
                <p className="text-lg font-semibold">{formatTimeDisplay(fixture.match_time)}</p>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="bg-gradient-to-l from-secondary/5 to-transparent p-4 rounded-lg border border-secondary/20">
            <div className="flex items-center gap-4">
              <TeamLogo team={awayTeam} size="large" />
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-2">{awayTeam.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={`text-sm ${getPositionColor(awayTeam.position)}`}>
                    #{awayTeam.position}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {awayTeam.points} pts
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    <span>{awayTeam.won}W</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span>{awayTeam.drawn}D</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span>{awayTeam.lost}L</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border/30">
              <p className="text-xs text-muted-foreground">Away Team</p>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Side by Side */}
        <div className="hidden sm:block">
          <div className="grid grid-cols-3 gap-6 items-center py-6">
            {/* Home Team */}
            <div className="text-center space-y-3">
              <TeamLogo team={homeTeam} size="large" />
              <div>
                <h3 className="font-bold text-xl mb-2">{homeTeam.name}</h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge variant="outline" className={`text-sm ${getPositionColor(homeTeam.position)}`}>
                    #{homeTeam.position}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {homeTeam.points} pts
                  </span>
                </div>
                <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    <span>{homeTeam.won}W</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span>{homeTeam.drawn}D</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span>{homeTeam.lost}L</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="text-center">
              {fixture.status === 'completed' ? (
                <div className="space-y-2">
                  <div className="text-5xl font-bold tracking-tight">
                    {fixture.home_score || 0} - {fixture.away_score || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Final Score</p>
                </div>
              ) : fixture.status === 'live' ? (
                <div className="space-y-2">
                  <div className="text-5xl font-bold tracking-tight text-red-600">
                    {fixture.home_score || 0} - {fixture.away_score || 0}
                  </div>
                  <p className="text-sm text-red-600 font-medium animate-pulse">LIVE</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-muted-foreground">VS</div>
                  <p className="text-sm text-muted-foreground">Kick Off</p>
                  <p className="text-xl font-semibold">{formatTimeDisplay(fixture.match_time)}</p>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="text-center space-y-3">
              <TeamLogo team={awayTeam} size="large" />
              <div>
                <h3 className="font-bold text-xl mb-2">{awayTeam.name}</h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge variant="outline" className={`text-sm ${getPositionColor(awayTeam.position)}`}>
                    #{awayTeam.position}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {awayTeam.points} pts
                  </span>
                </div>
                <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    <span>{awayTeam.won}W</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span>{awayTeam.drawn}D</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span>{awayTeam.lost}L</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Match Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Venue */}
        {venue && venue !== 'TBD' && (
          <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/30 border border-border/50">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Venue</p>
              <p className="font-medium">{venue}</p>
            </div>
          </div>
        )}

        {/* Referee Assignment */}
        {refereeAssignment && (
          <div className="flex items-center gap-3 text-sm p-3 rounded-lg bg-muted/30 border border-border/50">
            <Users className="h-4 w-4 text-secondary flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Referee Teams</p>
              <p className="font-medium text-xs">
                {refereeAssignmentService.formatRefereeAssignment(refereeAssignment)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchPreviewHeader;
