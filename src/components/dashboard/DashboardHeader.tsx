
import TournamentLogo from "../TournamentLogo";

const DashboardHeader = () => {
  return (
    <div className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 backdrop-blur-sm border-b border-white/20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        opacity: 0.1
      }}></div>
      
      <div className="max-w-7xl mx-auto px-4 py-8 relative">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="transform transition-all duration-300 hover:scale-110">
              <TournamentLogo size="large" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-black text-white drop-shadow-lg">
                Paknam FC League
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full mt-2 shadow-md"></div>
            </div>
          </div>
          <p className="text-white/90 text-lg font-medium tracking-wide">
            🏆 Community Football Championship
          </p>
          
          {/* Enhanced Subtitle */}
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 inline-block">
            <span className="text-white/80 text-sm font-semibold uppercase tracking-wider">
              Premier League Style Dashboard
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
