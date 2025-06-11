
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { EnhancedMatchData } from "@/services/fixtures/enhancedMatchDataService";
import MatchPreviewHeader from "./MatchPreviewHeader";
import MatchPreviewModalSkeleton from "./MatchPreviewModalSkeleton";
import MatchPreviewModalTabs from "./MatchPreviewModalTabs";

interface MatchPreviewModalContentProps {
  matchData: EnhancedMatchData | null;
  isLoading: boolean;
  error: string | null;
}

const MatchPreviewModalContent = ({ matchData, isLoading, error }: MatchPreviewModalContentProps) => {
  if (isLoading) {
    return <MatchPreviewModalSkeleton />;
  }

  if (error) {
    return (
      <Alert className="border-destructive/50 bg-destructive/5 w-full">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-destructive-foreground">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!matchData) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Match Header */}
      <MatchPreviewHeader 
        fixture={matchData.fixture}
        homeTeam={matchData.homeTeam}
        awayTeam={matchData.awayTeam}
        refereeAssignment={matchData.refereeAssignment}
        venue={matchData.venue}
      />
      
      {/* Tabs Content */}
      <MatchPreviewModalTabs matchData={matchData} />
    </div>
  );
};

export default MatchPreviewModalContent;
