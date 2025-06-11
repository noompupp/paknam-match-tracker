
import TournamentLogo from "../TournamentLogo";
import UnifiedPageHeader from "@/components/shared/UnifiedPageHeader";

const FixturesHeader = () => (
  <UnifiedPageHeader>
    <div className="text-center">
      <div className="flex items-center justify-center gap-3 mb-3">
        <TournamentLogo />
        <h1 className="text-3xl font-bold text-foreground">Fixtures</h1>
      </div>
      <p className="text-muted-foreground">Match schedule and results</p>
    </div>
  </UnifiedPageHeader>
);

export default FixturesHeader;
