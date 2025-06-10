
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Trophy, Clock } from "lucide-react";
import FixtureCard from "./FixtureCard";
import LoadingCard from "./LoadingCard";

interface UpcomingFixturesSectionProps {
  upcomingFixtures: any[];
  isLoading: boolean;
  onFixtureClick: (fixture: any) => void;
  onPreviewClick?: (fixture: any) => void;
}

const UpcomingFixturesSection = ({ 
  upcomingFixtures, 
  isLoading, 
  onFixtureClick,
  onPreviewClick
}: UpcomingFixturesSectionProps) => (
  <div id="upcoming-fixtures" className="scroll-mt-20">
    <div className="flex items-center gap-3 mb-6 px-1">
      <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-200">
        <Clock className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground">Upcoming Matches</h2>
        <p className="text-sm text-muted-foreground">Scheduled fixtures</p>
      </div>
      {upcomingFixtures && upcomingFixtures.length > 0 && (
        <div className="ml-auto flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-600">
          <Calendar className="h-3 w-3" />
          <span className="text-xs font-medium">{upcomingFixtures.length}</span>
        </div>
      )}
    </div>
    
    <div className="grid gap-3">
      {isLoading ? (
        Array.from({ length: 3 }).map((_, index) => (
          <LoadingCard key={index} />
        ))
      ) : upcomingFixtures && upcomingFixtures.length > 0 ? (
        upcomingFixtures.map((fixture) => (
          <FixtureCard 
            key={fixture.id} 
            fixture={fixture} 
            onFixtureClick={onFixtureClick}
            onPreviewClick={onPreviewClick}
            useCompactLayout={true}
          />
        ))
      ) : (
        <Card className="border border-dashed border-muted-foreground/20 bg-muted/10">
          <CardContent className="p-8 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p className="font-medium">No upcoming fixtures scheduled</p>
            <p className="text-sm mt-1">Check back later for new matches</p>
          </CardContent>
        </Card>
      )}
    </div>
  </div>
);

export default UpcomingFixturesSection;
