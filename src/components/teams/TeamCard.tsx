import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import TeamLogo from "./TeamLogo";
import { Team } from "@/types/database";

interface TeamCardProps {
  team: Team;
  onViewSquad: (teamId: string) => void;
}

const TeamCard = ({ team, onViewSquad }: TeamCardProps) => {
  return (
    <Card className="card-shadow-lg hover:card-shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center mb-4 h-16">
          <TeamLogo team={team} size="large" />
        </div>
        <CardTitle className="text-xl font-bold">{team.name}</CardTitle>
        <div className="flex justify-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs">#{team.position}</Badge>
          <Badge className="bg-primary text-primary-foreground text-xs">{team.points} pts</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Team Color:</span>
          <div className="flex items-center gap-2">
            {team.color && (
              <div 
                className="w-4 h-4 rounded-full border border-gray-300" 
                style={{ backgroundColor: team.color }}
              />
            )}
            <span className="font-semibold">{team.color || 'Not specified'}</span>
          </div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Captain:</span>
          <span className="font-semibold">{team.captain || 'TBD'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Record:</span>
          <span className="font-semibold">
            {team.won}W-{team.drawn}D-{team.lost}L
          </span>
        </div>
        <Button 
          className="w-full mt-4 bg-primary hover:bg-primary/90" 
          size="sm"
          onClick={() => onViewSquad(team.__id__)}
        >
          View Squad <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default TeamCard;
