import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Trophy, Target, Timer, AlertTriangle, FileImage, FileText, Database, Palette, Layout } from "lucide-react";
import { useMatchEvents } from "@/hooks/useMatchEvents";
import { useEnhancedMatchSummary } from "@/hooks/useEnhancedMatchSummary";
import { useToast } from "@/hooks/use-toast";
import { exportToJPEG, exportToCSV } from "@/utils/exportUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import EnhancedMatchEventsTimeline from "../referee/components/EnhancedMatchEventsTimeline";
import PremierLeagueStyleSummary from "./PremierLeagueStyleSummary";

interface MatchSummaryDialogProps {
  fixture: any;
  isOpen: boolean;
  onClose: () => void;
}

// Unified data processing - using Enhanced Timeline as primary source
const processUnifiedMatchData = (enhancedData: any) => {
  if (!enhancedData?.timelineEvents) {
    return { goals: [], cards: [], timelineEvents: [] };
  }

  const timelineEvents = enhancedData.timelineEvents;
  
  // Extract goals and cards from timeline events
  const goals = timelineEvents.filter((event: any) => event.type === 'goal');
  const cards = timelineEvents.filter((event: any) => 
    event.type === 'yellow_card' || event.type === 'red_card'
  );

  console.log('📊 Unified data processing:', {
    timelineEvents: timelineEvents.length,
    goals: goals.length,
    cards: cards.length
  });

  return { goals, cards, timelineEvents };
};

// Unified helper functions for both data sources
const getGoalTeamId = (goal: any): string => goal.teamId || goal.team_id || '';
const getGoalPlayerName = (goal: any): string => goal.playerName || goal.player_name || '';
const getGoalTime = (goal: any): number => goal.time || goal.event_time || 0;

const getCardTeamId = (card: any): string => card.teamId || card.team_id || '';
const getCardPlayerName = (card: any): string => card.playerName || card.player_name || '';
const getCardTime = (card: any): number => card.time || card.event_time || 0;
const getCardType = (card: any): string => {
  const type = card.type || card.cardType || card.event_type || '';
  return type.includes('red') ? 'red card' : 'yellow card';
};
const isCardRed = (card: any): boolean => {
  const type = card.type || card.cardType || card.event_type || '';
  return type.includes('red');
};

