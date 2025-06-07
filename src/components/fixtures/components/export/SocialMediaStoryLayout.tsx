
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, MapPin } from "lucide-react";
import TeamLogoDisplay from "../../TeamLogoDisplay";
import { getGoalPlayerName, getGoalTime, getGoalAssistPlayerName } from "../../utils/matchSummaryDataProcessor";

interface SocialMediaStoryLayoutProps {
  fixture: any;
  goals: any[];
  cards: any[];
  homeGoals: any[];
  awayGoals: any[];
  homeTeamColor: string;
  awayTeamColor: string;
  timelineEvents: any[];
  getCardPlayerName: (card: any) => string;
  getCardTime: (card: any) => number;
  getCardType: (card: any) => string;
  isCardRed: (card: any) => boolean;
}

const SocialMediaStoryLayout = ({
  fixture,
  goals,
  cards,
  homeGoals,
  awayGoals,
  homeTeamColor,
  awayTeamColor,
  timelineEvents,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed
}: SocialMediaStoryLayoutProps) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}'`;
  };

  // Ensure white teams get a visible color
  const getDisplayColor = (color: string, teamName: string) => {
    if (!color || color === '#ffffff' || color === '#FFFFFF' || color === 'white' || color === '#fff') {
      return '#1e293b'; // slate-800
    }
    return color;
  };

  const displayHomeColor = getDisplayColor(homeTeamColor, fixture.home_team?.name);
  const displayAwayColor = getDisplayColor(awayTeamColor, fixture.away_team?.name);

  return (
    <div 
      className="w-[375px] bg-white overflow-hidden shadow-xl flex flex-col"
      style={{ 
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        height: '812px',
        aspectRatio: '375/812'
      }}
    >
      {/* Tournament Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="h-5 w-5 text-amber-400" />
          <h1 className="text-lg font-bold tracking-wide">PREMIER LEAGUE</h1>
        </div>
        <Badge 
          variant="outline" 
          className="bg-white/10 border-white/20 text-white text-sm font-semibold px-3 py-1"
        >
          {fixture.status === 'completed' ? 'FULL TIME' : 'LIVE'}
        </Badge>
      </div>

      {/* Main Scoreline Block */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 border-b-2 border-slate-100">
        {/* Teams and Score */}
        <div className="flex items-center justify-between mb-4">
          {/* Home Team */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <TeamLogoDisplay 
              teamName={fixture.home_team?.name || 'Home'}
              teamLogo={fixture.home_team?.logoURL}
              teamColor={displayHomeColor}
              size="md"
              showName={false}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-slate-700 mb-1 truncate">
                {fixture.home_team?.name || 'Home'}
              </div>
              <div 
                className="text-4xl font-bold leading-none"
                style={{ color: displayHomeColor }}
              >
                {fixture.home_score || 0}
              </div>
            </div>
          </div>

          {/* VS Separator */}
          <div className="px-4 flex items-center">
            <div className="text-3xl font-light text-slate-400">—</div>
          </div>

          {/* Away Team */}
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-row-reverse">
            <TeamLogoDisplay 
              teamName={fixture.away_team?.name || 'Away'}
              teamLogo={fixture.away_team?.logoURL}
              teamColor={displayAwayColor}
              size="md"
              showName={false}
            />
            <div className="flex-1 min-w-0 text-right">
              <div className="text-sm font-bold text-slate-700 mb-1 truncate">
                {fixture.away_team?.name || 'Away'}
              </div>
              <div 
                className="text-4xl font-bold leading-none"
                style={{ color: displayAwayColor }}
              >
                {fixture.away_score || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Match Info */}
        <div className="flex items-center justify-center gap-3 text-sm text-slate-600 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
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
              <div className="flex items-center gap-1 truncate max-w-[120px]">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="truncate font-medium">{fixture.venue}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Goal Scorers List */}
      {goals.length > 0 && (
        <div className="bg-white p-5 border-b border-slate-100 flex-1">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center justify-center gap-2">
              <span className="text-green-600">⚽</span>
              Goal Scorers
            </h2>
          </div>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {goals.map((goal, index) => {
              const isHomeGoal = homeGoals.includes(goal);
              const teamColor = isHomeGoal ? displayHomeColor : displayAwayColor;
              const playerName = getGoalPlayerName(goal);
              const assistName = getGoalAssistPlayerName(goal);
              const time = getGoalTime(goal);
              
              return (
                <div 
                  key={`goal-${goal.id}-${index}`} 
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0 border-2 border-white shadow-sm"
                      style={{ backgroundColor: teamColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-bold text-slate-800 truncate">
                        {playerName}
                      </div>
                      {assistName && (
                        <div className="text-sm text-slate-600 truncate">
                          Assist: {assistName}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-base font-bold text-slate-700 bg-white px-3 py-2 rounded-lg border border-slate-200 ml-3">
                    {formatTime(time)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cards if any */}
      {cards.length > 0 && (
        <div className="bg-amber-50 p-4 border-b border-amber-100">
          <div className="text-center mb-3">
            <h3 className="text-base font-bold text-amber-800 flex items-center justify-center gap-2">
              <span>🟨</span>
              Cards ({cards.length})
            </h3>
          </div>
          
          <div className="grid grid-cols-1 gap-2 max-h-[120px] overflow-y-auto">
            {cards.slice(0, 4).map((card, index) => {
              const playerName = getCardPlayerName(card);
              const cardType = getCardType(card);
              const isRed = isCardRed(card);
              const time = getCardTime(card);
              
              return (
                <div 
                  key={`card-${card.id}-${index}`} 
                  className="flex items-center justify-between p-2 bg-white rounded-lg border border-amber-200"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-base">{isRed ? '🟥' : '🟨'}</span>
                    <span className="text-sm font-semibold text-slate-700 truncate">
                      {playerName}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                    {formatTime(time)}
                  </div>
                </div>
              );
            })}
            
            {cards.length > 4 && (
              <div className="text-center p-2 bg-white rounded-lg border border-amber-200">
                <span className="text-xs text-amber-700 font-medium">
                  +{cards.length - 4} more cards
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Match Details Footer */}
      <div className="mt-auto bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 p-4 border-t-2 border-slate-200">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-center mb-3">
          <div>
            <div className="text-xl font-bold" style={{ color: displayHomeColor }}>
              {homeGoals.length}
            </div>
            <div className="text-xs text-slate-600 font-semibold">Goals</div>
          </div>
          <div>
            <div className="text-xl font-bold text-amber-600">{cards.length}</div>
            <div className="text-xs text-slate-600 font-semibold">Cards</div>
          </div>
          <div>
            <div className="text-xl font-bold" style={{ color: displayAwayColor }}>
              {awayGoals.length}
            </div>
            <div className="text-xs text-slate-600 font-semibold">Goals</div>
          </div>
        </div>
        
        {/* Branding */}
        <div className="text-center border-t border-slate-200 pt-3">
          <div className="text-sm font-bold text-slate-700 mb-1">
            📊 Match Report
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Referee Tools • {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaStoryLayout;
