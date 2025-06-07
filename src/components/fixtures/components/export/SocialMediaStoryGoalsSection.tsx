
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
  );
};

export default SocialMediaStoryGoalsSection;
