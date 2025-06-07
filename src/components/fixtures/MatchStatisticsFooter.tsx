
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
  return (
    <div className="bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 rounded-xl p-3 md:p-6 border max-w-4xl mx-auto">
      <div className="grid grid-cols-3 gap-2 md:gap-6 text-center">
        <div>
          <div className="font-bold text-lg md:text-2xl mb-1" style={{ color: homeTeamColor }}>
            {homeGoals.length}
          </div>
          <div className="text-muted-foreground text-xs md:text-sm font-medium">Goals</div>
          <div className="text-xs text-muted-foreground mt-1 truncate">
            {fixture.home_team?.name}
          </div>
        </div>
        <div>
          <div className="font-bold text-lg md:text-2xl mb-1 text-amber-600">{cards.length}</div>
          <div className="text-muted-foreground text-xs md:text-sm font-medium">Total Cards</div>
          <div className="text-xs text-muted-foreground mt-1">
            {timelineEvents.length} Events
          </div>
        </div>
        <div>
          <div className="font-bold text-lg md:text-2xl mb-1" style={{ color: awayTeamColor }}>
            {awayGoals.length}
          </div>
          <div className="text-muted-foreground text-xs md:text-sm font-medium">Goals</div>
          <div className="text-xs text-muted-foreground mt-1 truncate">
            {fixture.away_team?.name}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchStatisticsFooter;
