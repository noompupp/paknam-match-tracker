
import TournamentLogo from "../TournamentLogo";
import UnifiedPageHeader from "@/components/shared/UnifiedPageHeader";

const DashboardHeader = () => {
  return (
    <UnifiedPageHeader>
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <TournamentLogo size="large" />
          <h1 className="text-3xl font-bold text-foreground">Paknam Football League</h1>
        </div>
        <p className="text-muted-foreground">ฟุตบอลลีคชมรมปากน้ำ</p>
      </div>
    </UnifiedPageHeader>
  );
};

export default DashboardHeader;
