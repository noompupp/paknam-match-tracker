
import TournamentLogo from "../TournamentLogo";

const DashboardHeader = () => {
  return (
    <div 
      className="border-b"
      style={{
        background: 'var(--header-background)',
        backdropFilter: 'var(--header-backdrop-blur)',
        borderColor: 'var(--header-border)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <TournamentLogo size="large" />
            <h1 className="text-3xl font-bold text-foreground">Paknam FC League</h1>
          </div>
          <p className="text-muted-foreground">Community Football Championship</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
