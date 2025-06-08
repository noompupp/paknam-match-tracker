import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import FixtureCard from "./FixtureCard";
import LoadingCard from "./LoadingCard";

interface AllFixturesSectionProps {
  sortedAllFixtures: any[];
  isLoading: boolean;
  onFixtureClick: (fixture: any) => void;
}

const AllFixturesSection = ({ 
  sortedAllFixtures, 
  isLoading, 
  onFixtureClick 
}: AllFixturesSectionProps) => {
  // Separate recent results (completed fixtures) from other fixtures
  const recentResults = sortedAllFixtures.filter(fixture => fixture.status === 'completed');
  const otherFixtures = sortedAllFixtures.filter(fixture => fixture.status !== 'completed');

  return (
    <div id="all-fixtures" className="scroll-mt-20">
      {/* Recent Results Section */}
      {recentResults.length > 0 && (
        <div id="recent-results" className="scroll-mt-20 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-6 w-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Recent Results</h2>
          </div>
          
          <div className="grid gap-4">
            {recentResults.map((fixture) => (
              <FixtureCard 
                key={fixture.id} 
                fixture={fixture} 
                showScore={true} 
                onFixtureClick={onFixtureClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Fixtures Section */}
      {otherFixtures.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-6 w-6 text-white" />
            <h2 className="text-2xl font-bold text-white">All Fixtures</h2>
          </div>
          
          <div className="grid gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <LoadingCard key={index} />
              ))
            ) : (
              otherFixtures.map((fixture) => (
                <FixtureCard 
                  key={fixture.id} 
                  fixture={fixture} 
                  showScore={fixture.status === 'completed'} 
                  onFixtureClick={onFixtureClick}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* No fixtures found */}
      {!isLoading && sortedAllFixtures.length === 0 && (
        <Card className="card-shadow-lg">
          <CardContent className="p-8 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No fixtures found</p>
            <p className="text-sm">Fixtures will appear here once they are added to the database.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AllFixturesSection;
