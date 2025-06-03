
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Users } from "lucide-react";
import { useTeams } from "@/hooks/useTeams";
import { useTeamMembers } from "@/hooks/useMembers";
import { useState } from "react";

const Teams = () => {
  const { data: teams, isLoading: teamsLoading, error } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  
  // Get members for the selected team (or first team if none selected)
  const targetTeamId = selectedTeamId || teams?.[0]?.id || 0;
  const { data: teamMembers, isLoading: membersLoading } = useTeamMembers(targetTeamId);
  const selectedTeam = teams?.find(team => team.id === targetTeamId);

  const getTeamLogo = (team: any) => {
    // Prioritize logoURL, then fallback to logo, then default emoji
    if (team?.logoURL) {
      return (
        <img 
          src={team.logoURL} 
          alt={`${team.name} logo`} 
          className="w-16 h-16 object-contain rounded-lg border border-gray-200" 
          onError={(e) => {
            // Fallback to emoji if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
      );
    }
    return <span className="text-6xl">{team?.logo || '⚽'}</span>;
  };

  const getTeamLogoSmall = (team: any) => {
    // For smaller displays (like in squad section)
    if (team?.logoURL) {
      return (
        <img 
          src={team.logoURL} 
          alt={`${team.name} logo`} 
          className="w-8 h-8 object-contain rounded border border-gray-200" 
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
      );
    }
    return <span className="text-2xl">{team?.logo || '⚽'}</span>;
  };

  const handleViewSquad = (teamId: number) => {
    setSelectedTeamId(teamId);
    const squadSection = document.getElementById('team-squad');
    if (squadSection) {
      squadSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center pb-20">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Error Loading Teams</h2>
          <p className="text-white/80">Please check your connection and try again.</p>
          <p className="text-white/60 text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pb-20">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Teams & Players</h1>
            <p className="text-white/80">Meet our {teams?.length || 0} competing teams</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Teams Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamsLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="card-shadow-lg">
                <CardHeader className="text-center">
                  <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-6 w-32 mx-auto mb-2" />
                  <div className="flex justify-center gap-2 mt-2">
                    <Skeleton className="h-5 w-8" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))
          ) : teams && teams.length > 0 ? (
            teams.map((team) => (
              <Card key={team.id} className="card-shadow-lg hover:card-shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in">
                <CardHeader className="text-center">
                  <div className="flex justify-center items-center mb-4 h-16">
                    {getTeamLogo(team)}
                    <span className="text-6xl hidden">{team?.logo || '⚽'}</span>
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
                    onClick={() => handleViewSquad(team.id)}
                  >
                    View Squad <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center text-white">
              <p className="text-xl mb-2">No teams found</p>
              <p className="text-white/80">Teams will appear here once they are added to the database.</p>
            </div>
          )}
        </div>

        {/* Team Squad (showing selected team's squad) */}
        {selectedTeam && (
          <Card id="team-squad" className="card-shadow-lg animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    {getTeamLogoSmall(selectedTeam)}
                    <span className="text-2xl hidden">{selectedTeam?.logo || '⚽'}</span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">{selectedTeam.name} Squad</CardTitle>
                    <p className="text-muted-foreground">Current season players</p>
                  </div>
                </div>
                <Badge className="bg-primary text-primary-foreground">
                  {teamMembers?.length || 0} Players
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {membersLoading ? (
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
                ) : teamMembers && teamMembers.length > 0 ? (
                  teamMembers.map((player, index) => (
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
        )}
      </div>
    </div>
  );
};

export default Teams;
