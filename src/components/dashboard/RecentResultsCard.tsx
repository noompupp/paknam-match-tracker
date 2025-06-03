
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { Fixture } from "@/types/database";
import { formatDateDisplay } from "@/utils/timeUtils";
import TeamLogo from "../teams/TeamLogo";

interface RecentResultsCardProps {
  recentFixtures: Fixture[] | undefined;
  isLoading: boolean;
}

const RecentResultsCard = ({ recentFixtures, isLoading }: RecentResultsCardProps) => {
  return (
    <Card className="card-shadow-lg animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">Recent Results</CardTitle>
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-4 rounded-lg bg-muted/20">
              <Skeleton className="h-3 w-16 mb-2" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))
        ) : recentFixtures && recentFixtures.length > 0 ? (
          recentFixtures.map((fixture) => (
            <div key={fixture.id} className="p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
              <div className="text-xs text-muted-foreground mb-2">
                {formatDateDisplay(fixture.match_date)}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TeamLogo team={fixture.home_team} size="small" />
                  <span className="font-semibold text-sm">{fixture.home_team?.name || 'TBD'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="px-3 py-1">
                    {fixture.home_score} - {fixture.away_score}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{fixture.away_team?.name || 'TBD'}</span>
                  <TeamLogo team={fixture.away_team} size="small" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-4">
            No recent results available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentResultsCard;
