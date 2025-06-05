
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Trophy, Target, Timer, AlertTriangle, FileImage, FileText, Database } from "lucide-react";
import { useMatchEvents } from "@/hooks/useMatchEvents";
import { useEnhancedMatchSummary } from "@/hooks/useEnhancedMatchSummary";
import { useToast } from "@/hooks/use-toast";
import { exportToJPEG, exportToCSV } from "@/utils/exportUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import EnhancedMatchEventsTimeline from "../referee/components/EnhancedMatchEventsTimeline";

interface MatchSummaryDialogProps {
  fixture: any;
  isOpen: boolean;
  onClose: () => void;
}

// Type guards and helper functions
const isEnhancedGoal = (goal: any): goal is { id: number; playerId: number; playerName: string; team: string; teamId: string; type: "assist" | "goal"; time: number; timestamp: string; assistPlayerName?: string; assistTeamId?: string; } => {
  return 'teamId' in goal && 'playerName' in goal && 'time' in goal;
};

const isEnhancedCard = (card: any): card is { id: number; playerId: number; playerName: string; team: string; teamId: string; cardType: "yellow" | "red"; type: "yellow" | "red"; time: number; timestamp: string; } => {
  return 'teamId' in card && 'playerName' in card && 'time' in card && 'type' in card;
};

const getGoalTeamId = (goal: any): string => {
  return isEnhancedGoal(goal) ? goal.teamId : goal.team_id;
};

const getGoalPlayerName = (goal: any): string => {
  return isEnhancedGoal(goal) ? goal.playerName : goal.player_name;
};

const getGoalTime = (goal: any): number => {
  return isEnhancedGoal(goal) ? goal.time : goal.event_time;
};

const getCardTeamId = (card: any): string => {
  return isEnhancedCard(card) ? card.teamId : card.team_id;
};

const getCardPlayerName = (card: any): string => {
  return isEnhancedCard(card) ? card.playerName : card.player_name;
};

const getCardTime = (card: any): number => {
  return isEnhancedCard(card) ? card.time : card.event_time;
};

const getCardType = (card: any): string => {
  if (isEnhancedCard(card)) {
    return card.type === 'red' ? 'red card' : 'yellow card';
  }
  return card.event_type.replace('_', ' ');
};

const isCardRed = (card: any): boolean => {
  if (isEnhancedCard(card)) {
    return card.type === 'red';
  }
  return card.event_type === 'red_card';
};

