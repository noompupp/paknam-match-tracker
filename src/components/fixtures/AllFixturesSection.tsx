
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, List } from "lucide-react";
import FixtureCard from "./FixtureCard";
import LoadingCard from "./LoadingCard";

interface AllFixturesSectionProps {
  sortedAllFixtures: any[];
  isLoading: boolean;
  onFixtureClick: (fixture: any) => void;
  onPreviewClick?: (fixture: any) => void;
}

const AllFixturesSection = ({ 
  sortedAllFixtures, 
  isLoading, 
  onFixtureClick,
  onPreviewClick
}: AllFixturesSectionProps) => (
  <div id="all-fixtures" className="scroll-mt-20">
    <div className="flex items-center gap-3 mb-6 px-1">
      <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-200">
        <List className="h-5 w-5 text-purple-600" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground">All Fixtures</h2>
        <p className="text-sm text-muted-foreground">Complete match schedule</p>
      </div>
      {sortedAllFixtures && sortedAllFixtures.length > 0 && (
        <div className="ml-auto flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/10 text-purple-600">
          <Calendar className="h-3 w-3" />
          <span className="text-xs font-medium">{sortedAllFixtures.length}</span>
        </div>
      )}
    </div>
    
    <div className="grid gap-3">
      {isLoading ? (
        Array.from({ length: 6 }).map((_, index) => (
          <LoadingCard key={index} />
        ))
      ) : sortedAllFixtures && sortedAllFixtures.length > 0 ? (
        sortedAllFixtures.map((fixture) => (
          <FixtureCard 
            key={fixture.id} 
            fixture={fixture} 
            showScore={fixture.status === 'completed'} 
            onFixtureClick={onFixtureClick}
            onPreviewClick={onPreviewClick}
            useCompactLayout={true}
          />
        ))
      ) : (
        <Card className="border border-dashed border-muted-foreground/20 bg-muted/10">
          <CardContent className="p-8 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <div className="space-y-2">
              <p className="font-medium">No fixtures found</p>
              <p className="text-sm">Fixtures will appear here once they are added to the database</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  </div>
);

export default AllFixturesSection;
