
import { useIsMobile } from "@/hooks/use-mobile";
import { formatTimeForSummary } from "@/utils/timeFormatting";

interface GoalsSectionProps {
  homeGoals: any[];
  awayGoals: any[];
  homeTeamColor: string;
  awayTeamColor: string;
  formatTime: (seconds: number) => string;
  getGoalPlayerName: (goal: any) => string;
  getGoalAssistPlayerName: (goal: any) => string;
  getGoalTime: (goal: any) => number;
}

const GoalsSection = ({
  homeGoals,
  awayGoals,
  homeTeamColor,
  awayTeamColor,
  formatTime,
  getGoalPlayerName,
  getGoalAssistPlayerName,
  getGoalTime
}: GoalsSectionProps) => {
  const isMobile = useIsMobile();

  const renderGoal = (goal: any, teamColor: string, index: number) => {
    const playerName = getGoalPlayerName(goal);
    const assistPlayerName = getGoalAssistPlayerName(goal);
    const time = getGoalTime(goal);

    return (
      <div 
        key={`${goal.id || 'goal'}-${index}`}
        className={`flex items-start gap-3 py-2 ${isMobile ? 'text-sm' : 'text-base'}`}
      >
        <div 
          className="w-3 h-3 rounded-full flex-shrink-0 mt-1 shadow-sm"
          style={{ backgroundColor: teamColor }}
        />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="font-semibold text-slate-900 leading-tight">{playerName}</div>
          {assistPlayerName && (
            <div className={`text-slate-600 ${isMobile ? 'text-xs' : 'text-sm'} leading-tight`}>
              Assist: <span className="font-medium">{assistPlayerName}</span>
            </div>
          )}
        </div>
        <div className={`font-bold ${isMobile ? 'text-sm' : 'text-base'} text-slate-700 flex-shrink-0 min-w-[40px] text-right`}>
          {formatTimeForSummary(time)}
        </div>
      </div>
    );
  };

  const renderTeamGoals = (goals: any[], teamName: string, teamColor: string) => {
    if (goals.length === 0) {
      return (
        <div className={`text-center text-slate-500 ${isMobile ? 'text-sm' : 'text-base'} py-6`}>
          No goals scored
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {goals.map((goal, index) => renderGoal(goal, teamColor, index))}
      </div>
    );
  };

  if (homeGoals.length === 0 && awayGoals.length === 0) {
    return (
      <div className={`bg-slate-50 rounded-xl border border-slate-200 ${isMobile ? 'p-5' : 'p-6'}`}>
        <div className="text-center text-slate-500">
          <div className="text-4xl mb-3">⚽</div>
          <div className={`font-medium ${isMobile ? 'text-base' : 'text-lg'}`}>No goals scored in this match</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${isMobile ? 'p-5' : 'p-6'}`}>
      <div className={`flex items-center gap-3 mb-5 ${isMobile ? 'text-base' : 'text-lg'}`}>
        <div className="text-2xl">⚽</div>
        <div className="font-bold text-slate-900">Goals</div>
        <div className={`ml-auto text-slate-500 font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
          {homeGoals.length + awayGoals.length} total
        </div>
      </div>

      {/* Mobile: Enhanced single column layout */}
      {isMobile ? (
        <div className="space-y-6">
          {homeGoals.length > 0 && (
            <div>
              <div className="font-bold mb-3 text-sm text-slate-700 uppercase tracking-wide">
                HOME GOALS ({homeGoals.length})
              </div>
              {renderTeamGoals(homeGoals, 'Home', homeTeamColor)}
            </div>
          )}
          
          {awayGoals.length > 0 && (
            <div>
              <div className="font-bold mb-3 text-sm text-slate-700 uppercase tracking-wide">
                AWAY GOALS ({awayGoals.length})
              </div>
              {renderTeamGoals(awayGoals, 'Away', awayTeamColor)}
            </div>
          )}
        </div>
      ) : (
        /* Desktop: Enhanced two column layout */
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="font-bold mb-4 text-sm text-slate-700 uppercase tracking-wide">
              HOME GOALS ({homeGoals.length})
            </div>
            {renderTeamGoals(homeGoals, 'Home', homeTeamColor)}
          </div>
          
          <div>
            <div className="font-bold mb-4 text-sm text-slate-700 uppercase tracking-wide">
              AWAY GOALS ({awayGoals.length})
            </div>
            {renderTeamGoals(awayGoals, 'Away', awayTeamColor)}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsSection;
