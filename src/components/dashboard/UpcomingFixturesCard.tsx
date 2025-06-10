
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye } from "lucide-react";
import { Fixture } from "@/types/database";
import { formatDateDisplay, formatTimeDisplay } from "@/utils/timeUtils";
import TeamLogo from "../teams/TeamLogo";

interface UpcomingFixturesCardProps {
  upcomingFixtures: Fixture[] | undefined;
  isLoading: boolean;
  onViewAll: () => void;
  onFixturePreview?: (fixture: Fixture) => void;
}

const UpcomingFixturesCard = ({ 
  upcomingFixtures, 
  isLoading, 
  onViewAll,
  onFixturePreview 
}: UpcomingFixturesCardProps) => {
  
  const handleFixtureClick = (fixture: Fixture) => {
    if (onFixturePreview) {
      onFixturePreview(fixture);
    }
  };

  return (
    <Card className="card-shadow-lg animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl font-bold">Upcoming Fixtures</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewAll}
          className="text-muted-foreground hover:text-foreground px-2 sm:px-3"
        >
          <span className="hidden sm:inline mr-1">View All</span>
          <span className="sm:hidden text-xs mr-1">All</span>
          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-4 px-3 sm:px-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-3 sm:p-4 rounded-lg bg-muted/20">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <Skeleton className="h-3 w-20 sm:w-24" />
                <Skeleton className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16 sm:h-4 sm:w-20" />
                <Skeleton className="h-3 w-4 sm:w-6" />
                <Skeleton className="h-3 w-16 sm:h-4 sm:w-20" />
              </div>
            </div>
          ))
        ) : upcomingFixtures && upcomingFixtures.length > 0 ? (
          upcomingFixtures.map((fixture) => (
            <div 
              key={fixture.id} 
              className="p-3 sm:p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group"
              onClick={() => handleFixtureClick(fixture)}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {formatDateDisplay(fixture.match_date)} • {formatTimeDisplay(fixture.match_time)}
                </div>
                <div className="flex items-center gap-2">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-5 items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                <div className="col-span-2 flex items-center gap-1 sm:gap-2 justify-end">
                  <span className="font-semibold text-right text-xs sm:text-sm">{fixture.home_team?.name || 'TBD'}</span>
                  <TeamLogo team={fixture.home_team} size="small" />
                </div>
                <div className="col-span-1 flex justify-center">
                  <span className="text-muted-foreground text-xs font-medium">vs</span>
                </div>
                <div className="col-span-2 flex items-center gap-1 sm:gap-2">
                  <TeamLogo team={fixture.away_team} size="small" />
                  <span className="font-semibold text-xs sm:text-sm">{fixture.away_team?.name || 'TBD'}</span>
                </div>
              </div>
              <div className="mt-2 text-center">
                <span className="text-xs text-muted-foreground/70">Tap for Match Preview</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-3 sm:py-4">
            <p className="text-sm">No upcoming fixtures available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingFixturesCard;
