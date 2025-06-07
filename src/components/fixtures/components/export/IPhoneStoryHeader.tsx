
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import TeamLogoDisplay from "../../TeamLogoDisplay";

interface IPhoneStoryHeaderProps {
  fixture: any;
  homeTeamColor: string;
  awayTeamColor: string;
}

const IPhoneStoryHeader = ({ fixture, homeTeamColor, awayTeamColor }: IPhoneStoryHeaderProps) => {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 border-b-2 border-gray-100">
      {/* Teams Layout - Optimized for iPhone */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        {/* Home Team */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <TeamLogoDisplay 
            teamName={fixture.home_team?.name || 'Home'}
            teamLogo={fixture.home_team?.logoURL}
            teamColor={homeTeamColor}
            size="sm"
            showName={false}
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-600 mb-0.5 truncate text-center leading-tight">
              {fixture.home_team?.name || 'Home'}
            </div>
            <div 
              className="text-2xl font-bold leading-none text-center"
              style={{ color: homeTeamColor }}
            >
              {fixture.home_score || 0}
            </div>
          </div>
        </div>

        {/* Center with FULL TIME badge */}
        <div className="px-3 flex flex-col items-center">
          <Badge 
            variant={fixture.status === 'completed' ? 'default' : 'outline'} 
            className="text-xs font-semibold mb-2 px-2 py-1"
          >
            {fixture.status === 'completed' ? 'FULL TIME' : 'LIVE'}
          </Badge>
          <div className="text-lg font-light text-slate-400">VS</div>
        </div>

        {/* Away Team */}
        <div className="flex items-center gap-2 flex-1 min-w-0 flex-row-reverse">
          <TeamLogoDisplay 
            teamName={fixture.away_team?.name || 'Away'}
            teamLogo={fixture.away_team?.logoURL}
            teamColor={awayTeamColor}
            size="sm"
            showName={false}
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-600 mb-0.5 truncate text-center leading-tight">
              {fixture.away_team?.name || 'Away'}
            </div>
            <div 
              className="text-2xl font-bold leading-none text-center"
              style={{ color: awayTeamColor }}
            >
              {fixture.away_score || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Match Info Row - Enhanced with kick-off time */}
      <div className="flex items-center justify-center gap-3 text-xs text-slate-500 pb-3 border-t border-slate-100 pt-2 mx-4">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span className="font-medium">{fixture.match_date}</span>
        </div>
        {fixture.kick_off_time && (
          <>
            <span>•</span>
            <span className="font-medium">KO: {fixture.kick_off_time}</span>
          </>
        )}
        {fixture.venue && (
          <>
            <span>•</span>
            <div className="flex items-center gap-1 truncate max-w-[100px]">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate font-medium">{fixture.venue}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default IPhoneStoryHeader;
