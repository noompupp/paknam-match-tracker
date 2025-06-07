
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, AlertTriangle, Clock, Calendar, MapPin } from "lucide-react";
import TeamLogoDisplay from "../TeamLogoDisplay";
import EnhancedMatchEventsTimeline from "../../referee/components/EnhancedMatchEventsTimeline";
import { getGoalAssistPlayerName } from "../utils/matchSummaryDataProcessor";
import { extractTeamData, processTeamEvents } from "../utils/teamDataProcessor";
import IPhoneStoryLayout from "./export/IPhoneStoryLayout";
import { useIsMobile } from "@/hooks/use-mobile";

interface UnifiedMatchSummaryLayoutProps {
  fixture: any;
  goals: any[];
  cards: any[];
  timelineEvents: any[];
  formatTime: (seconds: number) => string;
  getGoalTeamId: (goal: any) => string;
  getGoalPlayerName: (goal: any) => string;
  getGoalTime: (goal: any) => number;
  getCardTeamId: (card: any) => string;
  getCardPlayerName: (card: any) => string;
  getCardTime: (card: any) => number;
  getCardType: (card: any) => string;
  isCardRed: (card: any) => boolean;
}

const UnifiedMatchSummaryLayout = ({
  fixture,
  goals,
  cards,
  timelineEvents,
  formatTime,
  getGoalTeamId,
  getGoalPlayerName,
  getGoalTime,
  getCardTeamId,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed
}: UnifiedMatchSummaryLayoutProps) => {
  const isMobile = useIsMobile();
  
  // Extract team data using the existing utility
  const teamData = extractTeamData(fixture);
  const processedEvents = processTeamEvents(goals, cards, teamData, getCardTeamId);

  // Check if we're in export mode on mobile
  const isExportMode = isMobile && document.getElementById('match-summary-content')?.classList.contains('export-mode-mobile');

  // Use iPhone story layout for mobile export mode
  if (isMobile && isExportMode) {
    return (
      <IPhoneStoryLayout
        fixture={fixture}
        goals={goals}
        cards={cards}
        homeGoals={processedEvents.homeGoals}
        awayGoals={processedEvents.awayGoals}
        homeTeamColor={teamData.homeTeamColor}
        awayTeamColor={teamData.awayTeamColor}
        timelineEvents={timelineEvents}
        getCardPlayerName={getCardPlayerName}
        getCardTime={getCardTime}
        getCardType={getCardType}
        isCardRed={isCardRed}
      />
    );
  }

  const getResult = () => {
    const homeScore = fixture?.home_score || 0;
    const awayScore = fixture?.away_score || 0;
    if (homeScore > awayScore) return 'Home Win';
    if (awayScore > homeScore) return 'Away Win';
    return 'Draw';
  };

  const getResultColor = () => {
    const homeScore = fixture?.home_score || 0;
    const awayScore = fixture?.away_score || 0;
    if (homeScore > awayScore) return 'text-green-600';
    if (awayScore > homeScore) return 'text-blue-600';
    return 'text-yellow-600';
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          {/* Match Info Bar */}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{fixture.match_date}</span>
            </div>
            {fixture.venue && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{fixture.venue}</span>
                </div>
              </>
            )}
            <span>•</span>
            <Badge variant={fixture.status === 'completed' ? 'default' : 'outline'}>
              {fixture.status === 'completed' ? 'FULL TIME' : fixture.status}
            </Badge>
          </div>

          {/* Teams and Score */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <TeamLogoDisplay 
                teamName={fixture.home_team?.name || 'Home'}
                teamLogo={fixture.home_team?.logoURL}
                teamColor={teamData.homeTeamColor}
                size="lg"
                showName={false}
              />
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  {fixture.home_team?.name || 'Home'}
                </div>
                <div 
                  className="text-4xl font-bold"
                  style={{ color: teamData.homeTeamColor }}
                >
                  {fixture.home_score || 0}
                </div>
              </div>
            </div>

            <div className="text-center px-8">
              <div className="text-3xl font-light text-muted-foreground mb-2">VS</div>
              <Badge variant="outline" className={getResultColor()}>
                {getResult()}
              </Badge>
            </div>

            <div className="flex items-center gap-4 flex-1 justify-end">
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  {fixture.away_team?.name || 'Away'}
                </div>
                <div 
                  className="text-4xl font-bold"
                  style={{ color: teamData.awayTeamColor }}
                >
                  {fixture.away_score || 0}
                </div>
              </div>
              <TeamLogoDisplay 
                teamName={fixture.away_team?.name || 'Away'}
                teamLogo={fixture.away_team?.logoURL}
                teamColor={teamData.awayTeamColor}
                size="lg"
                showName={false}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Events Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Goals */}
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <Target className="h-4 w-4" />
              Goals ({goals.length})
            </h4>
            
            {goals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No goals recorded</p>
            ) : (
              <div className="space-y-3">
                {goals.map((goal, index) => {
                  const isHomeGoal = processedEvents.homeGoals.includes(goal);
                  const teamColor = isHomeGoal ? teamData.homeTeamColor : teamData.awayTeamColor;
                  const playerName = getGoalPlayerName(goal);
                  const assistName = getGoalAssistPlayerName(goal);
                  const time = getGoalTime(goal);
                  
                  return (
                    <div 
                      key={`goal-${goal.id}-${index}`} 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: teamColor }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{playerName}</div>
                          {assistName && (
                            <div className="text-xs text-muted-foreground">
                              Assist: {assistName}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {Math.floor(time / 60)}'
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cards */}
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4" />
              Cards ({cards.length})
            </h4>
            
            {cards.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No cards issued</p>
            ) : (
              <div className="space-y-3">
                {cards.map((card, index) => {
                  const isHomeCard = getCardTeamId(card) === fixture?.home_team_id;
                  const teamColor = isHomeCard ? teamData.homeTeamColor : teamData.awayTeamColor;
                  
                  return (
                    <div 
                      key={`card-${card.id}-${index}`} 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: teamColor }}
                        />
                        <div className="font-medium text-sm">
                          {getCardPlayerName(card)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={isCardRed(card) ? 'destructive' : 'outline'} className="text-xs">
                          {getCardType(card)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {Math.floor(getCardTime(card) / 60)}'
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics Box */}
      <Card className="bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold mb-1" style={{ color: teamData.homeTeamColor }}>
                {processedEvents.homeGoals.length}
              </div>
              <div className="text-sm text-muted-foreground mb-2">Goals</div>
              <div className="text-xs text-muted-foreground truncate">
                {fixture.home_team?.name || 'Home'}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1 text-amber-600">
                {cards.length}
              </div>
              <div className="text-sm text-muted-foreground mb-2">Cards</div>
              <div className="text-xs text-muted-foreground">
                {timelineEvents.length} Events
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1" style={{ color: teamData.awayTeamColor }}>
                {processedEvents.awayGoals.length}
              </div>
              <div className="text-sm text-muted-foreground mb-2">Goals</div>
              <div className="text-xs text-muted-foreground truncate">
                {fixture.away_team?.name || 'Away'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Timeline Section */}
      {timelineEvents.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4" />
              Match Timeline ({timelineEvents.length})
            </h4>
            <EnhancedMatchEventsTimeline
              timelineEvents={timelineEvents}
              formatTime={formatTime}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnifiedMatchSummaryLayout;
