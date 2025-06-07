
interface MatchStatisticsFooterProps {
  homeGoals: any[];
  awayGoals: any[];
  cards: any[];
  timelineEvents: any[];
  homeTeamColor: string;
  awayTeamColor: string;
  fixture: any;
}

const MatchStatisticsFooter = ({
  homeGoals,
  awayGoals,
  cards,
  timelineEvents,
  homeTeamColor,
  awayTeamColor,
  fixture
}: MatchStatisticsFooterProps) => {
  const getStatGradient = (color: string, isActive = false) => {
    if (isActive) {
      return {
        background: `linear-gradient(135deg, ${color}, ${color}dd, ${color}aa)`,
        color: 'white',
        boxShadow: `0 4px 15px ${color}40`
      };
    }
    return {
      background: `linear-gradient(135deg, ${color}20, ${color}10, ${color}05)`,
      color: color,
      border: `2px solid ${color}30`
    };
  };

  const getCenterStatStyle = () => ({
    background: 'linear-gradient(135deg, #f59e0b, #f97316, #dc2626)',
    color: 'white',
    boxShadow: '0 6px 20px rgba(245, 158, 11, 0.3)'
  });

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-2xl p-8 border-2 border-slate-200/50 shadow-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
          Match Statistics
        </h3>
        <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full mx-auto mt-2"></div>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-3 gap-8 text-center">
        {/* Home Goals */}
        <div className="space-y-3">
          <div 
            className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center font-black text-3xl transition-all duration-300 hover:scale-105"
            style={getStatGradient(homeTeamColor, homeGoals.length > 0)}
          >
            {homeGoals.length}
          </div>
          <div className="space-y-1">
            <div className="font-bold text-slate-800">Goals</div>
            <div className="text-sm font-medium text-slate-600">
              {fixture.home_team?.name}
            </div>
            <div className="w-12 h-1 rounded-full mx-auto" style={{ backgroundColor: homeTeamColor }}></div>
          </div>
        </div>

        {/* Center Statistics */}
        <div className="space-y-3">
          <div 
            className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center font-black text-3xl transition-all duration-300 hover:scale-105"
            style={getCenterStatStyle()}
          >
            {cards.length}
          </div>
          <div className="space-y-1">
            <div className="font-bold text-slate-800">Cards</div>
            <div className="text-sm font-medium text-slate-600">
              Total Disciplinary
            </div>
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
            </div>
          </div>
        </div>

        {/* Away Goals */}
        <div className="space-y-3">
          <div 
            className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center font-black text-3xl transition-all duration-300 hover:scale-105"
            style={getStatGradient(awayTeamColor, awayGoals.length > 0)}
          >
            {awayGoals.length}
          </div>
          <div className="space-y-1">
            <div className="font-bold text-slate-800">Goals</div>
            <div className="text-sm font-medium text-slate-600">
              {fixture.away_team?.name}
            </div>
            <div className="w-12 h-1 rounded-full mx-auto" style={{ backgroundColor: awayTeamColor }}></div>
          </div>
        </div>
      </div>

      {/* Additional Statistics Row */}
      <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-700">{timelineEvents.length}</div>
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Events</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{homeGoals.length + awayGoals.length}</div>
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Goals</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {cards.filter(c => c.type === 'yellow' || c.cardType === 'yellow').length}
          </div>
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Yellow Cards</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {cards.filter(c => c.type === 'red' || c.cardType === 'red').length}
          </div>
          <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">Red Cards</div>
        </div>
      </div>
    </div>
  );
};

export default MatchStatisticsFooter;
