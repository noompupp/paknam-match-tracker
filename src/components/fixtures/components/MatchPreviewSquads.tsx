
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Users, Star, Shield, Zap, Trophy } from "lucide-react";
import { Team, Member } from "@/types/database";

interface MatchPreviewSquadsProps {
  homeTeam: Team;
  awayTeam: Team;
  homeSquad: Member[];
  awaySquad: Member[];
}

const MatchPreviewSquads = ({ homeTeam, awayTeam, homeSquad, awaySquad }: MatchPreviewSquadsProps) => {
  const getPlayersByPosition = (squad: Member[]) => {
    const positions = {
      Goalkeeper: squad.filter(p => p.position === 'Goalkeeper'),
      Defender: squad.filter(p => p.position === 'Defender'),
      Midfielder: squad.filter(p => p.position === 'Midfielder'),
      Forward: squad.filter(p => p.position === 'Forward'),
      Player: squad.filter(p => p.position === 'Player' || !p.position)
    };
    return positions;
  };

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'Goalkeeper':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'Defender':
        return <Shield className="h-4 w-4 text-green-600" />;
      case 'Midfielder':
        return <Zap className="h-4 w-4 text-yellow-600" />;
      case 'Forward':
        return <Zap className="h-4 w-4 text-red-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'Goalkeeper':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'Defender':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'Midfielder':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'Forward':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getTopScorer = (squad: Member[]) => {
    return squad.reduce((top, player) => 
      (player.goals || 0) > (top.goals || 0) ? player : top
    , squad[0]);
  };

  const getTopAssister = (squad: Member[]) => {
    return squad.reduce((top, player) => 
      (player.assists || 0) > (top.assists || 0) ? player : top
    , squad[0]);
  };

  const PlayerCard = ({ player, isTopScorer = false, isTopAssister = false }: { 
    player: Member, 
    isTopScorer?: boolean, 
    isTopAssister?: boolean 
  }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50 hover:border-border transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {player.number && (
            <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold">
              {player.number}
            </Badge>
          )}
          <div>
            <p className="font-medium text-sm">{player.name}</p>
            {player.nickname && (
              <p className="text-xs text-muted-foreground">"{player.nickname}"</p>
            )}
          </div>
        </div>
        {(isTopScorer || isTopAssister) && (
          <div className="flex gap-1">
            {isTopScorer && <Star className="h-3 w-3 text-yellow-500" title="Top Scorer" />}
            {isTopAssister && <Trophy className="h-3 w-3 text-blue-500" title="Top Assists" />}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="text-center">
          <p className="font-semibold text-foreground">{player.goals || 0}</p>
          <p>Goals</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">{player.assists || 0}</p>
          <p>Assists</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground">{player.matches_played || 0}</p>
          <p>Apps</p>
        </div>
      </div>
    </div>
  );

  const TeamSquad = ({ team, squad, teamColor }: { team: Team, squad: Member[], teamColor: string }) => {
    const positions = getPlayersByPosition(squad);
    const topScorer = squad.length > 0 ? getTopScorer(squad) : null;
    const topAssister = squad.length > 0 ? getTopAssister(squad) : null;

    return (
      <Card className={`${teamColor} border-2`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {team.name} Squad
            </div>
            <Badge variant="outline">
              {squad.length} players
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {squad.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No squad information available</p>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {Object.entries(positions).map(([position, players]) => {
                if (players.length === 0) return null;
                
                return (
                  <AccordionItem key={position} value={position}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        {getPositionIcon(position)}
                        <span className="font-medium">{position}s</span>
                        <Badge variant="secondary" className="ml-auto mr-2">
                          {players.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                      <div className={`p-3 rounded-lg ${getPositionColor(position)} mb-3`}>
                        <p className="text-sm font-medium">{position} Squad</p>
                      </div>
                      <div className="space-y-2">
                        {players.map((player) => (
                          <PlayerCard 
                            key={player.id} 
                            player={player}
                            isTopScorer={topScorer?.id === player.id && (player.goals || 0) > 0}
                            isTopAssister={topAssister?.id === player.id && (player.assists || 0) > 0}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Squad Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{homeTeam.name} Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{homeSquad.length}</p>
                <p className="text-xs text-muted-foreground">Players</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {homeSquad.reduce((sum, p) => sum + (p.goals || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Goals</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {homeSquad.reduce((sum, p) => sum + (p.assists || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Assists</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-l from-secondary/5 to-transparent border-secondary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{awayTeam.name} Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-secondary">{awaySquad.length}</p>
                <p className="text-xs text-muted-foreground">Players</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {awaySquad.reduce((sum, p) => sum + (p.goals || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Goals</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {awaySquad.reduce((sum, p) => sum + (p.assists || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Assists</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Squads */}
      <div className="space-y-6">
        <TeamSquad 
          team={homeTeam} 
          squad={homeSquad} 
          teamColor="bg-gradient-to-r from-primary/5 to-transparent border-primary/30"
        />
        
        <TeamSquad 
          team={awayTeam} 
          squad={awaySquad} 
          teamColor="bg-gradient-to-l from-secondary/5 to-transparent border-secondary/30"
        />
      </div>
    </div>
  );
};

export default MatchPreviewSquads;
