import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Team } from "@/types/database";
import { getThreeLetterAbbreviation } from "@/utils/teamAbbreviations";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { leagueTableService } from "@/services/leagueTableService";
import { useToast } from "@/hooks/use-toast";
import TeamLogo from "../teams/TeamLogo";
import RealTimeRankIndicator from "./RealTimeRankIndicator";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

interface LeagueTableProps {
  teams: Team[] | undefined;
  isLoading: boolean;
}

const LeagueTable = ({ teams, isLoading }: LeagueTableProps) => {
  const { isMobile, isPortrait, isLandscape } = useDeviceOrientation();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  // Determine display mode
  const isMobilePortrait = isMobile && isPortrait;
  const isMobileLandscape = isMobile && isLandscape;

  const handleSyncStats = async () => {
    setIsSyncing(true);
    try {
      const result = await leagueTableService.syncTeamStatsWithFixtures();
      
      if (result.errors.length > 0) {
        toast({
          title: "Sync Completed with Issues",
          description: `Updated ${result.updated} teams. ${result.errors.length} errors occurred.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "✅ League Table Synced",
          description: `Successfully updated ${result.updated} teams from fixture results.`,
        });
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync league table with fixture results.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="card-shadow-lg animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">League Table</CardTitle>
          <Button 
            onClick={handleSyncStats}
            disabled={isSyncing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
            {isSyncing ? 'Syncing...' : 'Sync Stats'}
          </Button>
        </div>
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
                teams.map((team) => (
                  <tr key={team.id} className="border-b hover:bg-muted/30 transition-colors group">
                    <td className={cn(isMobilePortrait ? "p-2" : "p-3")}>
                      <div className="flex items-center gap-2">
                        <RealTimeRankIndicator 
                          currentPosition={team.position} 
                          previousPosition={team.previous_position}
                          teamId={team.id}
                        />
                        <span className="font-bold group-hover:text-primary transition-colors">
                          {team.position}
                        </span>
                      </div>
                    </td>
                    <td className={cn(isMobilePortrait ? "p-2" : "p-3")}>
                      <div className={cn(
                        "flex items-center",
                        isMobilePortrait ? "gap-2" : "gap-3"
                      )}>
                        <TeamLogo team={team} size="small" showColor={true} />
                        <span className={cn(
                          "group-hover:text-primary transition-colors",
                          isMobilePortrait ? "text-xs font-medium" : "font-semibold",
                          isMobileLandscape && "font-semibold"
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
                      isMobilePortrait ? "p-1 text-xs font-normal" : "p-3 font-medium"
                    )}>
                      {team.played}
                    </td>
                    <td className={cn(
                      "text-center text-green-600 dark:text-green-400",
                      isMobilePortrait ? "p-1 text-xs font-normal" : "p-3 font-medium"
                    )}>
                      {team.won}
                    </td>
                    <td className={cn(
                      "text-center text-yellow-600 dark:text-yellow-400",
                      isMobilePortrait ? "p-1 text-xs font-normal" : "p-3 font-medium"
                    )}>
                      {team.drawn}
                    </td>
                    <td className={cn(
                      "text-center text-red-600 dark:text-red-400",
                      isMobilePortrait ? "p-1 text-xs font-normal" : "p-3 font-medium"
                    )}>
                      {team.lost}
                    </td>
                    <td className={cn(
                      "text-center",
                      isMobilePortrait ? "p-1 text-xs font-normal" : "p-3 font-semibold"
                    )}>
                      <span className={team.goal_difference > 0 ? "text-green-600 dark:text-green-400" : team.goal_difference < 0 ? "text-red-600 dark:text-red-400" : ""}>
                        {team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}
                      </span>
                    </td>
                    <td className={cn(
                      "text-center font-bold text-primary",
                      isMobilePortrait ? "p-2 text-sm" : "p-3 text-lg"
                    )}>
                      {team.points}
                    </td>
                  </tr>
                ))
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

export default LeagueTable;
