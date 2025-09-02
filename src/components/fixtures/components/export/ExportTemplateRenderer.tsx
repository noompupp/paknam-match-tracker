import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Calendar, MapPin, Clock } from "lucide-react";

interface ExportOptions {
  includeScore: boolean;
  includeGoals: boolean;
  includeAssists: boolean;
  includeCards: boolean;
  includePlayerTimes: boolean;
}

interface ExportTemplateRendererProps {
  fixture: any;
  goals: any[];
  cards: any[];
  template: "minimal" | "goals" | "full";
  options: ExportOptions;
}

const ExportTemplateRenderer = ({ fixture, goals, cards, template, options }: ExportTemplateRendererProps) => {
  const homeGoals = goals.filter(g => 
    g.teamId === fixture.home_team_id || 
    g.team_id === fixture.home_team_id ||
    g.team === fixture.home_team?.name
  );
  
  const awayGoals = goals.filter(g => 
    g.teamId === fixture.away_team_id || 
    g.team_id === fixture.away_team_id ||
    g.team === fixture.away_team?.name
  );

  const formatTime = (time: any) => {
    if (!time) return '';
    const minutes = typeof time === 'number' ? Math.floor(time / 60) : time;
    return `${minutes}'`;
  };

  return (
    <div 
      id="export-template-preview" 
      className="w-[1080px] h-[1080px] bg-gradient-to-br from-background via-background/95 to-muted/20 p-16 flex flex-col justify-between relative overflow-hidden"
      style={{ transform: 'scale(0.3)', transformOrigin: 'top left', width: '1080px', height: '1080px' }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-primary/20 blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-secondary/20 blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 text-center space-y-8">
        <div className="flex items-center justify-center gap-4 mb-8">
          <Trophy className="h-16 w-16 text-primary" />
          <h1 className="text-4xl font-bold text-primary">Match Result</h1>
        </div>

        {/* Match Info */}
        <div className="space-y-4 text-muted-foreground">
          {fixture.match_date && (
            <div className="flex items-center justify-center gap-2">
              <Calendar className="h-6 w-6" />
              <span className="text-xl">{new Date(fixture.match_date).toLocaleDateString()}</span>
            </div>
          )}
          {fixture.venue && (
            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-6 w-6" />
              <span className="text-xl">{fixture.venue}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Score */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="text-center space-y-12">
          {/* Teams and Score */}
          <div className="space-y-8">
            <div className="flex items-center justify-center gap-16">
              <div className="text-center space-y-4 flex-1">
                <h2 className="text-3xl font-bold text-foreground">{fixture.home_team?.name || 'Home'}</h2>
                <div className="text-8xl font-bold text-primary">{fixture.home_score || 0}</div>
              </div>
              
              <div className="text-6xl font-light text-muted-foreground">-</div>
              
              <div className="text-center space-y-4 flex-1">
                <h2 className="text-3xl font-bold text-foreground">{fixture.away_team?.name || 'Away'}</h2>
                <div className="text-8xl font-bold text-primary">{fixture.away_score || 0}</div>
              </div>
            </div>
          </div>

          {/* Goals Section */}
          {(template === "goals" || template === "full") && options.includeGoals && goals.length > 0 && (
            <div className="grid grid-cols-2 gap-12 mt-16">
              {/* Home Team Goals */}
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-center">{fixture.home_team?.name || 'Home'} Goals</h3>
                <div className="space-y-2">
                  {homeGoals.map((goal, index) => (
                    <div key={index} className="flex justify-between items-center bg-muted/30 rounded-lg p-4">
                      <span className="text-lg font-medium">{goal.playerName || goal.player_name || 'Unknown'}</span>
                      <span className="text-lg text-primary font-bold">{formatTime(goal.time || goal.event_time)}</span>
                    </div>
                  ))}
                  {homeGoals.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">No goals scored</div>
                  )}
                </div>
              </div>

              {/* Away Team Goals */}
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-center">{fixture.away_team?.name || 'Away'} Goals</h3>
                <div className="space-y-2">
                  {awayGoals.map((goal, index) => (
                    <div key={index} className="flex justify-between items-center bg-muted/30 rounded-lg p-4">
                      <span className="text-lg font-medium">{goal.playerName || goal.player_name || 'Unknown'}</span>
                      <span className="text-lg text-primary font-bold">{formatTime(goal.time || goal.event_time)}</span>
                    </div>
                  ))}
                  {awayGoals.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">No goals scored</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cards Section */}
          {template === "full" && options.includeCards && cards.length > 0 && (
            <div className="mt-12 space-y-4">
              <h3 className="text-2xl font-semibold text-center">Disciplinary</h3>
              <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
                {cards.slice(0, 6).map((card, index) => (
                  <div key={index} className="flex justify-between items-center bg-muted/30 rounded-lg p-3">
                    <span className="text-base font-medium">{card.playerName || card.player_name || 'Unknown'}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-6 rounded ${
                        (card.type || card.card_type || card.event_type)?.includes('red') ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className="text-sm text-primary font-bold">{formatTime(card.time || card.event_time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Clock className="h-5 w-5" />
          <span className="text-lg">Generated on {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ExportTemplateRenderer;