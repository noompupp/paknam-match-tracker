
import { Badge } from "@/components/ui/badge";
import { Trophy, MapPin, Calendar } from "lucide-react";
import TeamLogoDisplay from "../../TeamLogoDisplay";

interface MobileExportHeaderProps {
  fixture: any;
  homeTeamColor: string;
  awayTeamColor: string;
}

const MobileExportHeader = ({
  fixture,
  homeTeamColor,
  awayTeamColor
}: MobileExportHeaderProps) => {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 border-b-2 border-gray-100">
      {/* Match Status Badge */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border">
          <Trophy className="h-4 w-4 text-amber-500" />
          <Badge variant="outline" className="text-sm font-bold border-0 bg-transparent">
            {fixture.status === 'completed' ? 'FULL TIME' : 'LIVE MATCH'}
          </Badge>
        </div>
      </div>
      
      {/* Teams Layout - Horizontal with proper spacing */}
      <div className="flex items-center justify-between mb-4">
        {/* Home Team - Left Aligned */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <TeamLogoDisplay 
            teamName={fixture.home_team?.name || 'Home'}
            teamLogo={fixture.home_team?.logoURL}
            teamColor={homeTeamColor}
            size="md"
            showName={false}
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-600 mb-1 truncate">
              {fixture.home_team?.name || 'Home'}
            </div>
            <div 
              className="text-3xl font-bold leading-none"
              style={{ color: homeTeamColor }}
            >
              {fixture.home_score || 0}
            </div>
          </div>
        </div>

        {/* Score Separator */}
        <div className="px-4 flex items-center">
          <div className="text-2xl font-light text-slate-400">—</div>
        </div>

        {/* Away Team - Right Aligned */}
        <div className="flex items-center gap-3 flex-1 min-w-0 flex-row-reverse">
          <TeamLogoDisplay 
            teamName={fixture.away_team?.name || 'Away'}
            teamLogo={fixture.away_team?.logoURL}
            teamColor={awayTeamColor}
            size="md"
            showName={false}
          />
          <div className="flex-1 min-w-0 text-right">
            <div className="text-xs font-medium text-slate-600 mb-1 truncate">
              {fixture.away_team?.name || 'Away'}
            </div>
            <div 
              className="text-3xl font-bold leading-none"
              style={{ color: awayTeamColor }}
            >
              {fixture.away_score || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Match Info Row */}
      <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{fixture.match_date}</span>
        </div>
        {fixture.venue && (
          <>
            <span>•</span>
            <div className="flex items-center gap-1 truncate max-w-[150px]">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{fixture.venue}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileExportHeader;
