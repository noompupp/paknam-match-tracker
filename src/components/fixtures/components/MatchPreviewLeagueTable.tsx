import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Team } from "@/types/database";
import { getThreeLetterAbbreviation } from "@/utils/teamAbbreviations";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import TeamLogo from "../../teams/TeamLogo";
import RealTimeRankIndicator from "../../dashboard/RealTimeRankIndicator";
import { cn } from "@/lib/utils";
import { useTeams } from "@/hooks/useTeams";

interface MatchPreviewLeagueTableProps {
  homeTeam: Team;
  awayTeam: Team;
}

const MatchPreviewLeagueTable = ({ homeTeam, awayTeam }: MatchPreviewLeagueTableProps) => {
  const { data: teams, isLoading } = useTeams(); // Now uses deduplicated data
  const { isMobile, isPortrait } = useDeviceOrientation();
  const isMobilePortrait = isMobile && isPortrait;

  // Function to determine if a team should be highlighted
  const isHighlightedTeam = (team: Team) => {
    return team.id === homeTeam.id || team.id === awayTeam.id;
  };

  return (
    <Card className="card-shadow-lg animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          League Position
          <Badge variant="outline" className="text-xs">
            {homeTeam.name} vs {awayTeam.name}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className={cn(
                "text-sm",
                isMobilePortrait && "text-xs"
              )}>
                <th className={cn(
                  "text-left font-semibold",
                  isMobilePortrait ? "p-2" : "p-3"
                )}>Pos</th>
                <th className={cn(
                  "text-left font-semibold",
                  isMobilePortrait ? "p-2" : "p-3"
                )}>Team</th>
                <th className={cn(
                  "text-center font-semibold",
                  isMobilePortrait ? "p-1 w-8" : "p-3"
                )}>P</th>
                <th className={cn(
                  "text-center font-semibold",
                  isMobilePortrait ? "p-1 w-8" : "p-3"
                )}>W</th>
                <th className={cn(
                  "text-center font-semibold",
                  isMobilePortrait ? "p-1 w-8" : "p-3"
                )}>D</th>
                <th className={cn(
                  "text-center font-semibold",
                  isMobilePortrait ? "p-1 w-8" : "p-3"
                )}>L</th>
                <th className={cn(
                  "text-center font-semibold",
                  isMobilePortrait ? "p-1 w-10" : "p-3"
                )}>GD</th>
                <th className={cn(
                  "text-center font-semibold",
                  isMobilePortrait ? "p-2 w-12" : "p-3"
                )}>Pts</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="border-b">
                    <td className={cn(isMobilePortrait ? "p-2" : "p-3")}>
                      <Skeleton className="h-4 w-6" />
                    </td>
                    <td className={cn(isMobilePortrait ? "p-2" : "p-3")}>
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </td>
                    <td className={cn("text-center", isMobilePortrait ? "p-1" : "p-3")}>
                      <Skeleton className="h-4 w-6 mx-auto" />
                    </td>
                    <td className={cn("text-center", isMobilePortrait ? "p-1" : "p-3")}>
                      <Skeleton className="h-4 w-6 mx-auto" />
                    </td>
                    <td className={cn("text-center", isMobilePortrait ? "p-1" : "p-3")}>
                      <Skeleton className="h-4 w-6 mx-auto" />
                    </td>
                    <td className={cn("text-center", isMobilePortrait ? "p-1" : "p-3")}>
                      <Skeleton className="h-4 w-6 mx-auto" />
                    </td>
                    <td className={cn("text-center", isMobilePortrait ? "p-1" : "p-3")}>
                      <Skeleton className="h-4 w-8 mx-auto" />
                    </td>
                    <td className={cn("text-center", isMobilePortrait ? "p-2" : "p-3")}>
                      <Skeleton className="h-4 w-8 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : teams && teams.length > 0 ? (
                teams.map((team) => {
                  const isHighlighted = isHighlightedTeam(team);
                  return (
                    <tr 
                      key={team.id} 
                      className={cn(
                        "border-b transition-all duration-300 group relative",
                        isHighlighted 
                          ? isMobilePortrait 
                            ? "bg-gradient-to-r from-primary/20 via-primary/15 to-primary/20 border-primary/40 shadow-md ring-2 ring-primary/30" 
                            : "bg-gradient-to-r from-primary/15 to-secondary/15 border-primary/30 shadow-sm ring-1 ring-primary/20"
                          : "hover:bg-muted/30",
                        isHighlighted && "animate-pulse-subtle"
                      )}
                    >
                      {/* Mobile highlight indicator bar */}
                      {isHighlighted && isMobilePortrait && (
                        <td className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary" />
                      )}
                      
                      <td className={cn(
                        isMobilePortrait ? "p-2" : "p-3",
                        isHighlighted && isMobilePortrait && "pl-3"
                      )}>
                        <div className="flex items-center gap-2">
                          <RealTimeRankIndicator 
                            currentPosition={team.position} 
                            previousPosition={team.previous_position}
                            teamId={team.id}
                          />
                          <span className={cn(
                            "font-bold transition-colors",
                            isHighlighted 
                              ? isMobilePortrait
                                ? "text-primary text-lg font-black drop-shadow-sm"
                                : "text-primary font-bold"
                              : "group-hover:text-primary"
                          )}>
                            {team.position}
                          </span>
                          {isHighlighted && isMobilePortrait && (
                            <Badge 
                              variant="secondary" 
                              className="ml-1 px-1.5 py-0.5 text-xs bg-primary/20 text-primary border-primary/30"
                            >
                              Playing
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className={cn(isMobilePortrait ? "p-2" : "p-3")}>
                        <div className={cn(
                          "flex items-center",
                          isMobilePortrait ? "gap-2" : "gap-3"
                        )}>
                          <TeamLogo 
                            team={team} 
                            size="small" 
                            showColor={true}
                            className={cn(
                              isHighlighted && isMobilePortrait && "ring-2 ring-primary/50 ring-offset-1 rounded-full"
                            )}
                          />
                          <span className={cn(
                            "transition-colors",
                            isMobilePortrait ? "text-xs font-medium" : "font-semibold",
                            isHighlighted 
                              ? isMobilePortrait
                                ? "text-primary font-bold text-sm drop-shadow-sm"
                                : "text-primary font-bold" 
                              : "group-hover:text-primary"
                          )}>
                            {isMobilePortrait 
                              ? getThreeLetterAbbreviation(team.name) 
                              : team.name
                            }
                          </span>
                        </div>
                      </td>
                      <td className={cn(
                        "text-center",
                        isMobilePortrait ? "p-1 text-xs" : "p-3 font-medium",
                        isHighlighted && isMobilePortrait && "font-bold text-primary"
                      )}>
                        {team.played}
                      </td>
                      <td className={cn(
                        "text-center text-green-600 dark:text-green-400",
                        isMobilePortrait ? "p-1 text-xs" : "p-3 font-medium",
                        isHighlighted && isMobilePortrait && "font-bold"
                      )}>
                        {team.won}
                      </td>
                      <td className={cn(
                        "text-center text-yellow-600 dark:text-yellow-400",
                        isMobilePortrait ? "p-1 text-xs" : "p-3 font-medium",
                        isHighlighted && isMobilePortrait && "font-bold"
                      )}>
                        {team.drawn}
                      </td>
                      <td className={cn(
                        "text-center text-red-600 dark:text-red-400",
                        isMobilePortrait ? "p-1 text-xs" : "p-3 font-medium",
                        isHighlighted && isMobilePortrait && "font-bold"
                      )}>
                        {team.lost}
                      </td>
                      <td className={cn(
                        "text-center",
                        isMobilePortrait ? "p-1 text-xs" : "p-3 font-semibold",
                        isHighlighted && isMobilePortrait && "font-bold"
                      )}>
                        <span className={cn(
                          team.goal_difference > 0 ? "text-green-600 dark:text-green-400" : 
                          team.goal_difference < 0 ? "text-red-600 dark:text-red-400" : "",
                          isHighlighted && isMobilePortrait && "drop-shadow-sm"
                        )}>
                          {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                        </span>
                      </td>
                      <td className={cn(
                        "text-center font-bold",
                        isMobilePortrait ? "p-2 text-sm" : "p-3 text-lg",
                        isHighlighted 
                          ? isMobilePortrait
                            ? "text-primary text-base font-black drop-shadow-sm"
                            : "text-primary text-xl"
                          : "text-primary"
                      )}>
                        {team.points}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No teams data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchPreviewLeagueTable;
