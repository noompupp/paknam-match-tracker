
import TournamentLogo from "../TournamentLogo";
import StickyBackground from "@/components/shared/StickyBackground";

const DashboardHeader = () => {
  return (
    <StickyBackground variant="header" className="border-b mobile-safe-header">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <TournamentLogo size="large" />
            <h1 className="text-3xl font-bold text-foreground">Paknam Football League</h1>
          </div>
          <p className="text-muted-foreground">ฟุตบอลลีคชมรมปากน้ำ</p>
        </div>
      </div>
    </StickyBackground>
  );
};

export default DashboardHeader;
