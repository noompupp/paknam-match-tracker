
import TournamentLogo from "../TournamentLogo";
import TopNotchBackground from "../TopNotchBackground";
import { useThemeDetection } from "@/hooks/useThemeDetection";
import { cn } from "@/lib/utils";

const FixturesHeader = () => {
  const { isDark, systemTheme } = useThemeDetection();

  return (
    <TopNotchBackground>
      <div className={cn(
        "enhanced-header border-b border-white/20",
        isDark ? "theme-dark" : "theme-light"
      )}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <TournamentLogo />
              <h1 className="text-3xl font-bold text-white">Fixtures</h1>
            </div>
            <p className="text-white/80">Match schedule and results</p>
          </div>
        </div>
      </div>
    </TopNotchBackground>
  );
};

export default FixturesHeader;
