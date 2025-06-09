
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Eye, Info } from "lucide-react";
import TeamLogo from "../teams/TeamLogo";
import { formatDate, formatTime } from "@/utils/fixtureUtils";

interface FixtureCardProps {
  fixture: any;
  showScore?: boolean;
  onFixtureClick?: (fixture: any) => void;
  onPreviewClick?: (fixture: any) => void;
}

const FixtureCard = ({ 
  fixture, 
  showScore = false, 
  onFixtureClick,
  onPreviewClick 
}: FixtureCardProps) => {
  
  const handleCardClick = () => {
    // Always open preview for any fixture
    if (onPreviewClick) {
      onPreviewClick(fixture);
    } else if (fixture.status === 'completed' && onFixtureClick) {
      // Fallback to match summary for completed fixtures
      onFixtureClick(fixture);
    }
  };

  const handleSummaryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fixture.status === 'completed' && onFixtureClick) {
      onFixtureClick(fixture);
    }
  };

  return (
    <Card 
      className="card-shadow-lg hover:card-shadow-lg hover:scale-105 transition-all duration-300 relative group cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {formatDate(fixture.match_date)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={fixture.status === 'completed' ? 'default' : 'outline'}>
              {fixture.status}
            </Badge>
            
            {/* Match Summary Button for completed matches */}
            {fixture.status === 'completed' && (
              <button
                onClick={handleSummaryClick}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-muted/50"
                aria-label="View match summary"
              >
                <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Teams */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <TeamLogo team={fixture.home_team} size="small" />
              <div>
                <p className="font-semibold">{fixture.home_team?.name || 'TBD'}</p>
                <p className="text-xs text-muted-foreground">Home</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mx-4">
              {showScore && fixture.status === 'completed' ? (
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {fixture.home_score || 0} - {fixture.away_score || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Final</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3" />
                    {formatTime(fixture.match_time)}
                  </div>
                  <p className="text-xs text-muted-foreground">Kick off</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 flex-1 justify-end">
              <div className="text-right">
                <p className="font-semibold">{fixture.away_team?.name || 'TBD'}</p>
                <p className="text-xs text-muted-foreground">Away</p>
              </div>
              <TeamLogo team={fixture.away_team} size="small" />
            </div>
          </div>

          {/* Venue */}
          {fixture.venue && fixture.venue !== 'TBD' && (
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{fixture.venue}</span>
            </div>
          )}

          {/* Click hints */}
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Tap card for match preview</span>
            {fixture.status === 'completed' && (
              <span>Tap eye icon for match summary</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FixtureCard;
