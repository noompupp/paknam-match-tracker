
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Team } from "@/types/database";
import { getThreeLetterAbbreviation } from "@/utils/teamAbbreviations";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import TeamLogo from "../../teams/TeamLogo";
import RealTimeRankIndicator from "../../dashboard/RealTimeRankIndicator";
import { cn } from "@/lib/utils";
import { useTeams } from "@/hooks/useTeams";

interface MatchPreviewSimplifiedTableProps {
  homeTeam: Team;
  awayTeam: Team;
}

const MatchPreviewSimplifiedTable = ({ homeTeam, awayTeam }: MatchPreviewSimplifiedTableProps) => {
  const { data: teams, isLoading } = useTeams();
  const { isMobile, isPortrait } = useDeviceOrientation();
  const isMobilePortrait = isMobile && isPortrait;

  // Function to determine if a team should be highlighted
  const isHighlightedTeam = (team: Team) => {
    return team.id === homeTeam.id || team.id === awayTeam.id;
  };

  // Get only teams that are relevant (top 3, competing teams, and bottom 3)
  const getRelevantTeams = () => {
    if (!teams) return [];
    
    const topTeams = teams.slice(0, 3);
    const bottomTeams = teams.slice(-3);
    const competingTeams = teams.filter(team => team.id === homeTeam.id || team.id === awayTeam.id);
    
    // Combine and deduplicate
    const relevantTeams = [...topTeams, ...competingTeams, ...bottomTeams];
    const uniqueTeams = relevantTeams.filter((team, index, self) => 
      index === self.findIndex(t => t.id === team.id)
    );
    
    // Sort by position
    return uniqueTeams.sort((a, b) => a.position - b.position);
  };

  const relevantTeams = getRelevantTeams();

  return (
    <Card className="card-shadow-lg animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          League Position
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
                  isMobilePortrait ? "p-2 w-12" : "p-3"
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
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-6 h-6 rounded-full" />
                        <Skeleton className="h-4 w-16" />
                      </div>
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
              ) : relevantTeams.length > 0 ? (
                relevantTeams.map((team, index) => {
                  const isHighlighted = isHighlightedTeam(team);
                  const showEllipsis = index > 0 && relevantTeams[index - 1].position < team.position - 1;
                  
                  return (
                    <React.Fragment key={team.id}>
                      {showEllipsis && (
                        <tr className="border-b">
                          <td colSpan={5} className="p-2 text-center text-muted-foreground text-xs">
                            ...
                          </td>
                        </tr>
                      )}
                      <tr 
                        className={cn(
                          "border-b transition-all duration-300 group",
                          isHighlighted 
                            ? "bg-gradient-to-r from-primary/15 to-secondary/15 border-primary/30 shadow-sm ring-1 ring-primary/20"
                            : "hover:bg-muted/30"
                        )}
                      >
                        <td className={cn(isMobilePortrait ? "p-2" : "p-3")}>
                          <div className="flex items-center gap-1">
                            <RealTimeRankIndicator 
                              currentPosition={team.position} 
                              previousPosition={team.previous_position}
                              teamId={team.id}
                            />
                            <span className={cn(
                              "font-bold transition-colors",
                              isHighlighted 
                                ? "text-primary font-bold"
                                : "group-hover:text-primary"
                            )}>
                              {team.position}
                            </span>
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
                            />
                            <span className={cn(
                              "transition-colors",
                              isMobilePortrait ? "text-xs font-medium" : "font-semibold",
                              isHighlighted 
                                ? "text-primary font-bold"
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
                          isMobilePortrait ? "p-1 text-xs" : "p-3 font-medium"
                        )}>
                          {team.played}
                        </td>
                        <td className={cn(
                          "text-center",
                          isMobilePortrait ? "p-1 text-xs" : "p-3 font-semibold"
                        )}>
                          <span className={cn(
                            team.goal_difference > 0 ? "text-green-600 dark:text-green-400" : 
                            team.goal_difference < 0 ? "text-red-600 dark:text-red-400" : ""
                          )}>
                            {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                          </span>
                        </td>
                        <td className={cn(
                          "text-center font-bold",
                          isMobilePortrait ? "p-2 text-sm" : "p-3 text-lg",
                          isHighlighted 
                            ? "text-primary"
                            : "text-primary"
                        )}>
                          {team.points}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
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

export default MatchPreviewSimplifiedTable;
