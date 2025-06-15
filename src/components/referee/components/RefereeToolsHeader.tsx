
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer, AlertTriangle, CheckCircle2 } from "lucide-react";
import ImprovedMatchSelection from "./ImprovedMatchSelection";
import { useTranslation } from "@/hooks/useTranslation";

interface RefereeToolsHeaderProps {
  fixtures: any[];
  selectedFixture: string;
  onFixtureChange: (value: string) => void;
  enhancedPlayersData: {
    hasValidData: boolean;
    dataIssues: string[];
  };
}

const RefereeToolsHeader = ({
  fixtures,
  selectedFixture,
  onFixtureChange,
  enhancedPlayersData
}: RefereeToolsHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <Card className="referee-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Timer className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl md:text-2xl font-bold">
                  {t('referee.title')}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('referee.subtitle')}
                </p>
              </div>
            </div>
            
            {selectedFixture && (
              <div className="flex items-center gap-2">
                {enhancedPlayersData.hasValidData ? (
                  <Badge variant="default" className="referee-status-active">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {t('referee.ready')}
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="referee-status-warning">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {t('referee.issues')}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Match Selection */}
      <ImprovedMatchSelection
        fixtures={fixtures || []}
        selectedFixture={selectedFixture}
        onFixtureChange={onFixtureChange}
        enhancedPlayersData={enhancedPlayersData}
      />
    </div>
  );
};

export default RefereeToolsHeader;
