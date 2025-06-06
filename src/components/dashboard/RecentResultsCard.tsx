
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Eye } from "lucide-react";
import { Fixture } from "@/types/database";
import { formatDateDisplay } from "@/utils/timeUtils";
import TeamLogo from "../teams/TeamLogo";
import { useState } from "react";
import MatchSummaryDialog from "../fixtures/MatchSummaryDialog";

interface RecentResultsCardProps {
  recentFixtures: Fixture[] | undefined;
  isLoading: boolean;
}

const RecentResultsCard = ({ recentFixtures, isLoading }: RecentResultsCardProps) => {
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);

  const handleFixtureClick = (fixture: Fixture) => {
    setSelectedFixture(fixture);
  };

  const handleCloseDialog = () => {
    setSelectedFixture(null);
  };

  return (
    <>
      <Card className="card-shadow-lg animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">Recent Results</CardTitle>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/20 flex items-center justify-center">
                  <div className="flex items-center gap-8 w-full max-w-md">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentFixtures && recentFixtures.length > 0 ? (
            <div className="space-y-3">
              {recentFixtures.map((fixture) => (
                <div 
                  key={fixture.id} 
                  className="relative p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-all duration-200 cursor-pointer group hover:shadow-md border border-transparent hover:border-muted-foreground/20"
                  onClick={() => handleFixtureClick(fixture)}
                >
                  {/* Match date - top right */}
                  <div className="absolute top-3 right-3 text-xs text-muted-foreground">
                    {formatDateDisplay(fixture.match_date)}
                  </div>
                  
                  {/* Eye icon - top right, appears on hover */}
                  <div className="absolute top-3 right-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  {/* Main match content - centered */}
                  <div className="flex items-center justify-center gap-8">
                    {/* Home team */}
                    <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
                      <span className="font-medium text-sm truncate">
                        {fixture.home_team?.name || 'TBD'}
                      </span>
                      <TeamLogo team={fixture.home_team} size="small" />
                    </div>
                    
                    {/* Score */}
                    <div className="flex items-center justify-center">
                      <Badge variant="outline" className="px-4 py-2 font-bold text-lg min-w-[80px] text-center">
                        {fixture.home_score || 0} - {fixture.away_score || 0}
                      </Badge>
                    </div>
                    
                    {/* Away team */}
                    <div className="flex items-center gap-3 min-w-0 flex-1 justify-start">
                      <TeamLogo team={fixture.away_team} size="small" />
                      <span className="font-medium text-sm truncate">
                        {fixture.away_team?.name || 'TBD'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <div className="space-y-2">
                <div className="text-4xl">⚽</div>
                <p className="text-lg font-medium">No recent results available</p>
                <p className="text-sm">Check back after matches have been played</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Match Summary Dialog */}
      {selectedFixture && (
        <MatchSummaryDialog
          fixture={selectedFixture}
          isOpen={!!selectedFixture}
          onClose={handleCloseDialog}
        />
      )}
    </>
  );
};

export default RecentResultsCard;