const MatchSummaryDialog = ({ fixture, isOpen, onClose }: MatchSummaryDialogProps) => {
  const { data: matchEvents, isLoading } = useMatchEvents(fixture?.id);
  const { data: enhancedData, isSuccess: enhancedSuccess } = useEnhancedMatchSummary(fixture?.id);
  const { toast } = useToast();
  const [viewStyle, setViewStyle] = useState<'compact' | 'full'>('compact');

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

  // Use Enhanced Timeline as primary data source
  let goals, cards, timelineEvents = [];

  if (enhancedSuccess && enhancedData?.timelineEvents?.length > 0) {
    const unifiedData = processUnifiedMatchData(enhancedData);
    goals = unifiedData.goals;
    cards = unifiedData.cards;
    timelineEvents = unifiedData.timelineEvents;
    console.log('✅ Using Enhanced Timeline data:', { goals: goals.length, cards: cards.length });
  } else {
    // Fallback to match events
    goals = (matchEvents || []).filter(event => event.event_type === 'goal');
    cards = (matchEvents || []).filter(event => 
      event.event_type === 'yellow_card' || event.event_type === 'red_card'
    );
    timelineEvents = matchEvents || [];
    console.log('⚠️ Using fallback match events data:', { goals: goals.length, cards: cards.length });
  }

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
      enhancedData: enhancedSuccess ? enhancedData : null
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
      const csvData = [
        { Type: 'Match', Team: fixture?.home_team?.name, Score: fixture?.home_score || 0, Result: getResult() },
        { Type: 'Match', Team: fixture?.away_team?.name, Score: fixture?.away_score || 0, Result: getResult() },
        ...goals.map(goal => ({
          Type: 'Goal',
          Team: getGoalTeamId(goal) === fixture?.home_team_id ? fixture?.home_team?.name : fixture?.away_team?.name,
          Player: getGoalPlayerName(goal),
          Time: formatTime(getGoalTime(goal)),
          Description: goal.assistPlayerName ? `Assist: ${goal.assistPlayerName}` : ''
        })),
        ...cards.map(card => ({
          Type: getCardType(card),
          Team: getCardTeamId(card) === fixture?.home_team_id ? fixture?.home_team?.name : fixture?.away_team?.name,
          Player: getCardPlayerName(card),
          Time: formatTime(getCardTime(card)),
          Description: ''
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
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Match Summary
              {enhancedSuccess && enhancedData?.timelineEvents?.length > 0 && (
                <Database className="h-4 w-4 text-green-600" />
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewStyle(viewStyle === 'compact' ? 'full' : 'compact')}
              className="flex items-center gap-2"
            >
              <Layout className="h-4 w-4" />
              {viewStyle === 'compact' ? 'Full View' : 'Compact View'}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div id="match-summary-content" className="space-y-6">
          {/* Enhanced Data Status */}
          {enhancedSuccess && enhancedData?.timelineEvents?.length > 0 && (
            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                Enhanced timeline active - displaying {timelineEvents.length} unified match events with {goals.length} goals and {cards.length} cards.
              </AlertDescription>
            </Alert>
          )}

          {/* Render based on view style */}
          {viewStyle === 'compact' ? (
            <PremierLeagueStyleSummary
              fixture={fixture}
              goals={goals}
              cards={cards}
              timelineEvents={timelineEvents}
              formatTime={formatTime}
              getGoalTeamId={getGoalTeamId}
              getGoalPlayerName={getGoalPlayerName}
              getGoalTime={getGoalTime}
              getCardTeamId={getCardTeamId}
              getCardPlayerName={getCardPlayerName}
              getCardTime={getCardTime}
              getCardType={getCardType}
              isCardRed={isCardRed}
            />
          ) : (
            <>
              {/* Traditional Full View */}
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

              {/* Enhanced Timeline */}
              {enhancedSuccess && enhancedData?.timelineEvents?.length > 0 && (
                <>
                  <EnhancedMatchEventsTimeline
                    timelineEvents={enhancedData.timelineEvents}
                    formatTime={formatTime}
                  />
                  <Separator />
                </>
              )}

              {/* Goals Section */}
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
                      <div>
                        <h5 className="font-medium text-sm mb-2">{fixture.home_team?.name}</h5>
                        <div className="space-y-1">
                          {homeGoals.map((goal, index) => (
                            <div key={`home-goal-${goal.id}-${index}`} className="text-sm flex items-center justify-between p-2 bg-green-50 rounded">
                              <div>
                                <Badge variant="default" className="mr-2">goal</Badge>
                                <span>{getGoalPlayerName(goal)}</span>
                                {goal.assistPlayerName && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Assist: {goal.assistPlayerName}
                                  </div>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(getGoalTime(goal))}
                              </span>
                            </div>
                          ))}
                          {homeGoals.length === 0 && (
                            <p className="text-xs text-muted-foreground">No goals</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-sm mb-2">{fixture.away_team?.name}</h5>
                        <div className="space-y-1">
                          {awayGoals.map((goal, index) => (
                            <div key={`away-goal-${goal.id}-${index}`} className="text-sm flex items-center justify-between p-2 bg-blue-50 rounded">
                              <div>
                                <Badge variant="default" className="mr-2">goal</Badge>
                                <span>{getGoalPlayerName(goal)}</span>
                                {goal.assistPlayerName && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Assist: {goal.assistPlayerName}
                                  </div>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(getGoalTime(goal))}
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

              {/* Cards Section */}
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
            </>
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
