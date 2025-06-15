
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Calendar } from "lucide-react";
import CompactFixtureCard from "../shared/CompactFixtureCard";
import LoadingCard from "./LoadingCard";
import { Badge } from "@/components/ui/badge";

interface RecentResultsSectionProps {
  recentFixtures: any[];
  allFixtures: any[];
  isLoading: boolean;
  onFixtureClick: (fixture: any) => void;
}

const RecentResultsSection = ({
  recentFixtures,
  allFixtures,
  isLoading,
  onFixtureClick
}: RecentResultsSectionProps) => {
  const completedFixtures = recentFixtures?.filter(fixture => 
    fixture.status === 'completed' || fixture.status === 'finished'
  ) || [];

  const upcomingFixtures = allFixtures?.filter(fixture => 
    fixture.status === 'scheduled' || fixture.status === 'pending'
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Recent Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recent Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Recent Results
            </div>
            <Badge variant="secondary">
              {completedFixtures.length} matches
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedFixtures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No completed matches yet</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {completedFixtures.map((fixture) => (
                <CompactFixtureCard
                  key={fixture.id}
                  fixture={fixture}
                  onClick={() => onFixtureClick(fixture)}
                  showStatus={false}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Fixtures Preview */}
      {upcomingFixtures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Fixtures
              </div>
              <Badge variant="outline">
                {upcomingFixtures.slice(0, 3).length} next
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {upcomingFixtures.slice(0, 3).map((fixture) => (
                <CompactFixtureCard
                  key={fixture.id}
                  fixture={fixture}
                  onClick={() => onFixtureClick(fixture)}
                  showStatus={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecentResultsSection;
