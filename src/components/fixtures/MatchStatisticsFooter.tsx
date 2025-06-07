
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
    <div className={`bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 rounded-xl ${isMobile ? 'p-4' : 'p-6'} border`}>
      <div className={`grid grid-cols-3 ${isMobile ? 'gap-3' : 'gap-6'} text-center`}>
        <div>
          <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'} mb-1`} style={{ color: homeTeamColor }}>
            {homeGoals.length}
          </div>
          <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Goals</div>
          <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground mt-1 ${isMobile ? 'truncate' : ''}`}>
            {isMobile ? 
              (fixture.home_team?.name || '').split(' ')[0] || 'Home' :
              fixture.home_team?.name
            }
          </div>
        </div>
        <div>
          <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'} mb-1 text-amber-600`}>{cards.length}</div>
          <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Total Cards</div>
          <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground mt-1`}>
            {timelineEvents.length} Events
          </div>
        </div>
        <div>
          <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'} mb-1`} style={{ color: awayTeamColor }}>
            {awayGoals.length}
          </div>
          <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Goals</div>
          <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground mt-1 ${isMobile ? 'truncate' : ''}`}>
            {isMobile ? 
              (fixture.away_team?.name || '').split(' ')[0] || 'Away' :
              fixture.away_team?.name
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchStatisticsFooter;
