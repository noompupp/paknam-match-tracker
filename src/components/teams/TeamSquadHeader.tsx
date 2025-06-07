
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle } from "@/components/ui/card";
import TeamLogo from "./TeamLogo";
import TopNotchBackground from "../TopNotchBackground";
import { Team } from "@/types/database";
import { useThemeDetection } from "@/hooks/useThemeDetection";
import { cn } from "@/lib/utils";

interface TeamSquadHeaderProps {
  team: Team;
  playerCount: number;
}

const TeamSquadHeader = ({ team, playerCount }: TeamSquadHeaderProps) => {
  const { isDark } = useThemeDetection();

  return (
    <TopNotchBackground>
      <CardHeader className={cn(
        "enhanced-header",
        isDark ? "theme-dark" : "theme-light"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TeamLogo team={team} size="small" />
            <div>
              <CardTitle className="text-2xl font-bold">{team.name} Squad</CardTitle>
              <p className="text-muted-foreground">Current season players & statistics</p>
            </div>
          </div>
          <Badge className="bg-primary text-primary-foreground">
            {playerCount} Players
          </Badge>
        </div>
      </CardHeader>
    </TopNotchBackground>
  );
};

export default TeamSquadHeader;
