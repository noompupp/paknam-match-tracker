
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Users, Star, Shield, Zap, Trophy } from "lucide-react";
import { Team, Member } from "@/types/database";
import SquadPlayerCard from "./SquadPlayerCard";

interface TeamSquadSectionProps {
  team: Team;
  squad: Member[];
  teamColor: string;
}

const TeamSquadSection = ({ team, squad, teamColor }: TeamSquadSectionProps) => {
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
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800/50 dark:text-blue-300';
      case 'Defender':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800/50 dark:text-green-300';
      case 'Midfielder':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/30 dark:border-yellow-800/50 dark:text-yellow-300';
      case 'Forward':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800/50 dark:text-red-300';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-950/30 dark:border-gray-800/50 dark:text-gray-300';
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

  const positions = getPlayersByPosition(squad);
  const topScorer = squad.length > 0 ? getTopScorer(squad) : null;
  const topAssister = squad.length > 0 ? getTopAssister(squad) : null;

  return (
    <Card className={`${teamColor} border transition-all duration-300 hover:shadow-md w-full`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Users className="h-5 w-5 flex-shrink-0" />
            <span className="truncate text-foreground">{team.name} Squad</span>
          </div>
          <Badge variant="outline" className="flex-shrink-0">
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
                <AccordionItem key={position} value={position} className="w-full border-border/30">
                  <AccordionTrigger className="hover:no-underline w-full py-3">
                    <div className="flex items-center gap-2 w-full">
                      {getPositionIcon(position)}
                      <span className="font-medium truncate flex-1 text-left text-foreground">{position}s</span>
                      <Badge variant="secondary" className="ml-auto mr-2 flex-shrink-0">
                        {players.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 w-full">
                    <div className={`p-3 rounded-lg ${getPositionColor(position)} mb-3 border`}>
                      <p className="text-sm font-medium">{position} Squad</p>
                    </div>
                    <div className="space-y-2 w-full">
                      {players.map((player) => (
                        <SquadPlayerCard 
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

export default TeamSquadSection;
