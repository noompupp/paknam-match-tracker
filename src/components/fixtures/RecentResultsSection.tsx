
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import CompactFixtureCard from "../shared/CompactFixtureCard";
import LoadingCard from "./LoadingCard";
import { getGameweek } from "@/utils/fixtureUtils";
import { useTranslation } from "@/hooks/useTranslation";

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
  const { t } = useTranslation();

  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Trophy className="h-5 w-5 text-primary" />
          {t('fixtures.recent')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        ) : recentFixtures && recentFixtures.length > 0 ? (
          <div className="space-y-4">
            {recentFixtures.slice(0, 8).map((fixture) => {
              const gameweek = getGameweek(fixture, allFixtures);
              return (
                <div key={fixture.id} className="space-y-2">
                  {gameweek && (
                    <div className="text-sm font-medium text-muted-foreground">
                      {t('fixtures.gameweek')} {gameweek}
                    </div>
                  )}
                  <CompactFixtureCard
                    fixture={fixture}
                    onClick={() => onFixtureClick(fixture)}
                    variant="result"
                    showVenue={true}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">{t('common.noData')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentResultsSection;
