
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Member, Team } from "@/types/database";
import { Users, Star, Shield, Target } from "lucide-react";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { cn } from "@/lib/utils";
import TeamLogo from "../../teams/TeamLogo";

interface PredictedStarting7Props {
  homeTeam: Team;
  awayTeam: Team;
  homeSquad: Member[];
  awaySquad: Member[];
}

interface PredictedPlayer {
  id: number;
  name: string;
  role: string;
  team: Team;
  confidence: number;
  recentStats: {
    goals: number;
    assists: number;
    cards: number;
    minutes: number;
  };
  reason: string;
}

const PredictedStarting7 = ({ homeTeam, awayTeam, homeSquad, awaySquad }: PredictedStarting7Props) => {
  const { isMobile, isPortrait } = useDeviceOrientation();
  const isMobilePortrait = isMobile && isPortrait;

  // Prediction algorithm
  const predictTeamStarting7 = (squad: Member[], team: Team): PredictedPlayer[] => {
    const predictions = squad.map(player => {
      let score = 0;
      let reason = "";

      // Base score from minutes played (high priority)
      const minutesScore = Math.min((player.total_minutes_played || 0) / 100, 10);
      score += minutesScore;

      // Role bonuses
      const roleBonus = player.role === 'Captain' ? 3 : 
                       player.role === 'S-Class' ? 5 : 
                       player.role === 'Starter' ? 1 : 0;
      score += roleBonus;

      // Performance bonuses
      const goalBonus = (player.goals || 0) * 2;
      const assistBonus = (player.assists || 0) * 1.5;
      score += goalBonus + assistBonus;

      // Discipline penalties
      const yellowPenalty = (player.yellow_cards || 0) * 0.5;
      const redPenalty = (player.red_cards || 0) * 2;
      score -= yellowPenalty + redPenalty;

      // Calculate confidence (0-100%)
      const confidence = Math.min(Math.max((score / 20) * 100, 0), 100);

      // Generate reason
      if (player.role === 'Captain') reason = "Team captain";
      else if (player.role === 'S-Class') reason = "S-Class player";
      else if (minutesScore > 5) reason = "High playing time";
      else if (goalBonus > 2) reason = "Strong goal record";
      else if (assistBonus > 2) reason = "Good assists record";
      else reason = "Squad rotation";

      return {
        id: player.id,
        name: player.name || 'Unknown',
        role: player.role || 'Player',
        team,
        confidence: Math.round(confidence),
        recentStats: {
          goals: player.goals || 0,
          assists: player.assists || 0,
          cards: (player.yellow_cards || 0) + (player.red_cards || 0),
          minutes: player.total_minutes_played || 0
        },
        reason,
        score
      };
    });

    // Sort by score and take top 7
    return predictions
      .sort((a, b) => b.score - a.score)
      .slice(0, 7);
  };

  const homePredicted = predictTeamStarting7(homeSquad, homeTeam);
  const awayPredicted = predictTeamStarting7(awaySquad, awayTeam);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-500/10 text-green-700 dark:text-green-400";
    if (confidence >= 60) return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
    return "bg-red-500/10 text-red-700 dark:text-red-400";
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return Star;
    if (confidence >= 60) return Shield;
    return Target;
  };

  const PlayerCard = ({ player }: { player: PredictedPlayer }) => {
    const ConfidenceIcon = getConfidenceIcon(player.confidence);
    
    return (
      <div className="p-3 bg-background border border-border/50 rounded-lg hover:border-border transition-all duration-200">
        <div className="flex items-center gap-2 mb-2">
          <TeamLogo team={player.team} size="small" showColor={true} />
          <div className="min-w-0 flex-1">
            <div className={cn(
              "font-medium truncate",
              isMobilePortrait ? "text-sm" : "text-base"
            )}>
              {player.name}
            </div>
            <div className={cn(
              "text-muted-foreground",
              isMobilePortrait ? "text-xs" : "text-sm"
            )}>
              {player.role}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <Badge 
            variant="secondary" 
            className={cn(
              getConfidenceColor(player.confidence),
              "flex items-center gap-1",
              isMobilePortrait ? "text-xs px-1.5 py-0.5" : "text-xs"
            )}
          >
            <ConfidenceIcon className="h-3 w-3" />
            {player.confidence}%
          </Badge>
          <span className={cn(
            "text-muted-foreground",
            isMobilePortrait ? "text-xs" : "text-sm"
          )}>
            {player.reason}
          </span>
        </div>

        <div className={cn(
          "grid grid-cols-2 gap-2 text-center",
          isMobilePortrait ? "text-xs" : "text-sm"
        )}>
          <div className="bg-muted/30 rounded p-1">
            <div className="font-medium text-primary">{player.recentStats.goals}</div>
            <div className="text-muted-foreground text-xs">Goals</div>
          </div>
          <div className="bg-muted/30 rounded p-1">
            <div className="font-medium text-primary">{player.recentStats.assists}</div>
            <div className="text-muted-foreground text-xs">Assists</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Home Team Predicted Starting 7 */}
      <Card className="card-shadow-lg animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            {homeTeam.name} - Predicted Starting 7
          </CardTitle>
        </CardHeader>
        <CardContent>
          {homePredicted.length > 0 ? (
            <div className={cn(
              "grid gap-3",
              isMobilePortrait ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
            )}>
              {homePredicted.map(player => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No squad data available for predictions</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Away Team Predicted Starting 7 */}
      <Card className="card-shadow-lg animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            {awayTeam.name} - Predicted Starting 7
          </CardTitle>
        </CardHeader>
        <CardContent>
          {awayPredicted.length > 0 ? (
            <div className={cn(
              "grid gap-3",
              isMobilePortrait ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
            )}>
              {awayPredicted.map(player => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No squad data available for predictions</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prediction Methodology */}
      <Card className="card-shadow-lg animate-fade-in border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className={cn(
            "text-muted-foreground",
            isMobilePortrait ? "text-sm" : "text-base"
          )}>
            Prediction Methodology
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-muted-foreground space-y-2",
            isMobilePortrait ? "text-xs" : "text-sm"
          )}>
            <p>• <strong>Role Bonuses:</strong> Captain (+3), S-Class (+5), Starter (+1)</p>
            <p>• <strong>Performance:</strong> Goals (+2 each), Assists (+1.5 each)</p>
            <p>• <strong>Discipline:</strong> Yellow cards (-0.5), Red cards (-2)</p>
            <p>• <strong>Playing Time:</strong> Higher minutes played increases likelihood</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictedStarting7;
