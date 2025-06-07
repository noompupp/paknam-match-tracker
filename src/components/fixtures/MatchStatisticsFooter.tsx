
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "@/components/ui/separator";

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
    <div className={`bg-gradient-to-r from-slate-50 via-white to-slate-50 rounded-xl border border-slate-200 shadow-sm ${isMobile ? 'p-5' : 'p-6'}`}>
      {/* Enhanced divider */}
      <div className="mb-5">
        <Separator className="bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
      </div>

      {/* Mobile: Enhanced compact layout */}
      {isMobile ? (
        <div className="w-full">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="font-bold text-2xl" style={{ color: homeTeamColor }}>
                {homeGoals.length}
              </div>
              <div className="text-slate-600 text-sm font-semibold">Goals</div>
              <div className="text-xs text-slate-500 leading-tight">
                <div className="break-words max-w-[70px] mx-auto font-medium">
                  {fixture.home_team?.name || 'Home'}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-2xl text-amber-600">{cards.length}</div>
              <div className="text-slate-600 text-sm font-semibold">Cards</div>
              <div className="text-xs text-slate-500">
                <div className="font-medium">{timelineEvents.length} Events</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-2xl" style={{ color: awayTeamColor }}>
                {awayGoals.length}
              </div>
              <div className="text-slate-600 text-sm font-semibold">Goals</div>
              <div className="text-xs text-slate-500 leading-tight">
                <div className="break-words max-w-[70px] mx-auto font-medium">
                  {fixture.away_team?.name || 'Away'}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Desktop: Enhanced layout */
        <div className="grid grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="font-bold text-3xl" style={{ color: homeTeamColor }}>
              {homeGoals.length}
            </div>
            <div className="text-slate-600 text-base font-semibold">Goals</div>
            <div className="text-sm text-slate-500 font-medium">
              {fixture.home_team?.name}
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-bold text-3xl text-amber-600">{cards.length}</div>
            <div className="text-slate-600 text-base font-semibold">Total Cards</div>
            <div className="text-sm text-slate-500 font-medium">
              {timelineEvents.length} Events
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-bold text-3xl" style={{ color: awayTeamColor }}>
              {awayGoals.length}
            </div>
            <div className="text-slate-600 text-base font-semibold">Goals</div>
            <div className="text-sm text-slate-500 font-medium">
              {fixture.away_team?.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchStatisticsFooter;
