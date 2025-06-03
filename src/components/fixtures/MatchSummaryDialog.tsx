
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Trophy, Target, Timer, Users, AlertTriangle, X } from "lucide-react";
import { useMatchEvents } from "@/hooks/useMatchEvents";
import { useToast } from "@/hooks/use-toast";

interface MatchSummaryDialogProps {
  fixture: any;
  isOpen: boolean;
  onClose: () => void;
}

const MatchSummaryDialog = ({ fixture, isOpen, onClose }: MatchSummaryDialogProps) => {
  const { data: matchEvents, isLoading } = useMatchEvents(fixture?.id);
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

  const goals = (matchEvents || []).filter(event => event.event_type === 'goal');
  // Remove the assists filter since 'assist' is not a valid event type in the database
  const cards = (matchEvents || []).filter(event => 
    event.event_type === 'yellow_card' || event.event_type === 'red_card'
  );

  const homeGoals = goals.filter(g => g.team_id === fixture?.home_team_id);
  const awayGoals = goals.filter(g => g.team_id === fixture?.away_team_id);
  const homeCards = cards.filter(c => c.team_id === fixture?.home_team_id);
  const awayCards = cards.filter(c => c.team_id === fixture?.away_team_id);

  const handleExportSummary = () => {
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
      cards
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

  if (!fixture) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Match Summary
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
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
                        <div key={event.id} className="text-sm flex items-center justify-between p-2 bg-green-50 rounded">
                          <div>
                            <Badge variant="default" className="mr-2">
                              goal
                            </Badge>
                            <span>{event.player_name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{formatTime(event.event_time)}</span>
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
                        <div key={event.id} className="text-sm flex items-center justify-between p-2 bg-blue-50 rounded">
                          <div>
                            <Badge variant="default" className="mr-2">
                              goal
                            </Badge>
                            <span>{event.player_name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{formatTime(event.event_time)}</span>
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
                        <div key={card.id} className="text-sm flex items-center justify-between p-2 bg-red-50 rounded">
                          <div>
                            <Badge variant={card.event_type === 'red_card' ? 'destructive' : 'outline'} className="mr-2">
                              {card.event_type.replace('_', ' ')}
                            </Badge>
                            <span>{card.player_name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{formatTime(card.event_time)}</span>
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
                        <div key={card.id} className="text-sm flex items-center justify-between p-2 bg-red-50 rounded">
                          <div>
                            <Badge variant={card.event_type === 'red_card' ? 'destructive' : 'outline'} className="mr-2">
                              {card.event_type.replace('_', ' ')}
                            </Badge>
                            <span>{card.player_name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{formatTime(card.event_time)}</span>
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

          {/* All Events */}
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

          {/* Export Button */}
          <Button onClick={handleExportSummary} className="w-full" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Match Summary
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchSummaryDialog;
