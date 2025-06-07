
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { Fixture } from "@/types/database";
import { formatDateDisplay } from "@/utils/timeUtils";
import TeamLogo from "../teams/TeamLogo";

interface FixtureCardProps {
  fixture: Fixture;
  onClick?: (fixture: Fixture) => void;
  showDate?: boolean;
  className?: string;
}

const FixtureCard = ({ fixture, onClick, showDate = true, className = "" }: FixtureCardProps) => {
  const handleClick = () => {
    if (onClick && fixture.status === 'completed') {
      onClick(fixture);
    }
  };

  return (
    <div 
      className={`relative p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-all duration-200 ${
        fixture.status === 'completed' ? 'cursor-pointer group hover:shadow-md border border-transparent hover:border-muted-foreground/20' : ''
      } ${className}`}
      onClick={handleClick}
    >
      {/* Match date - top right */}
      {showDate && (
        <div className="absolute top-3 right-3 text-xs text-muted-foreground">
          {formatDateDisplay(fixture.match_date)}
        </div>
      )}
      
      {/* Eye icon - top right, appears on hover for completed matches */}
      {fixture.status === 'completed' && (
        <div className="absolute top-3 right-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <Eye className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      
      {/* Main match content - centered */}
      <div className="flex items-center justify-center gap-8">
        {/* Home team */}
        <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
          <span className="font-medium text-sm truncate">
            {fixture.home_team?.name || 'TBD'}
          </span>
          <TeamLogo team={fixture.home_team} size="small" />
        </div>
        
        {/* Score */}
        <div className="flex items-center justify-center">
          <Badge variant="outline" className="px-4 py-2 font-bold text-lg min-w-[80px] text-center">
            {fixture.home_score || 0} - {fixture.away_score || 0}
          </Badge>
        </div>
        
        {/* Away team */}
        <div className="flex items-center gap-3 min-w-0 flex-1 justify-start">
          <TeamLogo team={fixture.away_team} size="small" />
          <span className="font-medium text-sm truncate">
            {fixture.away_team?.name || 'TBD'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FixtureCard;
