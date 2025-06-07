
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import FixtureCard from "./FixtureCard";
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
}: RecentResultsSectionProps) => (
  <div id="recent-results" className="scroll-mt-20">
    <div className="flex items-center gap-2 mb-6">
      <Trophy className="h-6 w-6 text-foreground" />
      <h2 className="text-2xl font-bold text-foreground">Recent Results</h2>
    </div>
    
    <div className="grid gap-4">
      {isLoading ? (
        Array.from({ length: 3 }).map((_, index) => (
          <LoadingCard key={index} />
        ))
      ) : recentFixtures && recentFixtures.length > 0 ? (
        recentFixtures.map((fixture) => (
          <FixtureCard 
            key={fixture.id} 
            fixture={fixture} 
            showScore 
            onFixtureClick={onFixtureClick}
          />
        ))
      ) : (
        <Card className="card-shadow-lg">
          <CardContent className="p-8 text-center text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent results available</p>
          </CardContent>
        </Card>
      )}
    </div>
  </div>
);

export default RecentResultsSection;
