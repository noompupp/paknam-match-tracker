
import { Calendar, MapPin } from "lucide-react";
import TeamLogoDisplay from "../../TeamLogoDisplay";
import { getGoalPlayerName, getGoalTime, getGoalAssistPlayerName } from "../../utils/matchSummaryDataProcessor";

interface SocialMediaStoryContentProps {
  fixture: any;
  goals: any[];
  cards: any[];
  homeGoals: any[];
  awayGoals: any[];
  displayHomeColor: string;
  displayAwayColor: string;
  getCardPlayerName: (card: any) => string;
  getCardTime: (card: any) => number;
  getCardType: (card: any) => string;
  isCardRed: (card: any) => boolean;
  formatTime: (seconds: number) => string;
}

const SocialMediaStoryContent = ({
  fixture,
  goals,
  cards,
  homeGoals,
  awayGoals,
  displayHomeColor,
  displayAwayColor,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed,
  formatTime
}: SocialMediaStoryContentProps) => {
  return (
    <div className="flex-1 flex flex-col p-6 space-y-6">
      {/* Main Scoreline - Enhanced and Prominent */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
        {/* Teams and Score Display */}
        <div className="flex items-center justify-between mb-6">
          {/* Home Team */}
          <div className="flex-1 text-center">
            <div className="mb-4">
              <TeamLogoDisplay 
                teamName={fixture.home_team?.name || 'Home'}
                teamLogo={fixture.home_team?.logoURL}
                teamColor={displayHomeColor}
                size="lg"
                showName={false}
              />
            </div>
            <div className="text-lg font-bold text-white/90 mb-3 truncate px-2">
              {fixture.home_team?.name || 'Home'}
            </div>
            <div 
              className="text-7xl font-black leading-none mb-2 drop-shadow-2xl"
              style={{ 
                color: displayHomeColor,
                textShadow: '0 0 30px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.3)'
              }}
            >
              {fixture.home_score || 0}
            </div>
          </div>

          {/* VS Separator */}
          <div className="px-6 flex flex-col items-center">
            <div className="text-2xl font-light text-white/60 mb-2">VS</div>
            <div className="w-px h-20 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
          </div>

          {/* Away Team */}
          <div className="flex-1 text-center">
            <div className="mb-4">
              <TeamLogoDisplay 
                teamName={fixture.away_team?.name || 'Away'}
                teamLogo={fixture.away_team?.logoURL}
                teamColor={displayAwayColor}
                size="lg"
                showName={false}
              />
            </div>
            <div className="text-lg font-bold text-white/90 mb-3 truncate px-2">
              {fixture.away_team?.name || 'Away'}
            </div>
            <div 
              className="text-7xl font-black leading-none mb-2 drop-shadow-2xl"
              style={{ 
                color: displayAwayColor,
                textShadow: '0 0 30px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.3)'
              }}
            >
              {fixture.away_score || 0}
            </div>
          </div>
        </div>

        {/* Match Info */}
        <div className="flex items-center justify-center gap-4 text-sm text-white/80 bg-white/10 rounded-full px-6 py-3 backdrop-blur-sm border border-white/20">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="font-semibold">{fixture.match_date}</span>
          </div>
          {fixture.kick_off_time && (
            <>
              <span className="text-white/50">•</span>
              <span className="font-semibold">KO: {fixture.kick_off_time}</span>
            </>
          )}
          {fixture.venue && (
            <>
              <span className="text-white/50">•</span>
              <div className="flex items-center gap-1 max-w-[100px]">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="truncate font-semibold">{fixture.venue}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Match Events - Redesigned with Left/Right Layout */}
      {(goals.length > 0 || cards.length > 0) && (
        <div className="space-y-4">
          {/* Goal Scorers */}
          {goals.length > 0 && (
            <div className="bg-green-500/20 backdrop-blur-md rounded-2xl p-6 border border-green-400/30 shadow-lg">
              <div className="text-center mb-5">
                <h2 className="text-xl font-bold text-white flex items-center justify-center gap-3">
                  <span className="text-2xl">⚽</span>
                  Goal Scorers ({goals.length})
                </h2>
              </div>
              
              {/* Two Column Layout */}
              <div className="grid grid-cols-2 gap-4">
                {/* Home Goals */}
                <div className="space-y-3">
                  <div className="text-center">
                    <div 
                      className="text-lg font-bold mb-2 pb-2 border-b border-white/20"
                      style={{ color: displayHomeColor }}
                    >
                      {fixture.home_team?.name || 'Home'}
                    </div>
                  </div>
                  {homeGoals.length > 0 ? homeGoals.map((goal, index) => {
                    const playerName = getGoalPlayerName(goal);
                    const assistName = getGoalAssistPlayerName(goal);
                    const time = getGoalTime(goal);
                    
                    return (
                      <div 
                        key={`home-goal-${goal.id}-${index}`} 
                        className="p-3 bg-white/10 rounded-xl border border-white/20"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-base font-bold text-white truncate flex-1">
                            {playerName}
                          </span>
                          <span className="text-sm font-bold text-white/80 bg-white/20 px-2 py-1 rounded ml-2">
                            {formatTime(time)}
                          </span>
                        </div>
                        {assistName && (
                          <div className="text-sm text-white/70 truncate">
                            Assist: {assistName}
                          </div>
                        )}
                      </div>
                    );
                  }) : (
                    <div className="text-center p-4 text-white/60 text-sm">
                      No goals
                    </div>
                  )}
                </div>

                {/* Away Goals */}
                <div className="space-y-3">
                  <div className="text-center">
                    <div 
                      className="text-lg font-bold mb-2 pb-2 border-b border-white/20"
                      style={{ color: displayAwayColor }}
                    >
                      {fixture.away_team?.name || 'Away'}
                    </div>
                  </div>
                  {awayGoals.length > 0 ? awayGoals.map((goal, index) => {
                    const playerName = getGoalPlayerName(goal);
                    const assistName = getGoalAssistPlayerName(goal);
                    const time = getGoalTime(goal);
                    
                    return (
                      <div 
                        key={`away-goal-${goal.id}-${index}`} 
                        className="p-3 bg-white/10 rounded-xl border border-white/20"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-base font-bold text-white truncate flex-1">
                            {playerName}
                          </span>
                          <span className="text-sm font-bold text-white/80 bg-white/20 px-2 py-1 rounded ml-2">
                            {formatTime(time)}
                          </span>
                        </div>
                        {assistName && (
                          <div className="text-sm text-white/70 truncate">
                            Assist: {assistName}
                          </div>
                        )}
                      </div>
                    );
                  }) : (
                    <div className="text-center p-4 text-white/60 text-sm">
                      No goals
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cards Section */}
          {cards.length > 0 && (
            <div className="bg-amber-500/20 backdrop-blur-md rounded-2xl p-5 border border-amber-400/30 shadow-lg">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-amber-100 flex items-center justify-center gap-2">
                  <span className="text-xl">🟨</span>
                  Disciplinary Actions ({cards.length})
                </h3>
              </div>
              
              <div className="grid grid-cols-1 gap-2 max-h-[120px] overflow-y-auto">
                {cards.slice(0, 4).map((card, index) => {
                  const playerName = getCardPlayerName(card);
                  const isRed = isCardRed(card);
                  const time = getCardTime(card);
                  
                  return (
                    <div 
                      key={`card-${card.id}-${index}`} 
                      className="flex items-center justify-between p-3 bg-white/10 rounded-lg border border-white/20"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
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
                
                {cards.length > 4 && (
                  <div className="text-center p-2 bg-white/10 rounded-lg border border-white/20">
                    <span className="text-xs text-amber-200 font-medium">
                      +{cards.length - 4} more cards
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Events Placeholder */}
      {goals.length === 0 && cards.length === 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <div className="text-white/60 text-lg font-medium">
            No match events recorded
          </div>
          <div className="text-white/40 text-sm mt-2">
            Goals and cards will appear here when added
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaStoryContent;
