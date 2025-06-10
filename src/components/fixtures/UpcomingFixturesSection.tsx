
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Trophy } from "lucide-react";
import CompactFixtureCard from "../shared/CompactFixtureCard";
import LoadingCard from "./LoadingCard";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";

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
}: UpcomingFixturesSectionProps) => {
  const { isMobile, isPortrait } = useDeviceOrientation();
  const isMobilePortrait = isMobile && isPortrait;

  return (
    <div id="upcoming-fixtures" className="scroll-mt-20">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-6 w-6 text-white" />
        <h2 className="text-2xl font-bold text-white">Upcoming Matches</h2>
      </div>
      
      <div className="grid gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <LoadingCard key={index} />
          ))
        ) : upcomingFixtures && upcomingFixtures.length > 0 ? (
          upcomingFixtures.map((fixture) => (
            <CompactFixtureCard 
              key={fixture.id} 
              fixture={fixture} 
              onFixtureClick={onFixtureClick}
              onPreviewClick={onPreviewClick}
              showVenue={true}
            />
          ))
        ) : (
          <Card className="card-shadow-lg">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming fixtures scheduled</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UpcomingFixturesSection;
