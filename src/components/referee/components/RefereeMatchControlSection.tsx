
import { useStableScoreSync } from "@/hooks/useStableScoreSync";

interface RefereeMatchControlSectionProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  saveAttempts: number;
  onSaveMatch: () => void;
  onResetMatch: () => void;
}

const RefereeMatchControlSection = ({
  selectedFixtureData,
  saveAttempts,
  onSaveMatch,
  onResetMatch
}: RefereeMatchControlSectionProps) => {
  // Use stable score sync to prevent flickering during timer activity
  const { homeScore, awayScore } = useStableScoreSync({
    fixtureId: selectedFixtureData?.id,
    onScoreUpdate: (newHome, newAway) => {
      console.log('📊 RefereeMatchControlSection: Stable score update:', { newHome, newAway });
    }
  });

  if (!selectedFixtureData) return null;

  return (
    <div className="bg-card p-4 rounded-lg border">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Match Control</h3>
          <p className="text-sm text-muted-foreground">
            Save attempts: {saveAttempts} | Score: {homeScore}-{awayScore}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSaveMatch}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Save Match Data
          </button>
          <button
            onClick={onResetMatch}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
          >
            Reset Match
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefereeMatchControlSection;
