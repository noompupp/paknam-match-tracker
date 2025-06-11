
import TournamentLogo from "../TournamentLogo";
import { Trophy } from "lucide-react";
import UnifiedPageHeader from "@/components/shared/UnifiedPageHeader";

const ResultsHeader = () => {
  return (
    <UnifiedPageHeader>
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <TournamentLogo size="large" />
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Match Results</h1>
          </div>
        </div>
        <p className="text-muted-foreground">View completed matches and detailed match summaries</p>
      </div>
    </UnifiedPageHeader>
  );
};

export default ResultsHeader;
