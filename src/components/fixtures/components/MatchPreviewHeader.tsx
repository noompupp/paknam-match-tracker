
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Fixture, Team } from "@/types/database";
import { formatDateDisplay, formatTimeDisplay } from "@/utils/timeUtils";
import TeamLogo from "../../teams/TeamLogo";

interface MatchPreviewHeaderProps {
  fixture: Fixture;
  homeTeam: Team;
  awayTeam: Team;
}

const MatchPreviewHeader = ({ fixture, homeTeam, awayTeam }: MatchPreviewHeaderProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600';
      case 'live':
        return 'bg-red-600';
      case 'scheduled':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* Match Status */}
      <div className="flex items-center justify-between">
        <Badge className={`${getStatusColor(fixture.status)} text-white`}>
          {fixture.status.toUpperCase()}
        </Badge>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDateDisplay(fixture.match_date)}</span>
        </div>
      </div>

      {/* Teams and Score */}
      <div className="flex items-center justify-between py-6">
        <div className="flex items-center gap-3 flex-1">
          <TeamLogo team={homeTeam} size="large" />
          <div className="text-center">
            <h3 className="font-bold text-lg">{homeTeam.name}</h3>
            <p className="text-sm text-muted-foreground">Home</p>
          </div>
        </div>

        <div className="px-6 text-center">
          {fixture.status === 'completed' ? (
            <div className="text-3xl font-bold">
              {fixture.home_score || 0} - {fixture.away_score || 0}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Clock className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium">{formatTimeDisplay(fixture.match_time)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="text-center">
            <h3 className="font-bold text-lg">{awayTeam.name}</h3>
            <p className="text-sm text-muted-foreground">Away</p>
          </div>
          <TeamLogo team={awayTeam} size="large" />
        </div>
      </div>

      {/* Venue */}
      {fixture.venue && fixture.venue !== 'TBD' && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{fixture.venue}</span>
        </div>
      )}
    </div>
  );
};

export default MatchPreviewHeader;
