
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import CompactFixtureCard from "../shared/CompactFixtureCard";
import LoadingCard from "./LoadingCard";
import { getGameweek } from "@/utils/fixtureUtils";
import { useTranslation } from "@/hooks/useTranslation";

interface AllFixturesSectionProps {
  sortedAllFixtures: any[];
  isLoading: boolean;
  onFixtureClick: (fixture: any) => void;
  onPreviewClick: (fixture: any) => void;
}

const AllFixturesSection = ({
  sortedAllFixtures,
  isLoading,
  onFixtureClick,
  onPreviewClick
}: AllFixturesSectionProps) => {
  const { t } = useTranslation();

  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Calendar className="h-5 w-5 text-primary" />
          {t('fixtures.all')} ({sortedAllFixtures?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        ) : sortedAllFixtures && sortedAllFixtures.length > 0 ? (
          <div className="space-y-4">
            {sortedAllFixtures.map((fixture) => {
              const gameweek = getGameweek(fixture, sortedAllFixtures);
              const isCompleted = fixture.status === 'completed';
              
              return (
                <div key={fixture.id} className="space-y-2">
                  {gameweek && (
                    <div className="text-sm font-medium text-muted-foreground">
                      {t('fixtures.gameweek')} {gameweek}
                    </div>
                  )}
                  <CompactFixtureCard
                    fixture={fixture}
                    onClick={isCompleted ? () => onFixtureClick(fixture) : () => onPreviewClick(fixture)}
                    variant={isCompleted ? "result" : "upcoming"}
                    showVenue={true}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">{t('common.noData')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AllFixturesSection;
