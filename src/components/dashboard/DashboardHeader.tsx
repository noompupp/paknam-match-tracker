
import TournamentLogo from "../TournamentLogo";
import UnifiedPageHeader from "@/components/shared/UnifiedPageHeader";

const DashboardHeader = () => {
  return (
    <UnifiedPageHeader>
      <div className="text-center">
        <div className="flex items-center justify-center">
          <TournamentLogo />
        </div>
      </div>
    </UnifiedPageHeader>
  );
};

export default DashboardHeader;
