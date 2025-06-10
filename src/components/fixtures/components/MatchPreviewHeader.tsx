
import { MapPin, Users } from "lucide-react";
import { Fixture, Team } from "@/types/database";
import { RefereeTeamAssignment, refereeAssignmentService } from "@/services/fixtures/refereeAssignmentService";
import TeamBanner from "./TeamBanner";
import KickoffSection from "./KickoffSection";

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
  return (
    <div className="space-y-6 pb-6 border-b border-border/50">
      {/* Mobile-First Dual Banner Layout */}
      <div className="space-y-4">
        {/* Home Team Banner */}
        <TeamBanner 
          team={homeTeam} 
          variant="home"
          className="w-full"
        />

        {/* Kickoff Section */}
        <KickoffSection 
          fixture={fixture}
          className="w-full"
        />

        {/* Away Team Banner */}
        <TeamBanner 
          team={awayTeam} 
          variant="away"
          className="w-full"
        />
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
