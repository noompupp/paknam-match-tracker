
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy } from "lucide-react";
import { Team } from "@/types/database";
import { cn } from "@/lib/utils";

interface TeamSquadHeaderProps {
  team: Team;
  playerCount: number;
}

const TeamSquadHeader = ({ team, playerCount }: TeamSquadHeaderProps) => {
  return (
    <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm border-b border-border/30">
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary flex-shrink-0" />
            <Users className="h-5 w-5 text-secondary flex-shrink-0" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate">
              {team.name} Squad
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Complete team roster and statistics
            </p>
          </div>
        </div>
        <Badge 
          variant="outline" 
          className={cn(
            "flex-shrink-0 ml-2 font-semibold",
            "bg-primary/10 text-primary border-primary/30",
            "hover:bg-primary/20 transition-colors"
          )}
        >
          {playerCount} players
        </Badge>
      </CardTitle>
    </CardHeader>
  );
};

export default TeamSquadHeader;
