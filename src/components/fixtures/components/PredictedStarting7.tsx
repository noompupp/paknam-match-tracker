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

// ENHANCED: Role- and match-aware likelihood, with nuanced explanations.
const computeRoleBaseline = (player: Member) => {
  if (!player.role) return 0;
  const role = player.role.trim().toLowerCase();
  switch (role) {
    case "captain":
      return 30; // Captains get minimum 30%
    case "s-class":
      return 18; // S-Class lowest baseline higher than default reserve
    case "starter":
      return 10;
    default:
      return 0;
  }
};

const isLikelyKeyRole = (player: Member) => {
  if (!player.role) return false;
  const r = player.role.trim().toLowerCase();
  return r === 'captain' || r === 's-class' || r === 'starter';
};

// Enhanced calculation: adjusts for early season AND applies baselines for key roles
const predictTeamStarting7 = (squad: Member[], team: Team) => {
  const totalMatches = Math.max(1, ...squad.map(m => m.matches_played || 0));
  // Defensive: Find out how many with minutes as proxy for starters each match
  const playersWithMinutes = squad.filter(p => p.total_minutes_played && p.total_minutes_played > 0);

  return squad.map(player => {
    const starts = estimateStarts(player);
    const baseline = computeRoleBaseline(player);
    let likelihood = 0;
    let reason = "";

    // Early season detection
    if (totalMatches <= 2) {
      // 1-2 matches played in season
      if (player.total_minutes_played > 0) {
        likelihood = Math.max(baseline, Math.round(75 + (starts > 0 ? 10 : 0))); // high for those with minutes
        if (player.role?.trim().toLowerCase() === "captain") {
          reason = "Captain: always prioritized, even early in season";
        } else if (player.role?.toLowerCase() === "s-class") {
          reason = "S-Class: top-rated, expected to start, especially early on";
        } else {
          reason = "Played in recent match(es)";
        }
      } else if (baseline > 0) {
        likelihood = baseline + 10; // boost key roles if not yet started
        reason = `Key role "${player.role}": given chance to start even if not yet played`;
      } else {
        likelihood = 0;
        reason = "Has not played yet: true reserve or backup";
      }
    } else {
      // After 3+ matches, weight both baseline and start history
      // Classic ratio as base
      let pct = Math.round((starts / totalMatches) * 100);
      if (player.role?.trim().toLowerCase() === "captain") {
        // Captain always high, but not '100% locked' in case they missed games
        pct = Math.max(pct, 80);
        reason = "Team captain: nearly automatic starter";
      } else if (player.role?.toLowerCase() === "s-class") {
        pct = Math.max(pct, 65);
        reason = "S-Class player: top rated, typically starts";
      } else if (player.role?.toLowerCase() === "starter") {
        pct = Math.max(baseline, pct);
        reason = "Named as starter";
      } else if (!player.role || ["reserve", "bench", "sub"].includes(player.role.trim().toLowerCase())) {
        // Reserves only get percent from actual starts
        if (pct < 30) {
          reason = "Mainly a reserve: used occasionally";
        } else {
          reason = "Occasional rotation option";
        }
      } else {
        if (pct === 0) {
          likelihood = baseline;
          reason = "No minutes or starts yet: depth option";
        }
      }
      likelihood = pct;
      // Defensive: never below role baseline
      likelihood = Math.max(likelihood, baseline);
    }

    // Clamp
    likelihood = Math.min(100, Math.max(0, likelihood));

    // Special override, always max for captain with >0 mins
    if (player.role?.toLowerCase() === 'captain' && player.total_minutes_played > 0) {
      likelihood = 99;
      reason = "Captain: almost always starts if fit";
    }

    // If player has started every possible game
    if (starts === totalMatches && totalMatches > 0) {
      likelihood = 100;
      reason = "Ever-present: started every match";
    }

    // Defensive: never assign 0% unless truly no games or mins, nor baseline role
    if (likelihood === 0 && isLikelyKeyRole(player)) {
      likelihood = computeRoleBaseline(player);
      reason = `Key role "${player.role}", so never ruled out completely`;
    }

    // Lower likelihood for deep reserves, but never 0 unless absolutely unused
    if (!isLikelyKeyRole(player) && player.total_minutes_played === 0 && totalMatches > 0) {
      likelihood = 0;
      reason = "No appearances yet: not in rotation so far";
    }

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
      totalTeamMatches: totalMatches
    };
  })
    .sort((a, b) => {
      if (b.likelihood !== a.likelihood) return b.likelihood - a.likelihood;
      if (b.recentStats.minutes !== a.recentStats.minutes) return b.recentStats.minutes - a.recentStats.minutes;
      return b.recentStats.goals - a.recentStats.goals;
    })
    .slice(0, 7);
};

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
            <p>
              • <strong>Likely to Start %:</strong> Combines match start ratio <em>and</em> player's role. Early-season logic gives extra credit to core players after the first match—even if only 1 has been played, a "starter" or "S-Class" won't show as 0%.
            </p>
            <p>
              • <strong>🟢 80%+:</strong> Very likely starter (consistent + key roles, or played every match)
            </p>
            <p>
              • <strong>🟡 40–79%:</strong> Regular rotation, or squad fixture, or important player returning after missing matches
            </p>
            <p>
              • <strong>🔴 &lt;40%:</strong> Reserve/rotation or yet to play
            </p>
            <p>
              • <strong>Early in season:</strong> After 1 match, everyone who played that match gets 75%+, key roles get a minimum (e.g. Captains always at least 30%)
            </p>
            <p>
              • <strong>Reason text:</strong> Explains rationale: e.g. Captain, S-Class, "Never played yet" for reserves, etc.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictedStarting7;
