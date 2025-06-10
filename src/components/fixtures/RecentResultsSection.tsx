
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import CompactFixtureCard from "../shared/CompactFixtureCard";
import LoadingCard from "./LoadingCard";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";

interface RecentResultsSectionProps {
  recentFixtures: any[];
  isLoading: boolean;
  onFixtureClick: (fixture: any) => void;
}

const RecentResultsSection = ({ 
  recentFixtures, 
  isLoading, 
  onFixtureClick 
}: RecentResultsSectionProps) => {
  const { isMobile, isPortrait } = useDeviceOrientation();
  const isMobilePortrait = isMobile && isPortrait;
  
  // Filter to only show completed fixtures
  const completedFixtures = recentFixtures.filter(fixture => fixture.status === 'completed');

  if (completedFixtures.length === 0 && !isLoading) {
    return null; // Don't show section if no results
  }

  return (
    <div id="recent-results" className="scroll-mt-20 mb-8">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-6 w-6 text-white" />
        <h2 className="text-2xl font-bold text-white">Recent Results</h2>
      </div>
      
      <div className="grid gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <LoadingCard key={index} />
          ))
        ) : (
          completedFixtures.map((fixture) => (
            isMobilePortrait ? (
              <CompactFixtureCard 
                key={fixture.id} 
                fixture={fixture} 
                onFixtureClick={onFixtureClick}
                showVenue={true}
              />
            ) : (
              <CompactFixtureCard 
                key={fixture.id} 
                fixture={fixture} 
                onFixtureClick={onFixtureClick}
                showVenue={true}
              />
            )
          ))
        )}
      </div>
    </div>
  );
};

export default RecentResultsSection;
