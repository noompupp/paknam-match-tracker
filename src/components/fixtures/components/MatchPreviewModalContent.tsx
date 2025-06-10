
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
      <div className="p-3 sm:p-6 w-full">
        <Alert className="border-destructive/50 bg-destructive/5 w-full">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-destructive-foreground">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!matchData) {
    return null;
  }

  return (
    <div className="p-3 sm:p-6 space-y-6 w-full">
      {/* New Mobile-First Match Header */}
      <MatchPreviewHeader 
        fixture={matchData.fixture}
        homeTeam={matchData.homeTeam}
        awayTeam={matchData.awayTeam}
        refereeAssignment={matchData.refereeAssignment}
        venue={matchData.venue}
      />
      
      {/* Enhanced Mobile-Optimized Tabs */}
      <MatchPreviewModalTabs matchData={matchData} />
    </div>
  );
};

export default MatchPreviewModalContent;
