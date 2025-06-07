
import { useIsMobile } from "@/hooks/use-mobile";
import { formatTimeForSummary } from "@/utils/timeFormatting";

interface MatchEventsSectionProps {
  homeGoals: any[];
  awayGoals: any[];
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  formatTime: (seconds: number) => string;
  getGoalPlayerName: (goal: any) => string;
  getGoalAssistPlayerName: (goal: any) => string;
  getGoalTime: (goal: any) => number;
  getGoalTeamId: (goal: any) => string;
}

const MatchEventsSection = ({
  homeGoals,
  awayGoals,
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName,
  formatTime,
  getGoalPlayerName,
  getGoalAssistPlayerName,
  getGoalTime,
  getGoalTeamId
}: MatchEventsSectionProps) => {
  const isMobile = useIsMobile();

  // Combine and sort all goals by time
  const allGoals = [...homeGoals, ...awayGoals].sort((a, b) => getGoalTime(a) - getGoalTime(b));

  const renderGoalEvent = (goal: any, index: number) => {
    const playerName = getGoalPlayerName(goal);
    const assistPlayerName = getGoalAssistPlayerName(goal);
    const time = getGoalTime(goal);
    const goalTeamId = getGoalTeamId(goal);
    
    // Determine if this is a home team goal
    const isHomeGoal = homeGoals.includes(goal) || goalTeamId === homeTeamId;
    
    console.log('🏟️ Rendering goal event:', {
      goalId: goal.id,
      playerName,
      assistPlayerName,
      time,
      goalTeamId,
      homeTeamId,
      awayTeamId,
      isHomeGoal,
      homeGoalsIncludesThis: homeGoals.includes(goal),
      teamIdMatch: goalTeamId === homeTeamId
    });

    if (isHomeGoal) {
      // Home team goal - align left
      return (
        <div key={`goal-${goal.id || index}`} className="flex items-start gap-3 mb-4">
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">⚽</span>
              <div className="font-semibold text-slate-900 text-sm">{playerName}</div>
            </div>
            {assistPlayerName && (
              <div className="text-xs text-slate-600 ml-7">
                Assist: <span className="font-medium">{assistPlayerName}</span>
              </div>
            )}
          </div>
          <div className="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
            {formatTimeForSummary(time)}
          </div>
        </div>
      );
    } else {
      // Away team goal - align right
      return (
        <div key={`goal-${goal.id || index}`} className="flex items-start gap-3 mb-4">
          <div className="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
            {formatTimeForSummary(time)}
          </div>
          <div className="flex-1 text-right">
            <div className="flex items-center gap-2 mb-1 justify-end">
              <div className="font-semibold text-slate-900 text-sm">{playerName}</div>
              <span className="text-lg">⚽</span>
            </div>
            {assistPlayerName && (
              <div className="text-xs text-slate-600 mr-7">
                Assist: <span className="font-medium">{assistPlayerName}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  if (allGoals.length === 0) {
    return (
      <div className={`bg-slate-50 rounded-xl border border-slate-200 ${isMobile ? 'p-5' : 'p-6'}`}>
        <div className="text-center text-slate-500">
          <div className="text-4xl mb-3">⚽</div>
          <div className={`font-medium ${isMobile ? 'text-base' : 'text-lg'}`}>No match events in this match</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${isMobile ? 'p-5' : 'p-6'}`}>
      <div className={`flex items-center gap-3 mb-5 ${isMobile ? 'text-base' : 'text-lg'}`}>
        <div className="text-2xl">📋</div>
        <div className="font-bold text-slate-900">Match Events</div>
        <div className={`ml-auto text-slate-500 font-medium ${isMobile ? 'text-sm' : 'text-base'}`}>
          {allGoals.length} total
        </div>
      </div>

      {/* Team indicators */}
      <div className="flex justify-between mb-4 text-xs text-slate-500 font-medium">
        <div className="text-left">{homeTeamName}</div>
        <div className="text-right">{awayTeamName}</div>
      </div>

      {/* Events timeline */}
      <div className="space-y-1">
        {allGoals.map((goal, index) => renderGoalEvent(goal, index))}
      </div>
    </div>
  );
};

export default MatchEventsSection;
