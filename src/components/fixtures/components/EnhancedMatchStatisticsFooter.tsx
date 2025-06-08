
import { useIsMobile } from "@/hooks/use-mobile";
import { getScoreStyle } from "@/utils/scoreColorUtils";

interface EnhancedMatchStatisticsFooterProps {
  homeGoals: any[];
  awayGoals: any[];
  cards: any[];
  timelineEvents: any[];
  homeTeamColor: string;
  awayTeamColor: string;
  fixture: any;
}

const EnhancedMatchStatisticsFooter = ({
  homeGoals,
  awayGoals,
  cards,
  timelineEvents,
  homeTeamColor,
  awayTeamColor,
  fixture
}: EnhancedMatchStatisticsFooterProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={`match-gradient-stats rounded-xl border match-border-gradient premier-card-shadow-lg ${isMobile ? 'p-4' : 'p-6'}`}>
      {/* Mobile: Compact centered layout optimized for export */}
      {isMobile ? (
        <div className="w-full">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg stat-block-home-gradient premier-card-shadow">
              <div 
                className="text-xl font-bold mb-1 score-text-outline"
                style={getScoreStyle(homeTeamColor)}
              >
                {homeGoals.length}
              </div>
              <div className="text-muted-foreground text-xs font-medium mb-1">Goals</div>
              <div className="text-xs text-muted-foreground">
                <div className="break-words max-w-[70px] mx-auto leading-tight">
                  {fixture.home_team?.name || 'Home'}
                </div>
              </div>
            </div>
            
            <div className="p-3 rounded-lg stat-block-neutral-gradient premier-card-shadow">
              <div className="text-xl font-bold mb-1 text-amber-600 score-text-shadow">{cards.length}</div>
              <div className="text-muted-foreground text-xs font-medium mb-1">Cards</div>
              <div className="text-xs text-muted-foreground">
                {timelineEvents.length} Events
              </div>
            </div>
            
            <div className="p-3 rounded-lg stat-block-away-gradient premier-card-shadow">
              <div 
                className="text-xl font-bold mb-1 score-text-outline"
                style={getScoreStyle(awayTeamColor)}
              >
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
        /* Desktop layout with enhanced Premier League styling */
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="p-4 rounded-lg stat-block-home-gradient premier-card-shadow">
            <div 
              className="text-2xl font-bold mb-1 score-text-outline"
              style={getScoreStyle(homeTeamColor)}
            >
              {homeGoals.length}
            </div>
            <div className="text-muted-foreground text-sm font-medium">Goals</div>
            <div className="text-xs text-muted-foreground mt-1">
              {fixture.home_team?.name}
            </div>
          </div>
          
          <div className="p-4 rounded-lg stat-block-neutral-gradient premier-card-shadow">
            <div className="text-2xl font-bold mb-1 text-amber-600 score-text-shadow">{cards.length}</div>
            <div className="text-muted-foreground text-sm font-medium">Total Cards</div>
            <div className="text-xs text-muted-foreground mt-1">
              {timelineEvents.length} Events
            </div>
          </div>
          
          <div className="p-4 rounded-lg stat-block-away-gradient premier-card-shadow">
            <div 
              className="text-2xl font-bold mb-1 score-text-outline"
              style={getScoreStyle(awayTeamColor)}
            >
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

export default EnhancedMatchStatisticsFooter;
