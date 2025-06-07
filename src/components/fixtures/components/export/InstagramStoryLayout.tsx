
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, MapPin, Users } from "lucide-react";
import TeamLogoDisplay from "../../TeamLogoDisplay";
import { getGoalPlayerName, getGoalTime, getGoalAssistPlayerName } from "../../utils/matchSummaryDataProcessor";

interface InstagramStoryLayoutProps {
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

const InstagramStoryLayout = ({
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
}: InstagramStoryLayoutProps) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}'`;
  };

  // Ensure white teams get a visible color
  const getDisplayColor = (color: string) => {
    if (!color || color === '#ffffff' || color === '#FFFFFF' || color === 'white' || color === '#fff') {
      return '#1e293b'; // slate-800
    }
    return color;
  };

  const displayHomeColor = getDisplayColor(homeTeamColor);
  const displayAwayColor = getDisplayColor(awayTeamColor);

  return (
    <div 
      className="w-full bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white overflow-hidden relative"
      style={{ 
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        aspectRatio: '9/16',
        minHeight: '100vh'
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-purple-900/90 to-indigo-900/90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.1),transparent_50%)] " />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.05),transparent_50%)]" />

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col p-6">
        
        {/* Tournament Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Trophy className="h-6 w-6 text-amber-400" />
            <h1 className="text-2xl font-black tracking-wider text-white">
              PREMIER LEAGUE
            </h1>
          </div>
          <Badge 
            variant="outline" 
            className="bg-white/20 border-white/30 text-white text-lg font-bold px-6 py-2 backdrop-blur-sm"
          >
            {fixture.status === 'completed' ? 'FULL TIME' : 'LIVE'}
          </Badge>
        </div>

        {/* Main Score Display */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-8">
            {/* Teams Row */}
            <div className="flex items-center justify-between mb-6">
              {/* Home Team */}
              <div className="flex-1 text-center">
                <TeamLogoDisplay 
                  teamName={fixture.home_team?.name || 'Home'}
                  teamLogo={fixture.home_team?.logoURL}
                  teamColor={displayHomeColor}
                  size="lg"
                  showName={false}
                />
                <div className="mt-3">
                  <div className="text-lg font-bold text-white/90 mb-2 truncate">
                    {fixture.home_team?.name || 'Home'}
                  </div>
                  <div 
                    className="text-6xl font-black leading-none mb-1"
                    style={{ color: displayHomeColor, textShadow: '0 0 20px rgba(255,255,255,0.3)' }}
                  >
                    {fixture.home_score || 0}
                  </div>
                </div>
              </div>

              {/* VS Separator */}
              <div className="px-6 flex flex-col items-center">
                <div className="text-2xl font-light text-white/60 mb-2">VS</div>
                <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
              </div>

              {/* Away Team */}
              <div className="flex-1 text-center">
                <TeamLogoDisplay 
                  teamName={fixture.away_team?.name || 'Away'}
                  teamLogo={fixture.away_team?.logoURL}
                  teamColor={displayAwayColor}
                  size="lg"
                  showName={false}
                />
                <div className="mt-3">
                  <div className="text-lg font-bold text-white/90 mb-2 truncate">
                    {fixture.away_team?.name || 'Away'}
                  </div>
                  <div 
                    className="text-6xl font-black leading-none mb-1"
                    style={{ color: displayAwayColor, textShadow: '0 0 20px rgba(255,255,255,0.3)' }}
                  >
                    {fixture.away_score || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Match Info */}
            <div className="flex items-center justify-center gap-4 text-sm text-white/80 bg-white/10 rounded-full px-6 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="font-semibold">{fixture.match_date}</span>
              </div>
              {fixture.kick_off_time && (
                <>
                  <span>•</span>
                  <span className="font-semibold">KO: {fixture.kick_off_time}</span>
                </>
              )}
              {fixture.venue && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1 max-w-[100px]">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate font-semibold">{fixture.venue}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Goal Scorers */}
          {goals.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 mb-6 border border-white/20">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                  <span className="text-2xl">⚽</span>
                  Goal Scorers
                </h2>
              </div>
              
              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                {goals.map((goal, index) => {
                  const isHomeGoal = homeGoals.includes(goal);
                  const teamColor = isHomeGoal ? displayHomeColor : displayAwayColor;
                  const playerName = getGoalPlayerName(goal);
                  const assistName = getGoalAssistPlayerName(goal);
                  const time = getGoalTime(goal);
                  
                  return (
                    <div 
                      key={`goal-${goal.id}-${index}`} 
                      className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/20"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0 border-2 border-white shadow-lg"
                          style={{ backgroundColor: teamColor }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-base font-bold text-white truncate">
                            {playerName}
                          </div>
                          {assistName && (
                            <div className="text-sm text-white/70 truncate">
                              Assist: {assistName}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-base font-bold text-white bg-white/20 px-3 py-2 rounded-lg border border-white/30 ml-3">
                        {formatTime(time)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cards */}
          {cards.length > 0 && (
            <div className="bg-amber-500/20 backdrop-blur-md rounded-2xl p-4 mb-6 border border-amber-400/30">
              <div className="text-center mb-3">
                <h3 className="text-lg font-bold text-amber-100 flex items-center justify-center gap-2">
                  <span className="text-xl">🟨</span>
                  Disciplinary ({cards.length})
                </h3>
              </div>
              
              <div className="grid grid-cols-1 gap-2 max-h-[120px] overflow-y-auto">
                {cards.slice(0, 3).map((card, index) => {
                  const playerName = getCardPlayerName(card);
                  const isRed = isCardRed(card);
                  const time = getCardTime(card);
                  
                  return (
                    <div 
                      key={`card-${card.id}-${index}`} 
                      className="flex items-center justify-between p-2 bg-white/10 rounded-lg border border-white/20"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-lg">{isRed ? '🟥' : '🟨'}</span>
                        <span className="text-sm font-semibold text-white truncate">
                          {playerName}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white bg-white/20 px-2 py-1 rounded">
                        {formatTime(time)}
                      </div>
                    </div>
                  );
                })}
                
                {cards.length > 3 && (
                  <div className="text-center p-2 bg-white/10 rounded-lg border border-white/20">
                    <span className="text-xs text-amber-200 font-medium">
                      +{cards.length - 3} more cards
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="mt-auto">
          <div className="grid grid-cols-3 gap-4 text-center mb-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div>
              <div className="text-2xl font-bold mb-1" style={{ color: displayHomeColor }}>
                {homeGoals.length}
              </div>
              <div className="text-xs text-white/80 font-semibold">Goals</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400 mb-1">{cards.length}</div>
              <div className="text-xs text-white/80 font-semibold">Cards</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1" style={{ color: displayAwayColor }}>
                {awayGoals.length}
              </div>
              <div className="text-xs text-white/80 font-semibold">Goals</div>
            </div>
          </div>
          
          {/* Branding */}
          <div className="text-center bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="text-sm font-bold text-white mb-1 flex items-center justify-center gap-2">
              <Users className="h-4 w-4" />
              Match Report
            </div>
            <div className="text-xs text-white/70 font-medium">
              Referee Tools • {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramStoryLayout;
