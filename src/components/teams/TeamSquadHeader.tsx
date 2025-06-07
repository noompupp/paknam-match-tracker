
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle } from "@/components/ui/card";
import TeamLogo from "./TeamLogo";
import { Team } from "@/types/database";

interface TeamSquadHeaderProps {
  team: Team;
  playerCount: number;
}

const TeamSquadHeader = ({ team, playerCount }: TeamSquadHeaderProps) => {
  return (
    <CardHeader>
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
  );
};

export default TeamSquadHeader;
