
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Fixture } from "@/types/database";
import { formatDateDisplay, formatTimeDisplay } from "@/utils/timeUtils";
import TeamLogo from "../teams/TeamLogo";

interface UpcomingFixturesCardProps {
  upcomingFixtures: Fixture[] | undefined;
  isLoading: boolean;
  onViewAll: () => void;
}

const UpcomingFixturesCard = ({ upcomingFixtures, isLoading, onViewAll }: UpcomingFixturesCardProps) => {
  return (
    <Card className="card-shadow-lg animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-4">
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
      <CardContent className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-4 rounded-lg bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-6" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))
        ) : upcomingFixtures && upcomingFixtures.length > 0 ? (
          upcomingFixtures.map((fixture) => (
            <div key={fixture.id} className="p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {formatDateDisplay(fixture.match_date)} • {formatTimeDisplay(fixture.match_time)}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="grid grid-cols-5 items-center gap-2 mt-2">
                <div className="col-span-2 flex items-center gap-2 justify-end">
                  <span className="font-semibold text-right">{fixture.home_team?.name || 'TBD'}</span>
                  <TeamLogo team={fixture.home_team} size="small" />
                </div>
                <div className="col-span-1 flex justify-center">
                  <span className="text-muted-foreground text-sm font-medium">vs</span>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <TeamLogo team={fixture.away_team} size="small" />
                  <span className="font-semibold">{fixture.away_team?.name || 'TBD'}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-4">
            No upcoming fixtures available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingFixturesCard;
