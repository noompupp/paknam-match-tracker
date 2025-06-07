
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, MapPin } from "lucide-react";
import TeamLogoDisplay from "../../TeamLogoDisplay";

interface IPhoneStoryHeaderProps {
  fixture: any;
  homeTeamColor: string;
  awayTeamColor: string;
}

const IPhoneStoryHeader = ({ fixture, homeTeamColor, awayTeamColor }: IPhoneStoryHeaderProps) => {
  return (
    <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-purple-600 text-white">
      {/* Status Badge */}
      <div className="flex items-center justify-center pt-4 pb-3">
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30">
          <Trophy className="h-3 w-3 text-yellow-300" />
          <Badge variant="outline" className="text-xs font-semibold border-0 bg-transparent text-white">
            {fixture.status === 'completed' ? 'FULL TIME' : 'LIVE MATCH'}
          </Badge>
        </div>
      </div>
      
      {/* Teams Layout - Optimized for iPhone */}
      <div className="flex items-center justify-between px-4 pb-3">
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
            <div className="text-xs font-medium text-purple-100 mb-0.5 truncate text-center leading-tight">
              {fixture.home_team?.name || 'Home'}
            </div>
            <div className="text-3xl font-bold leading-none text-center text-white">
              {fixture.home_score || 0}
            </div>
          </div>
        </div>

        {/* Score Separator */}
        <div className="px-3 flex items-center">
          <div className="text-xl font-light text-purple-200">—</div>
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
            <div className="text-xs font-medium text-purple-100 mb-0.5 truncate text-center leading-tight">
              {fixture.away_team?.name || 'Away'}
            </div>
            <div className="text-3xl font-bold leading-none text-center text-white">
              {fixture.away_score || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Match Info Row - Optimized spacing */}
      <div className="flex items-center justify-center gap-3 text-xs text-purple-100 pb-3 border-t border-purple-400/30 pt-2 mx-4">
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span className="font-medium">{fixture.match_date}</span>
        </div>
        {fixture.venue && (
          <>
            <span>•</span>
            <div className="flex items-center gap-1 truncate max-w-[120px]">
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
