
import { Card, CardContent } from "@/components/ui/card";
import { Users, Trophy, Zap, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EnhancedMatchStatsProps {
  fixture: any;
  homeGoalsCount: number;
  awayGoalsCount: number;
  cardsCount: number;
  timelineEventsCount: number;
  homeTeamColor: string;
  awayTeamColor: string;
  goals?: any[];
  cards?: any[];
  timelineEvents?: any[];
}

const EnhancedMatchStats = ({
  fixture,
  homeGoalsCount,
  awayGoalsCount,
  cardsCount,
  timelineEventsCount,
  homeTeamColor,
  awayTeamColor,
  goals = [],
  cards = [],
  timelineEvents = []
}: EnhancedMatchStatsProps) => {
  // Extract unique goal scorers
  const goalScorers = goals
    .filter(goal => goal.type === 'goal' || goal.event_type === 'goal')
    .map(goal => goal.player_name || goal.playerName)
    .filter(Boolean);

  // Extract unique card recipients
  const cardRecipients = cards
    .map(card => ({
      player: card.player_name || card.playerName,
      type: card.card_type || card.cardType || card.type
    }))
    .filter(card => card.player);

  // Extract substitution events from timeline
  const substitutions = timelineEvents
    .filter(event => 
      event.event_type === 'substitution' || 
      event.type === 'substitution' ||
      event.description?.toLowerCase().includes('substitution')
    )
    .map(event => event.player_name || event.description)
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Main Statistics Grid */}
      <Card className="premier-card-shadow match-border-gradient">
        <CardContent className="pt-6 match-gradient-stats">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-lg stat-block-home-gradient premier-card-shadow">
              <div className="text-2xl font-bold mb-1 text-foreground">
                {homeGoalsCount}
              </div>
              <div className="text-sm text-muted-foreground mb-2 font-medium">Goals</div>
              <div className="text-xs text-muted-foreground truncate font-medium">
                {fixture.home_team?.name || 'Home'}
              </div>
            </div>
            
            <div className="p-4 rounded-lg stat-block-neutral-gradient premier-card-shadow">
              <div className="text-2xl font-bold mb-1 text-amber-600 score-text-shadow">
                {cardsCount}
              </div>
              <div className="text-sm text-muted-foreground mb-2 font-medium">Cards</div>
              <div className="text-xs text-muted-foreground font-medium">
                {timelineEventsCount} Events
              </div>
            </div>
            
            <div className="p-4 rounded-lg stat-block-away-gradient premier-card-shadow">
              <div className="text-2xl font-bold mb-1 text-foreground">
                {awayGoalsCount}
              </div>
              <div className="text-sm text-muted-foreground mb-2 font-medium">Goals</div>
              <div className="text-xs text-muted-foreground truncate font-medium">
                {fixture.away_team?.name || 'Away'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player Participation Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Goal Scorers */}
        <Card className="premier-card-shadow">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm">Goal Scorers</h4>
              <Badge variant="outline" className="text-xs">
                {goalScorers.length}
              </Badge>
            </div>
            {goalScorers.length > 0 ? (
              <div className="space-y-1">
                {[...new Set(goalScorers)].map((scorer, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    • {scorer}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                No goals scored
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card Recipients */}
        <Card className="premier-card-shadow">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-amber-600" />
              <h4 className="font-semibold text-sm">Cards</h4>
              <Badge variant="outline" className="text-xs">
                {cardRecipients.length}
              </Badge>
            </div>
            {cardRecipients.length > 0 ? (
              <div className="space-y-1">
                {cardRecipients.map((card, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">• {card.player}</span>
                    <Badge 
                      variant={card.type === 'red' ? 'destructive' : 'outline'}
                      className="text-xs"
                    >
                      {card.type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                No cards issued
              </div>
            )}
          </CardContent>
        </Card>

        {/* Substitutions */}
        {substitutions.length > 0 && (
          <Card className="premier-card-shadow md:col-span-2">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-sm">Substitutions</h4>
                <Badge variant="outline" className="text-xs">
                  {substitutions.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {substitutions.map((sub, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    • {sub}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Match Duration */}
        <Card className="premier-card-shadow">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-green-600" />
              <h4 className="font-semibold text-sm">Match Status</h4>
            </div>
            <div className="text-sm text-muted-foreground">
              <div>Status: {fixture.status === 'completed' ? 'Full Time' : 'In Progress'}</div>
              <div>Events: {timelineEventsCount} recorded</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedMatchStats;
