
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Whistle } from "lucide-react";
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

  return (
    <div className="space-y-6 pb-6 border-b border-border">
      {/* Match Status and Info Row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Badge className={`${getStatusColor(fixture.status)} text-white font-medium px-3 py-1`}>
          {getStatusText(fixture.status)}
        </Badge>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{formatDateDisplay(fixture.match_date)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{formatTimeDisplay(fixture.match_time)}</span>
          </div>
        </div>
      </div>

      {/* Teams and Score Section */}
      <div className="flex items-center justify-between py-4">
        {/* Home Team */}
        <div className="flex items-center gap-4 flex-1">
          <TeamLogo team={homeTeam} size="large" />
          <div className="text-left">
            <h3 className="font-bold text-xl mb-1">{homeTeam.name}</h3>
            <p className="text-sm text-muted-foreground">Home</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                #{homeTeam.position}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {homeTeam.points} pts
              </span>
            </div>
          </div>
        </div>

        {/* Score or Time */}
        <div className="px-6 text-center flex-shrink-0">
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
              <div className="text-2xl font-bold text-muted-foreground">
                VS
              </div>
              <p className="text-sm text-muted-foreground">Kick Off</p>
              <p className="text-lg font-semibold">{formatTimeDisplay(fixture.match_time)}</p>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="text-right">
            <h3 className="font-bold text-xl mb-1">{awayTeam.name}</h3>
            <p className="text-sm text-muted-foreground">Away</p>
            <div className="flex items-center gap-2 mt-1 justify-end">
              <span className="text-xs text-muted-foreground">
                {awayTeam.points} pts
              </span>
              <Badge variant="outline" className="text-xs">
                #{awayTeam.position}
              </Badge>
            </div>
          </div>
          <TeamLogo team={awayTeam} size="large" />
        </div>
      </div>

      {/* Additional Match Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        {/* Venue */}
        {venue && venue !== 'TBD' && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Venue</p>
              <p className="font-medium">{venue}</p>
            </div>
          </div>
        )}

        {/* Referee Assignment */}
        {refereeAssignment && (
          <div className="flex items-center gap-2 text-sm">
            <Whistle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
