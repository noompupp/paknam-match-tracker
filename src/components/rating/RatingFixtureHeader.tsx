
import React from "react";
import TeamLogoDisplay from "@/components/fixtures/TeamLogoDisplay";
import ResponsiveTeamName from "@/components/shared/ResponsiveTeamName";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid } from "date-fns";

interface RatingFixtureHeaderProps {
  fixture: any;
  className?: string;
}

const getTeamName = (fixture: any, which: "home" | "away") => {
  // Prefer team1/team2, fallback to *_team_id
  if (which === "home") return fixture.team1 || fixture.home_team_name || fixture.home_team_id || "?";
  if (which === "away") return fixture.team2 || fixture.away_team_name || fixture.away_team_id || "?";
  return "?";
};

const getTeamLogo = (fixture: any, which: "home" | "away") => {
  // Try home_team.logoURL etc, fallback undefined
  if (which === "home") return fixture?.home_team?.logoURL;
  if (which === "away") return fixture?.away_team?.logoURL;
  return undefined;
};

const getTeamColor = (fixture: any, which: "home" | "away") => {
  if (which === "home") return fixture?.home_team?.color;
  if (which === "away") return fixture?.away_team?.color;
  return undefined;
};

const getKickoffTime = (fixture: any) => {
  // Prefer match_date + match_time, fallback match_date only
  const dateStr = fixture.match_date || fixture.date;
  const timeStr = fixture.match_time || fixture.time || "18:00";
  if (!dateStr) return "";
  // Build full ISO string for formatting
  let dateObj;
  try {
    if (dateStr && timeStr) {
      dateObj = parseISO(`${dateStr}T${timeStr}`);
    } else if (dateStr) {
      dateObj = parseISO(dateStr);
    }
    if (isValid(dateObj)) {
      return format(dateObj, "d MMM yyyy • HH:mm");
    }
  } catch {
    // fallback below
  }
  return dateStr;
};

const RatingFixtureHeader: React.FC<RatingFixtureHeaderProps> = ({ fixture, className }) => {
  return (
    <div className={cn(
      "flex items-center justify-between bg-accent rounded-lg p-3 md:p-4 mb-4 shadow-md",
      "gap-2 md:gap-6",
      className
    )}>
      {/* Home */}
      <div className="flex flex-col items-center min-w-[96px]">
        <TeamLogoDisplay
          teamName={getTeamName(fixture, "home")}
          teamLogo={getTeamLogo(fixture, "home")}
          teamColor={getTeamColor(fixture, "home")}
          size="md"
          showName={false}
        />
        <ResponsiveTeamName
          teamName={getTeamName(fixture, "home")}
          className="font-bold mt-1 text-center w-20 md:w-28"
          variant="auto"
        />
      </div>
      {/* VS and Match Info */}
      <div className="flex flex-col items-center flex-1 min-w-[72px] px-2">
        <div className="flex items-center gap-1 text-2xl font-extrabold text-primary mb-1 animate-fade-in">
          <span>
            {typeof fixture.home_score === "number" ? fixture.home_score : "?"}
          </span>
          <span className="mx-1 text-lg font-thin text-muted-foreground">-</span>
          <span>
            {typeof fixture.away_score === "number" ? fixture.away_score : "?"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <Calendar size={16} className="mr-1" />
          <span>{getKickoffTime(fixture)}</span>
        </div>
        {/* Show venue if available */}
        {fixture.venue && (
          <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
            {fixture.venue}
          </div>
        )}
      </div>
      {/* Away */}
      <div className="flex flex-col items-center min-w-[96px]">
        <TeamLogoDisplay
          teamName={getTeamName(fixture, "away")}
          teamLogo={getTeamLogo(fixture, "away")}
          teamColor={getTeamColor(fixture, "away")}
          size="md"
          showName={false}
        />
        <ResponsiveTeamName
          teamName={getTeamName(fixture, "away")}
          className="font-bold mt-1 text-center w-20 md:w-28"
          variant="auto"
        />
      </div>
    </div>
  );
};

export default RatingFixtureHeader;
