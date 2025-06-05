
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/20">
                  <Skeleton className="h-3 w-20 mb-3 mx-auto" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-4" />
                    </div>
                    <Skeleton className="h-8 w-24 mx-auto" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentFixtures && recentFixtures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentFixtures.map((fixture) => (
                <div 
                  key={fixture.id} 
                  className="p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-all duration-200 cursor-pointer group hover:shadow-md border border-transparent hover:border-muted-foreground/20"
                  onClick={() => handleFixtureClick(fixture)}
                >
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {formatDateDisplay(fixture.match_date)}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TeamLogo team={fixture.home_team} size="small" />
                          <span className="font-medium text-sm truncate max-w-[80px]">
                            {fixture.home_team?.name || 'TBD'}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-muted-foreground">
                          {fixture.home_score || 0}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <Badge variant="outline" className="px-3 py-1 font-bold text-base">
                          {fixture.home_score || 0} - {fixture.away_score || 0}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-muted-foreground">
                          {fixture.away_score || 0}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate max-w-[80px]">
                            {fixture.away_team?.name || 'TBD'}
                          </span>
                          <TeamLogo team={fixture.away_team} size="small" />
                        </div>
                      </div>
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
