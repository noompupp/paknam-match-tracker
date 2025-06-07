
import { getGoalPlayerName, getGoalTime, getGoalAssistPlayerName } from "../../utils/matchSummaryDataProcessor";

interface SocialMediaStoryGoalsSectionProps {
  goals: any[];
  homeGoals: any[];
  awayGoals: any[];
  fixture: any;
  displayHomeColor: string;
  displayAwayColor: string;
  formatTime: (seconds: number) => string;
}

const SocialMediaStoryGoalsSection = ({
  goals,
  homeGoals,
  awayGoals,
  fixture,
  displayHomeColor,
  displayAwayColor,
  formatTime
}: SocialMediaStoryGoalsSectionProps) => {
  if (goals.length === 0) return null;

  return (
    <div className="bg-green-500/15 backdrop-blur-md rounded-2xl p-5 border border-green-400/25 shadow-lg">
      {/* Compact Header */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2">
          <span className="text-xl">⚽</span>
          Goal Scorers
        </h2>
      </div>
      
      {/* Optimized Two Column Layout */}
      <div className="grid grid-cols-2 gap-3">
        {/* Home Goals */}
        <div className="space-y-2">
          <div className="text-center">
            <div 
              className="text-base font-bold mb-2 pb-1 border-b border-white/15 truncate"
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
                className="p-2.5 bg-white/8 rounded-xl border border-white/15"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white truncate flex-1 mr-2">
                    {playerName}
                  </span>
                  <span className="text-xs font-bold text-white/90 bg-white/15 px-2 py-0.5 rounded-lg flex-shrink-0">
                    {formatTime(time)}
                  </span>
                </div>
                {assistName && (
                  <div className="text-xs text-white/70 truncate">
                    Assist: {assistName}
                  </div>
                )}
              </div>
            );
          }) : (
            <div className="text-center p-3 text-white/50 text-xs">
              No goals
            </div>
          )}
        </div>

        {/* Away Goals */}
        <div className="space-y-2">
          <div className="text-center">
            <div 
              className="text-base font-bold mb-2 pb-1 border-b border-white/15 truncate"
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
                className="p-2.5 bg-white/8 rounded-xl border border-white/15"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-white truncate flex-1 mr-2">
                    {playerName}
                  </span>
                  <span className="text-xs font-bold text-white/90 bg-white/15 px-2 py-0.5 rounded-lg flex-shrink-0">
                    {formatTime(time)}
                  </span>
                </div>
                {assistName && (
                  <div className="text-xs text-white/70 truncate">
                    Assist: {assistName}
                  </div>
                )}
              </div>
            );
          }) : (
            <div className="text-center p-3 text-white/50 text-xs">
              No goals
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialMediaStoryGoalsSection;
