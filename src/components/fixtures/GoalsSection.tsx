
import { useIsMobile } from "@/hooks/use-mobile";

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
        className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'}`}
      >
        <div 
          className={`w-2 h-2 rounded-full flex-shrink-0`}
          style={{ backgroundColor: teamColor }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{playerName}</div>
          {assistPlayerName && (
            <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
              Assist: {assistPlayerName}
            </div>
          )}
        </div>
        <div className={`font-mono ${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground flex-shrink-0`}>
          {formatTime(time)}
        </div>
      </div>
    );
  };

  const renderTeamGoals = (goals: any[], teamName: string, teamColor: string) => {
    if (goals.length === 0) {
      return (
        <div className={`text-center text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'} py-4`}>
          No goals scored
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {goals.map((goal, index) => renderGoal(goal, teamColor, index))}
      </div>
    );
  };

  if (homeGoals.length === 0 && awayGoals.length === 0) {
    return (
      <div className={`bg-slate-50 rounded-xl border ${isMobile ? 'p-4' : 'p-6'}`}>
        <div className="text-center text-muted-foreground">
          <div className="text-4xl mb-2">⚽</div>
          <div className={isMobile ? 'text-sm' : 'text-base'}>No goals scored in this match</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-50 rounded-xl border ${isMobile ? 'p-4' : 'p-6'}`}>
      <div className={`flex items-center gap-2 mb-4 ${isMobile ? 'text-sm' : 'text-base'}`}>
        <div className="text-xl">⚽</div>
        <div className="font-semibold">Goals</div>
        <div className={`ml-auto text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
          {homeGoals.length + awayGoals.length} total
        </div>
      </div>

      {/* Mobile: Single column layout */}
      {isMobile ? (
        <div className="space-y-4">
          {homeGoals.length > 0 && (
            <div>
              <div className={`font-semibold mb-2 text-xs text-muted-foreground`}>
                HOME GOALS ({homeGoals.length})
              </div>
              {renderTeamGoals(homeGoals, 'Home', homeTeamColor)}
            </div>
          )}
          
          {awayGoals.length > 0 && (
            <div>
              <div className={`font-semibold mb-2 text-xs text-muted-foreground`}>
                AWAY GOALS ({awayGoals.length})
              </div>
              {renderTeamGoals(awayGoals, 'Away', awayTeamColor)}
            </div>
          )}
        </div>
      ) : (
        /* Desktop: Two column layout */
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="font-semibold mb-3 text-sm text-muted-foreground">
              HOME GOALS ({homeGoals.length})
            </div>
            {renderTeamGoals(homeGoals, 'Home', homeTeamColor)}
          </div>
          
          <div>
            <div className="font-semibold mb-3 text-sm text-muted-foreground">
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
