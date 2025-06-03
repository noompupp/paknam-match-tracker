
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import TeamLogo from "./TeamLogo";
import { Team, Member } from "@/types/database";

interface TeamSquadProps {
  team: Team;
  members: Member[] | undefined;
  isLoading: boolean;
}

const TeamSquad = ({ team, members, isLoading }: TeamSquadProps) => {
  return (
    <Card id="team-squad" className="card-shadow-lg animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TeamLogo team={team} size="small" />
            <div>
              <CardTitle className="text-2xl font-bold">{team.name} Squad</CardTitle>
              <p className="text-muted-foreground">Current season players</p>
            </div>
          </div>
          <Badge className="bg-primary text-primary-foreground">
            {members?.length || 0} Players
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))
          ) : members && members.length > 0 ? (
            members.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                    {player.number || index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{player.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{player.position}</span>
                      <Badge 
                        variant={player.role === "Captain" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {player.role}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold">{player.goals}G / {player.assists}A</p>
                  <p className="text-muted-foreground">This season</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No players found for this team</p>
              <p className="text-sm">Players will appear here once they are added to the database.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamSquad;
