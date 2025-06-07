
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
      <Card className="overflow-hidden">
        {/* Team Color Bar */}
        <div 
          className="h-2"
          style={{
            background: `linear-gradient(to right, ${teamData.homeTeamColor} 0%, ${teamData.homeTeamColor} 50%, ${teamData.awayTeamColor} 50%, ${teamData.awayTeamColor} 100%)`
          }}
        />
        
        <CardContent className="p-8 bg-gradient-to-br from-slate-50 via-white to-slate-50">
          {/* Match Info Bar */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{fixture.match_date}</span>
            </div>
            {fixture.venue && (
              <>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">{fixture.venue}</span>
                </div>
              </>
            )}
            <span className="text-slate-300">•</span>
            <Badge variant="outline" className="bg-white border-2 font-bold text-sm px-4 py-1.5">
              {fixture.status === 'completed' ? 'FULL TIME' : fixture.status?.toUpperCase() || 'MATCH'}
            </Badge>
          </div>

          {/* Teams and Score - Premier League Style */}
          <div className="flex items-center justify-between">
            {/* Home Team */}
            <div className="flex items-center gap-6 flex-1">
              <TeamLogoDisplay 
                teamName={fixture.home_team?.name || 'Home'}
                teamLogo={fixture.home_team?.logoURL}
                teamColor={teamData.homeTeamColor}
                size="lg"
                showName={false}
              />
              <div className="text-center">
                <div className="text-lg font-bold text-muted-foreground mb-2">
                  {fixture.home_team?.name || 'Home'}
                </div>
                <div 
                  className="text-7xl font-black leading-none"
                  style={{ color: teamData.homeTeamColor }}
                >
                  {fixture.home_score || 0}
                </div>
              </div>
            </div>

            {/* Center Score Separator */}
            <div className="text-center px-12">
              <div className="text-4xl font-extralight text-slate-300 mb-4">—</div>
              <Badge 
                variant="outline" 
                className={`${getResultColor()} border-2 font-bold text-lg px-6 py-2 bg-white shadow-sm`}
              >
                {getResult()}
              </Badge>
            </div>

            {/* Away Team */}
            <div className="flex items-center gap-6 flex-1 justify-end">
              <div className="text-center">
                <div className="text-lg font-bold text-muted-foreground mb-2">
                  {fixture.away_team?.name || 'Away'}
                </div>
                <div 
                  className="text-7xl font-black leading-none"
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
      <Card className="border-2">
        <CardContent className="pt-6">
          <h4 className="font-bold flex items-center gap-3 mb-6 text-xl text-green-700">
            <Target className="h-6 w-6" />
            Match Events ({goals.length})
          </h4>
          
          {goals.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border-2 border-dashed border-slate-200">
              <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-500">No goals recorded in this match</p>
              <p className="text-sm text-slate-400">Goals and assists will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
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
                    className="flex items-center gap-6 p-6 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-2 border-green-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <TeamLogoDisplay 
                      teamName={teamName}
                      teamLogo={teamLogo}
                      teamColor={teamColor}
                      size="md"
                      showName={false}
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-3xl">⚽</span>
                        <div className="font-bold text-xl text-green-800">
                          {playerName}
                        </div>
                        <Badge 
                          variant="outline" 
                          className="bg-green-600 text-white border-green-600 font-bold text-lg px-4 py-2"
                        >
                          {formatMinutes(time)}'
                        </Badge>
                      </div>
                      
                      {assistName && (
                        <div className="text-base text-green-700 ml-10 flex items-center gap-3">
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 font-medium">
                            ASSIST
                          </Badge>
                          <span className="font-semibold">{assistName}</span>
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
      <Card className="border-2">
        <CardContent className="pt-6">
          <button 
            onClick={() => setCardsExpanded(!cardsExpanded)}
            className="w-full flex items-center justify-between mb-6 text-xl font-bold text-yellow-700 hover:text-yellow-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6" />
              Disciplinary ({cards.length})
            </div>
            {cardsExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          
          {cardsExpanded && (
            <div className="space-y-4">
              {cards.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border-2 border-dashed border-yellow-200">
                  <AlertTriangle className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
                  <p className="text-lg font-medium text-yellow-600">No cards issued in this match</p>
                  <p className="text-sm text-yellow-500">Disciplinary actions will appear here</p>
                </div>
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
                      className={`flex items-center gap-6 p-6 rounded-xl border-2 shadow-sm hover:shadow-md transition-shadow ${
                        isRed 
                          ? 'bg-gradient-to-r from-red-50 via-pink-50 to-red-50 border-red-200' 
                          : 'bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 border-yellow-200'
                      }`}
                    >
                      <TeamLogoDisplay 
                        teamName={teamName}
                        teamLogo={teamLogo}
                        teamColor={teamColor}
                        size="md"
                        showName={false}
                      />
                      
                      <div className="flex-1 flex items-center gap-4">
                        <span className="text-2xl">{isRed ? '🟥' : '🟨'}</span>
                        <div className="font-bold text-xl">
                          {getCardPlayerName(card)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge 
                          variant={isRed ? 'destructive' : 'outline'} 
                          className={`font-bold text-lg px-4 py-2 ${
                            !isRed ? 'bg-yellow-500 text-white border-yellow-500' : ''
                          }`}
                        >
                          {cardType.toUpperCase()}
                        </Badge>
                        <span className="text-base text-muted-foreground font-mono font-bold">
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

      {/* Enhanced Match Timeline Section */}
      {timelineEvents.length > 0 && (
        <Card className="border-2">
          <CardContent className="pt-6">
            <h4 className="font-bold flex items-center gap-3 mb-6 text-xl text-slate-700">
              <Clock className="h-6 w-6" />
              Match Timeline ({timelineEvents.length})
            </h4>
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
              <EnhancedMatchEventsTimeline
                timelineEvents={timelineEvents}
                formatTime={formatTime}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Summary Statistics Box */}
      <Card className="bg-gradient-to-br from-slate-50 via-white to-slate-50 border-2 shadow-lg">
        <CardContent className="pt-8 pb-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <TeamLogoDisplay 
                teamName={fixture.home_team?.name || 'Home'}
                teamLogo={fixture.home_team?.logoURL}
                teamColor={teamData.homeTeamColor}
                size="md"
                showName={false}
              />
              <div className="text-5xl font-black mb-2" style={{ color: teamData.homeTeamColor }}>
                {processedEvents.homeGoals.length}
              </div>
              <div className="text-lg font-bold text-muted-foreground">Goals</div>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <div className="text-5xl font-black mb-2 text-amber-600">
                {cards.length}
              </div>
              <div className="text-lg font-bold text-muted-foreground">Cards</div>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <TeamLogoDisplay 
                teamName={fixture.away_team?.name || 'Away'}
                teamLogo={fixture.away_team?.logoURL}
                teamColor={teamData.awayTeamColor}
                size="md"
                showName={false}
              />
              <div className="text-5xl font-black mb-2" style={{ color: teamData.awayTeamColor }}>
                {processedEvents.awayGoals.length}
              </div>
              <div className="text-lg font-bold text-muted-foreground">Goals</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedMatchSummaryLayout;
