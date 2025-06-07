
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, AlertTriangle, Clock, Calendar, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
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
  const [cardsExpanded, setCardsExpanded] = useState(false);
  
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

  const formatMinutes = (seconds: number) => {
    return Math.floor(seconds / 60);
  };

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
      {/* Premier League Style Header */}
      <Card className="overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          {/* Match Info Bar */}
          <div className="flex items-center justify-center gap-4 text-sm text-purple-100 mb-6">
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
            <Badge variant="outline" className="bg-white text-purple-600 border-white">
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
                <div className="text-sm font-medium text-purple-100 mb-1">
                  {fixture.home_team?.name || 'Home'}
                </div>
                <div className="text-5xl font-bold text-white">
                  {fixture.home_score || 0}
                </div>
              </div>
            </div>

            <div className="text-center px-8">
              <div className="text-2xl font-light text-purple-200 mb-2">-</div>
              <Badge variant="outline" className={`bg-white ${getResultColor()} border-white font-semibold`}>
                {getResult()}
              </Badge>
            </div>

            <div className="flex items-center gap-4 flex-1 justify-end">
              <div className="text-center">
                <div className="text-sm font-medium text-purple-100 mb-1">
                  {fixture.away_team?.name || 'Away'}
                </div>
                <div className="text-5xl font-bold text-white">
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
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-semibold flex items-center gap-2 mb-6 text-lg">
            <Target className="h-5 w-5" />
            Match Events ({goals.length})
          </h4>
          
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12 bg-muted/30 rounded-lg">
              No goals recorded in this match
            </p>
          ) : (
            <div className="space-y-6">
              {goals.map((goal, index) => {
                const isHomeGoal = processedEvents.homeGoals.includes(goal);
                const teamLogo = isHomeGoal ? fixture.home_team?.logoURL : fixture.away_team?.logoURL;
                const teamName = isHomeGoal ? fixture.home_team?.name : fixture.away_team?.name;
                const teamColor = isHomeGoal ? teamData.homeTeamColor : teamData.awayTeamColor;
                const playerName = getGoalPlayerName(goal);
                const assistName = getGoalAssistPlayerName(goal);
                const time = getGoalTime(goal);
                
                return (
                  <div 
                    key={`goal-${goal.id}-${index}`} 
                    className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <TeamLogoDisplay 
                        teamName={teamName}
                        teamLogo={teamLogo}
                        teamColor={teamColor}
                        size="sm"
                        showName={false}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-2xl">⚽</span>
                        <div className="font-semibold text-lg text-green-800">
                          {playerName}
                        </div>
                        <Badge 
                          variant="outline" 
                          className="bg-green-600 text-white border-green-600 font-bold px-3 py-1"
                        >
                          {formatMinutes(time)}'
                        </Badge>
                      </div>
                      
                      {assistName && (
                        <div className="text-sm text-green-700 ml-8 flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
                            ASSIST
                          </Badge>
                          <span className="font-medium">{assistName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collapsible Cards Section */}
      <Card>
        <CardContent className="pt-6">
          <button 
            onClick={() => setCardsExpanded(!cardsExpanded)}
            className="w-full flex items-center justify-between mb-4 text-lg font-semibold hover:text-yellow-600 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Disciplinary ({cards.length})
            </div>
            {cardsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {cardsExpanded && (
            <div className="space-y-3">
              {cards.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 bg-muted/30 rounded-lg">
                  No cards issued in this match
                </p>
              ) : (
                cards.map((card, index) => {
                  const isHomeCard = getCardTeamId(card) === fixture?.home_team_id;
                  const teamLogo = isHomeCard ? fixture.home_team?.logoURL : fixture.away_team?.logoURL;
                  const teamName = isHomeCard ? fixture.home_team?.name : fixture.away_team?.name;
                  const teamColor = isHomeCard ? teamData.homeTeamColor : teamData.awayTeamColor;
                  const cardType = getCardType(card);
                  const isRed = isCardRed(card);
                  
                  return (
                    <div 
                      key={`card-${card.id}-${index}`} 
                      className={`flex items-center gap-4 p-4 rounded-lg border ${
                        isRed 
                          ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200' 
                          : 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
                      }`}
                    >
                      <TeamLogoDisplay 
                        teamName={teamName}
                        teamLogo={teamLogo}
                        teamColor={teamColor}
                        size="sm"
                        showName={false}
                      />
                      
                      <div className="flex-1 flex items-center gap-3">
                        <span className="text-lg">{isRed ? '🟥' : '🟨'}</span>
                        <div className="font-semibold text-base">
                          {getCardPlayerName(card)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={isRed ? 'destructive' : 'outline'} 
                          className={`font-bold px-3 py-1 ${
                            !isRed ? 'bg-yellow-500 text-white border-yellow-500' : ''
                          }`}
                        >
                          {cardType.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground font-mono">
                          {formatMinutes(getCardTime(card))}'
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Match Timeline Section */}
      {timelineEvents.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold flex items-center gap-2 mb-4 text-lg">
              <Clock className="h-5 w-5" />
              Match Timeline ({timelineEvents.length})
            </h4>
            <EnhancedMatchEventsTimeline
              timelineEvents={timelineEvents}
              formatTime={formatTime}
            />
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics Box */}
      <Card className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 border-2">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <TeamLogoDisplay 
                teamName={fixture.home_team?.name || 'Home'}
                teamLogo={fixture.home_team?.logoURL}
                teamColor={teamData.homeTeamColor}
                size="sm"
                showName={false}
              />
              <div className="text-3xl font-bold mt-2 mb-1" style={{ color: teamData.homeTeamColor }}>
                {processedEvents.homeGoals.length}
              </div>
              <div className="text-sm text-muted-foreground">Goals</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center mb-2">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div className="text-3xl font-bold mb-1 text-amber-600">
                {cards.length}
              </div>
              <div className="text-sm text-muted-foreground">Cards</div>
            </div>
            
            <div className="flex flex-col items-center">
              <TeamLogoDisplay 
                teamName={fixture.away_team?.name || 'Away'}
                teamLogo={fixture.away_team?.logoURL}
                teamColor={teamData.awayTeamColor}
                size="sm"
                showName={false}
              />
              <div className="text-3xl font-bold mt-2 mb-1" style={{ color: teamData.awayTeamColor }}>
                {processedEvents.awayGoals.length}
              </div>
              <div className="text-sm text-muted-foreground">Goals</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedMatchSummaryLayout;
