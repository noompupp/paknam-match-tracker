
import TournamentLogo from "../TournamentLogo";

const DashboardHeader = () => {
  return (
    <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <TournamentLogo size="large" />
            <h1 className="text-3xl font-bold text-white">Paknam FC League</h1>
          </div>
          <p className="text-white/80">Community Football Championship</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
