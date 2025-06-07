
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  return (
    <div className={`bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 rounded-xl border ${isMobile ? 'p-4' : 'p-6'}`}>
      {/* Mobile: Compact centered layout optimized for export */}
      {isMobile ? (
        <div className="w-full">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-bold text-xl mb-1" style={{ color: homeTeamColor }}>
                {homeGoals.length}
              </div>
              <div className="text-muted-foreground text-xs font-medium mb-1">Goals</div>
              <div className="text-xs text-muted-foreground">
                <div className="break-words max-w-[70px] mx-auto leading-tight">
                  {fixture.home_team?.name || 'Home'}
                </div>
              </div>
            </div>
            <div>
              <div className="font-bold text-xl mb-1 text-amber-600">{cards.length}</div>
              <div className="text-muted-foreground text-xs font-medium mb-1">Cards</div>
              <div className="text-xs text-muted-foreground">
                {timelineEvents.length} Events
              </div>
            </div>
            <div>
              <div className="font-bold text-xl mb-1" style={{ color: awayTeamColor }}>
                {awayGoals.length}
              </div>
              <div className="text-muted-foreground text-xs font-medium mb-1">Goals</div>
              <div className="text-xs text-muted-foreground">
                <div className="break-words max-w-[70px] mx-auto leading-tight">
                  {fixture.away_team?.name || 'Away'}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Desktop layout */
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="font-bold text-2xl mb-1" style={{ color: homeTeamColor }}>
              {homeGoals.length}
            </div>
            <div className="text-muted-foreground text-sm font-medium">Goals</div>
            <div className="text-xs text-muted-foreground mt-1">
              {fixture.home_team?.name}
            </div>
          </div>
          <div>
            <div className="font-bold text-2xl mb-1 text-amber-600">{cards.length}</div>
            <div className="text-muted-foreground text-sm font-medium">Total Cards</div>
            <div className="text-xs text-muted-foreground mt-1">
              {timelineEvents.length} Events
            </div>
          </div>
          <div>
            <div className="font-bold text-2xl mb-1" style={{ color: awayTeamColor }}>
              {awayGoals.length}
            </div>
            <div className="text-muted-foreground text-sm font-medium">Goals</div>
            <div className="text-xs text-muted-foreground mt-1">
              {fixture.away_team?.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchStatisticsFooter;
