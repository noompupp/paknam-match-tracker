
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import UnifiedFixtureCard from "../shared/UnifiedFixtureCard";
import LoadingCard from "./LoadingCard";

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
      
      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <LoadingCard key={index} />
          ))
        ) : (
          completedFixtures.map((fixture) => (
            <UnifiedFixtureCard 
              key={fixture.id} 
              fixture={fixture} 
              onFixtureClick={onFixtureClick}
              variant="compact"
              showVenue={true}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RecentResultsSection;
