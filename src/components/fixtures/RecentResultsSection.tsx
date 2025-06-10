
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, TrendingUp } from "lucide-react";
import FixtureCard from "./FixtureCard";
import LoadingCard from "./LoadingCard";

interface RecentResultsSectionProps {
  recentFixtures: any[];
  isLoading: boolean;
  onFixtureClick: (fixture: any) => void;
  onPreviewClick?: (fixture: any) => void;
}

const RecentResultsSection = ({ 
  recentFixtures, 
  isLoading, 
  onFixtureClick,
  onPreviewClick
}: RecentResultsSectionProps) => {
  // Filter to only show completed fixtures
  const completedFixtures = recentFixtures.filter(fixture => fixture.status === 'completed');

  if (completedFixtures.length === 0 && !isLoading) {
    return null; // Don't show section if no results
  }

  return (
    <div id="recent-results" className="scroll-mt-20 mb-8">
      <div className="flex items-center gap-3 mb-6 px-1">
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-200">
          <Trophy className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Recent Results</h2>
          <p className="text-sm text-muted-foreground">Latest completed matches</p>
        </div>
        {completedFixtures.length > 0 && (
          <div className="ml-auto flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
            <TrendingUp className="h-3 w-3" />
            <span className="text-xs font-medium">{completedFixtures.length}</span>
          </div>
        )}
      </div>
      
      <div className="grid gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <LoadingCard key={index} />
          ))
        ) : (
          completedFixtures.map((fixture) => (
            <FixtureCard 
              key={fixture.id} 
              fixture={fixture} 
              showScore={true} 
              onFixtureClick={onFixtureClick}
              onPreviewClick={onPreviewClick}
              useCompactLayout={true}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RecentResultsSection;