const MatchSummaryDialog = ({ fixture, isOpen, onClose }: MatchSummaryDialogProps) => {
  const { data: matchEvents, isLoading } = useMatchEvents(fixture?.id);
  const { data: enhancedData, isSuccess: enhancedSuccess } = useEnhancedMatchSummary(fixture?.id);
  const { toast } = useToast();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  // Use enhanced data when available, fallback to match events
  const shouldUseEnhancedData = enhancedSuccess && enhancedData;
  const goals = shouldUseEnhancedData 
    ? enhancedData.goals.filter(g => g.type === 'goal')
    : (matchEvents || []).filter(event => event.event_type === 'goal');
  const cards = shouldUseEnhancedData
    ? enhancedData.cards
    : (matchEvents || []).filter(event => 
        event.event_type === 'yellow_card' || event.event_type === 'red_card'
      );

  const homeGoals = goals.filter(g => getGoalTeamId(g) === fixture?.home_team_id);
  const awayGoals = goals.filter(g => getGoalTeamId(g) === fixture?.away_team_id);
  const homeCards = cards.filter(c => getCardTeamId(c) === fixture?.home_team_id);
  const awayCards = cards.filter(c => getCardTeamId(c) === fixture?.away_team_id);

  const handleExportJSON = () => {
    const summaryData = {
      fixture: {
        homeTeam: fixture?.home_team?.name,
        awayTeam: fixture?.away_team?.name,
        homeScore: fixture?.home_score || 0,
        awayScore: fixture?.away_score || 0,
        date: fixture?.match_date,
        venue: fixture?.venue
      },
      events: matchEvents || [],
      goals,
      cards,
      enhancedData: shouldUseEnhancedData ? enhancedData : null
    };
    
    const dataStr = JSON.stringify(summaryData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `match-summary-${fixture?.home_team?.name}-vs-${fixture?.away_team?.name}-${fixture?.match_date}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Match Summary Exported",
      description: "Match summary has been downloaded as JSON file.",
    });
  };

  const handleExportJPEG = async () => {
    try {
      const filename = `match-summary-${fixture?.home_team?.name}-vs-${fixture?.away_team?.name}-${fixture?.match_date}.jpg`;
      await exportToJPEG('match-summary-content', filename);
      toast({
        title: "Match Summary Exported",
        description: "Match summary has been downloaded as JPEG image.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export match summary as image.",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    try {
      // Prepare CSV data
      const csvData = [
        // Match info
        { Type: 'Match', Team: fixture?.home_team?.name, Score: fixture?.home_score || 0, Result: getResult() },
        { Type: 'Match', Team: fixture?.away_team?.name, Score: fixture?.away_score || 0, Result: getResult() },
        // Goals
        ...goals.map(goal => ({
          Type: 'Goal',
          Team: getGoalTeamId(goal) === fixture?.home_team_id ? fixture?.home_team?.name : fixture?.away_team?.name,
          Player: getGoalPlayerName(goal),
          Time: formatTime(getGoalTime(goal)),
          Description: isEnhancedGoal(goal) ? '' : goal.description
        })),
        // Cards
        ...cards.map(card => ({
          Type: getCardType(card),
          Team: getCardTeamId(card) === fixture?.home_team_id ? fixture?.home_team?.name : fixture?.away_team?.name,
          Player: getCardPlayerName(card),
          Time: formatTime(getCardTime(card)),
          Description: isEnhancedCard(card) ? '' : card.description
        }))
      ];

      const filename = `match-summary-${fixture?.home_team?.name}-vs-${fixture?.away_team?.name}-${fixture?.match_date}.csv`;
      exportToCSV(csvData, filename);
      
      toast({
        title: "Match Summary Exported",
        description: "Match summary has been downloaded as CSV file.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export match summary as CSV.",
        variant: "destructive",
      });
    }
  };

  if (!fixture) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Match Summary
            {shouldUseEnhancedData && (
              <Database className="h-4 w-4 text-green-600" />
            )}
          </DialogTitle>
        </DialogHeader>

        <div id="match-summary-content" className="space-y-6">
          {/* Enhanced Data Status Indicator */}
          {shouldUseEnhancedData && (
            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                Enhanced data service active - displaying comprehensive match analytics.
              </AlertDescription>
            </Alert>
          )}

          {/* Match Result */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <p className="font-bold text-lg">{fixture.home_team?.name}</p>
                    <p className="text-3xl font-bold">{fixture.home_score || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">VS</p>
                    <Badge variant="outline" className={getResultColor()}>
                      {getResult()}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">{fixture.away_team?.name}</p>
                    <p className="text-3xl font-bold">{fixture.away_score || 0}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <span>📅 {fixture.match_date}</span>
                  {fixture.venue && <span>📍 {fixture.venue}</span>}
                  <span>🏆 {fixture.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Timeline - Only show if we have enhanced data with timeline events */}
          {shouldUseEnhancedData && enhancedData.timelineEvents && enhancedData.timelineEvents.length > 0 && (
            <>
              <EnhancedMatchEventsTimeline
                timelineEvents={enhancedData.timelineEvents}
                formatTime={formatTime}
              />
              <Separator />
            </>
          )}

          {/* Goals */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4" />
                Goals ({goals.length})
              </h4>
              
              {goals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No goals recorded</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Home Goals */}
                  <div>
                    <h5 className="font-medium text-sm mb-2">{fixture.home_team?.name}</h5>
                    <div className="space-y-1">
                      {homeGoals.map((event, index) => (
                        <div key={`home-goal-${event.id}-${index}`} className="text-sm flex items-center justify-between p-2 bg-green-50 rounded">
                          <div>
                            <Badge variant="default" className="mr-2">
                              goal
                            </Badge>
                            <span>{getGoalPlayerName(event)}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(getGoalTime(event))}
                          </span>
                        </div>
                      ))}
                      {homeGoals.length === 0 && (
                        <p className="text-xs text-muted-foreground">No goals</p>
                      )}
                    </div>
                  </div>

                  {/* Away Goals */}
                  <div>
                    <h5 className="font-medium text-sm mb-2">{fixture.away_team?.name}</h5>
                    <div className="space-y-1">
                      {awayGoals.map((event, index) => (
                        <div key={`away-goal-${event.id}-${index}`} className="text-sm flex items-center justify-between p-2 bg-blue-50 rounded">
                          <div>
                            <Badge variant="default" className="mr-2">
                              goal
                            </Badge>
                            <span>{getGoalPlayerName(event)}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(getGoalTime(event))}
                          </span>
                        </div>
                      ))}
                      {awayGoals.length === 0 && (
                        <p className="text-xs text-muted-foreground">No goals</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cards */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Cards ({cards.length})
              </h4>
              
              {cards.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No cards issued</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Home Cards */}
                  <div>
                    <h5 className="font-medium text-sm mb-2">{fixture.home_team?.name}</h5>
                    <div className="space-y-1">
                      {homeCards.map((card, index) => (
                        <div key={`home-card-${card.id}-${index}`} className="text-sm flex items-center justify-between p-2 bg-red-50 rounded">
                          <div>
                            <Badge variant={isCardRed(card) ? 'destructive' : 'outline'} className="mr-2">
                              {getCardType(card)}
                            </Badge>
                            <span>{getCardPlayerName(card)}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(getCardTime(card))}
                          </span>
                        </div>
                      ))}
                      {homeCards.length === 0 && (
                        <p className="text-xs text-muted-foreground">No cards</p>
                      )}
                    </div>
                  </div>

                  {/* Away Cards */}
                  <div>
                    <h5 className="font-medium text-sm mb-2">{fixture.away_team?.name}</h5>
                    <div className="space-y-1">
                      {awayCards.map((card, index) => (
                        <div key={`away-card-${card.id}-${index}`} className="text-sm flex items-center justify-between p-2 bg-red-50 rounded">
                          <div>
                            <Badge variant={isCardRed(card) ? 'destructive' : 'outline'} className="mr-2">
                              {getCardType(card)}
                            </Badge>
                            <span>{getCardPlayerName(card)}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(getCardTime(card))}
                          </span>
                        </div>
                      ))}
                      {awayCards.length === 0 && (
                        <p className="text-xs text-muted-foreground">No cards</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Events - Only show if we don't have enhanced timeline or as fallback */}
          {(!shouldUseEnhancedData || !enhancedData.timelineEvents || enhancedData.timelineEvents.length === 0) && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h4 className="font-semibold">All Match Events ({(matchEvents || []).length})</h4>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Loading events...</p>
                ) : (matchEvents || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No events recorded</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {(matchEvents || []).map((event) => (
                      <div key={event.id} className="text-sm p-2 bg-muted/10 rounded">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {event.event_type.replace('_', ' ')}
                            </Badge>
                            <span>{event.description}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{formatTime(event.event_time)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleExportJSON} variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            JSON
          </Button>
          <Button onClick={handleExportJPEG} variant="outline" className="flex-1">
            <FileImage className="h-4 w-4 mr-2" />
            JPEG
          </Button>
          <Button onClick={handleExportCSV} variant="outline" className="flex-1">
            <FileText className="h-4 w-4 mr-2" />
            CSV
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchSummaryDialog;
