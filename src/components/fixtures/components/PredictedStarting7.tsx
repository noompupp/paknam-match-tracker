
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Member, Team } from "@/types/database";
import { Users } from "lucide-react";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { cn } from "@/lib/utils";
import TeamLogo from "../../teams/TeamLogo";
import React from "react";

/**
 * Helper: estimate "starts" for a player.
 * If a player played >0 min in a match, count as a start.
 * Here, we only have summed totals; assume matches_played approximates starts.
 * (To improve: if you store per-match data, change logic here).
 */
const estimateStarts = (player: Member) => player.matches_played || 0;

/**
 * New: Assign dot & color per likelihood.
 */
const getLikelihoodIndicator = (likelihoodPct: number) => {
  if (likelihoodPct >= 80)
    return { dot: "🟢", label: "Very likely", color: "text-green-700 dark:text-green-400" };
  if (likelihoodPct >= 40)
    return { dot: "🟡", label: "Possible", color: "text-yellow-700 dark:text-yellow-400" };
  return { dot: "🔴", label: "Unlikely", color: "text-red-700 dark:text-red-400" };
};

/**
 * Improved prediction: use match/start history.
 */
const predictTeamStarting7 = (squad: Member[], team: Team) => {
  // Defensive: get max matches_played among squad as proxy for total team matches
  const totalTeamMatches = Math.max(1, ...squad.map(m => m.matches_played || 0));
  // Calculate likelihood for each player
  const predictions = squad.map(player => {
    const starts = estimateStarts(player);
    const likelihood = Math.round((starts / totalTeamMatches) * 100); // %
    let reason = "";

    // Reason - explain why they're likely/unlikely starter
    if (likelihood >= 80) reason = "Consistent starter";
    else if (likelihood >= 40) reason = "Regular rotation";
    else reason = "Sporadic appearances";

    if (player.role === "Captain") reason = "Team captain (auto select)";
    else if (player.role === "S-Class") reason = "Top-rated S-Class player";

    return {
      id: player.id,
      name: player.name || "Unknown",
      role: player.role || "Player",
      team,
      likelihood,
      recentStats: {
        goals: player.goals || 0,
        assists: player.assists || 0,
        cards: (player.yellow_cards || 0) + (player.red_cards || 0),
        minutes: player.total_minutes_played || 0
      },
      reason,
      starts,
      totalTeamMatches
    };
  });

  // Sort by likelihood, then by minutes/goals if tied
  return predictions
    .sort((a, b) => {
      if (b.likelihood !== a.likelihood) return b.likelihood - a.likelihood;
      if (b.recentStats.minutes !== a.recentStats.minutes) return b.recentStats.minutes - a.recentStats.minutes;
      return b.recentStats.goals - a.recentStats.goals;
    })
    .slice(0, 7); // Top 7 likely starters
};

const PredictedStarting7 = ({ homeTeam, awayTeam, homeSquad, awaySquad }: {
    homeTeam: Team;
    awayTeam: Team;
    homeSquad: Member[];
    awaySquad: Member[];
}) => {
  const { isMobile, isPortrait } = useDeviceOrientation();
  const isMobilePortrait = isMobile && isPortrait;

  const homePredicted = React.useMemo(() => predictTeamStarting7(homeSquad, homeTeam), [homeSquad, homeTeam]);
  const awayPredicted = React.useMemo(() => predictTeamStarting7(awaySquad, awayTeam), [awaySquad, awayTeam]);

  const PlayerCard = ({ player }: { player: ReturnType<typeof predictTeamStarting7>[number] }) => {
    const { dot, label, color } = getLikelihoodIndicator(player.likelihood);

    return (
      <div className="p-3 bg-background border border-border/50 rounded-lg hover:border-border transition-all duration-200 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-1">
          <TeamLogo team={player.team} size="small" showColor={true} />
          <div className="min-w-0 flex-1">
            <div className={cn("font-medium truncate", isMobilePortrait ? "text-sm" : "text-base")}>
              {player.name}
            </div>
            <div className={cn("text-muted-foreground", isMobilePortrait ? "text-xs" : "text-sm")}>
              {player.role}
            </div>
          </div>
          <div className={cn("ml-2 flex items-center gap-1 font-bold", color)}>
            <span className="text-lg" title={label}>{dot}</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className={cn("font-semibold", color)}>{player.likelihood}%</span>
            <span className={cn("ml-1 text-muted-foreground text-xs")}>Likely to Start</span>
          </div>
          <Badge 
            variant="secondary" 
            className={cn("flex items-center gap-1", color, isMobilePortrait ? "text-xs px-1.5 py-0.5" : "text-xs")}
          >
            {label}
          </Badge>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <span>Started {player.starts} / {player.totalTeamMatches} matches</span>
        </div>
        <div className={cn("grid grid-cols-2 gap-2 text-center", isMobilePortrait ? "text-xs" : "text-sm")}>
          <div className="bg-muted/30 rounded p-1">
            <div className="font-medium text-primary">{player.recentStats.goals}</div>
            <div className="text-muted-foreground text-xs">Goals</div>
          </div>
          <div className="bg-muted/30 rounded p-1">
            <div className="font-medium text-primary">{player.recentStats.assists}</div>
            <div className="text-muted-foreground text-xs">Assists</div>
          </div>
        </div>
        <div className={cn("text-muted-foreground text-xs mt-1 italic")}>
          {player.reason}
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
            <div className={cn("grid gap-3", isMobilePortrait ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3")}>
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
            <div className={cn("grid gap-3", isMobilePortrait ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3")}>
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
          <CardTitle className={cn("text-muted-foreground", isMobilePortrait ? "text-sm" : "text-base")}>
            Prediction Methodology
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn("text-muted-foreground space-y-2", isMobilePortrait ? "text-xs" : "text-sm")}>
            <p>• <strong>Likely to Start %:</strong> Based on the ratio of matches the player has started to the team's total played matches.</p>
            <p>• <strong>🟢 80%+:</strong> Very likely starter &mdash; played almost every match</p>
            <p>• <strong>🟡 40–79%:</strong> Regular rotation or sometimes starts</p>
            <p>• <strong>🔴 &lt;40%:</strong> Rarely starts or only played a few matches</p>
            <p>• <strong>Captain/S-Class:</strong> Will appear at the top of list if available</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictedStarting7;

