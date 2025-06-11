
import { useRecentFixtures, useUpcomingFixtures } from "@/hooks/useFixtures";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Calendar, Users, Target } from "lucide-react";
import CompactFixtureCard from "./shared/CompactFixtureCard";
import LoadingCard from "./fixtures/LoadingCard";
import TopScorersList from "./shared/TopScorersList";
import TopAssistersList from "./shared/TopAssistersList";
import MatchSummaryDialog from "./fixtures/MatchSummaryDialog";
import DashboardHeader from "./dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { useTranslation } from "@/hooks/useTranslation";

interface DashboardProps {
  onNavigateToResults: () => void;
  onNavigateToFixtures: () => void;
}

const Dashboard = ({ onNavigateToResults, onNavigateToFixtures }: DashboardProps) => {
  const { t } = useTranslation();
  const { data: recentFixtures, isLoading: recentLoading, error: recentError } = useRecentFixtures();
  const { data: upcomingFixtures, isLoading: upcomingLoading, error: upcomingError } = useUpcomingFixtures();
  const [selectedFixture, setSelectedFixture] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);
  const { isMobile, isPortrait } = useDeviceOrientation();
  const isMobilePortrait = isMobile && isPortrait;

  if (recentError || upcomingError) {
    return (
      <div className="gradient-bg flex items-center justify-center min-h-screen">
        <div className="text-center text-foreground container-responsive">
          <h2 className="text-2xl font-bold mb-4">{t('common.error')}</h2>
          <p className="text-muted-foreground">{t('message.connectionError')}</p>
        </div>
      </div>
    );
  }

  const handleFixtureClick = (fixture: any) => {
    if (fixture.status === 'completed') {
      setSelectedFixture(fixture);
      setShowSummary(true);
    }
  };

  return (
    <>
      <div className="gradient-bg">
        <DashboardHeader />

        <div className="max-w-7xl mx-auto container-responsive py-8 space-y-8 mobile-content-spacing">
          {/* Latest Results Section */}
          <Card className="card-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Trophy className="h-5 w-5 text-primary" />
                {t('dashboard.latestResults')}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onNavigateToResults}
                className="text-primary hover:text-primary/80"
              >
                {t('dashboard.seeAllResults')}
              </Button>
            </CardHeader>
            <CardContent>
              {recentLoading ? (
                <div className="grid gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <LoadingCard key={i} />
                  ))}
                </div>
              ) : recentFixtures && recentFixtures.length > 0 ? (
                <div className="space-y-4">
                  {recentFixtures.slice(0, 3).map((fixture) => (
                    <CompactFixtureCard
                      key={fixture.id}
                      fixture={fixture}
                      onClick={() => handleFixtureClick(fixture)}
                      variant="result"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {t('common.noData')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Fixtures Section */}
          <Card className="card-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Calendar className="h-5 w-5 text-primary" />
                {t('dashboard.upcomingFixtures')}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onNavigateToFixtures}
                className="text-primary hover:text-primary/80"
              >
                {t('dashboard.seeAllFixtures')}
              </Button>
            </CardHeader>
            <CardContent>
              {upcomingLoading ? (
                <div className="grid gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <LoadingCard key={i} />
                  ))}
                </div>
              ) : upcomingFixtures && upcomingFixtures.length > 0 ? (
                <div className="space-y-4">
                  {upcomingFixtures.slice(0, 3).map((fixture) => (
                    <CompactFixtureCard
                      key={fixture.id}
                      fixture={fixture}
                      onClick={() => handleFixtureClick(fixture)}
                      variant="upcoming"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {t('common.noData')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Stats Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Scorers */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Target className="h-5 w-5 text-primary" />
                  {t('dashboard.topScorers')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TopScorersList limit={5} showViewAll={true} />
              </CardContent>
            </Card>

            {/* Top Assisters */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Users className="h-5 w-5 text-primary" />
                  {t('dashboard.topAssisters')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TopAssistersList limit={5} showViewAll={true} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Match Summary Dialog */}
      <MatchSummaryDialog 
        fixture={selectedFixture}
        isOpen={showSummary}
        onClose={() => {
          setShowSummary(false);
          setSelectedFixture(null);
        }}
      />
    </>
  );
};

export default Dashboard;
