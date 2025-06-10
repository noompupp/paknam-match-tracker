
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import CompactFixtureCard from "../shared/CompactFixtureCard";
import LoadingCard from "./LoadingCard";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";

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
}: AllFixturesSectionProps) => {
  const { isMobile, isPortrait } = useDeviceOrientation();
  const isMobilePortrait = isMobile && isPortrait;

  return (
    <div id="all-fixtures" className="scroll-mt-20">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-6 w-6 text-white" />
        <h2 className="text-2xl font-bold text-white">All Fixtures</h2>
      </div>
      
      <div className="grid gap-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <LoadingCard key={index} />
          ))
        ) : sortedAllFixtures && sortedAllFixtures.length > 0 ? (
          sortedAllFixtures.map((fixture) => (
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
              <p>No fixtures found</p>
              <p className="text-sm">Fixtures will appear here once they are added to the database.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AllFixturesSection;
