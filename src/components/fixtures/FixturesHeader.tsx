
import TournamentLogo from "../TournamentLogo";

const FixturesHeader = () => (
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
          <TournamentLogo />
          <h1 className="text-3xl font-bold text-foreground">Fixtures</h1>
        </div>
        <p className="text-muted-foreground">Match schedule and results</p>
      </div>
    </div>
  </div>
);

export default FixturesHeader;
