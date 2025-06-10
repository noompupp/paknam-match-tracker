
import { Separator } from "@/components/ui/separator";
import { Zap } from "lucide-react";
import { Member } from "@/types/database";

interface TeamStatsSummaryProps {
  players: Member[];
}

const TeamStatsSummary = ({ players }: TeamStatsSummaryProps) => {
  const totalGoals = players.reduce((sum, player) => sum + (player.goals || 0), 0);
  const totalAssists = players.reduce((sum, player) => sum + (player.assists || 0), 0);
  const totalYellowCards = players.reduce((sum, player) => sum + (player.yellow_cards || 0), 0);
  const totalRedCards = players.reduce((sum, player) => sum + (player.red_cards || 0), 0);

  return (
    <>
      <Separator />
      
      {/* Team Statistics Summary */}
      <div className="p-6 bg-gradient-to-r from-muted/30 to-muted/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <h4 className="font-bold text-lg text-foreground">Team Statistics</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center space-y-1">
            <div className="text-3xl font-bold text-green-600">
              {totalGoals}
            </div>
            <div className="text-sm font-medium text-muted-foreground">Total Goals</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-3xl font-bold text-blue-600">
              {totalAssists}
            </div>
            <div className="text-sm font-medium text-muted-foreground">Total Assists</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-3xl font-bold text-yellow-600">
              {totalYellowCards}
            </div>
            <div className="text-sm font-medium text-muted-foreground">Yellow Cards</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-3xl font-bold text-red-600">
              {totalRedCards}
            </div>
            <div className="text-sm font-medium text-muted-foreground">Red Cards</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamStatsSummary;
