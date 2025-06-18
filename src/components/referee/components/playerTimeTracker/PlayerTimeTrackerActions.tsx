
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Play } from "lucide-react";

interface PlayerTimeTrackerActionsProps {
  isMatchStarted: boolean;
  setShowInitialSelection: (show: boolean) => void;
  selectedFixtureData: any;
  t: any;
}

const PlayerTimeTrackerActions = ({
  isMatchStarted,
  setShowInitialSelection,
  selectedFixtureData,
  t
}: PlayerTimeTrackerActionsProps) => {

  if (isMatchStarted) {
    return null; // Don't show actions if match is already started
  }

  return (
    <Card className="border-dashed border-2 border-primary/20">
      <CardContent className="p-6 text-center">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {t('referee.startNewMatch', 'Start New Match')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('referee.selectStartingSquad', 'Select your starting squad to begin time tracking')}
            </p>
          </div>
          
          <Button 
            onClick={() => {
              console.log('🚀 Opening initial player selection modal');
              setShowInitialSelection(true);
            }}
            size="lg"
            className="w-full max-w-sm"
          >
            <Users className="h-4 w-4 mr-2" />
            {t('referee.selectStartingSquad', 'Select Starting Squad')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerTimeTrackerActions;
