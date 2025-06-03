import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Fixture } from "@/types/database";

// Define the Player interface to match what's used in the container
interface Player {
  id: number;
  name: string;
  team: string;
  number?: number;
  position?: string;
}

interface CardData {
  id: number;
  player: string;
  team: string;
  type: 'yellow' | 'red';
  time: number;
}

interface CardManagementDropdownProps {
  selectedFixtureData: Fixture;
  allPlayers: Player[];
  selectedPlayer: string;
  selectedTeam: string;
  selectedCardType: 'yellow' | 'red';
  cards: CardData[];
  onPlayerSelect: (playerId: string) => void;
  onTeamChange: (team: string) => void;
  onCardTypeChange: (cardType: 'yellow' | 'red') => void;
  onAddCard: () => void;
  formatTime: (seconds: number) => string;
}

const CardManagementDropdown = ({
  selectedFixtureData,
  allPlayers,
  selectedPlayer,
  selectedTeam,
  selectedCardType,
  cards,
  onPlayerSelect,
  onTeamChange,
  onCardTypeChange,
  onAddCard,
  formatTime
}: CardManagementDropdownProps) => {
  // Filter players by selected team
  const teamPlayers = allPlayers.filter(player => {
    if (selectedTeam === 'home') {
      return player.team === selectedFixtureData.home_team?.name;
    } else {
      return player.team === selectedFixtureData.away_team?.name;
    }
  });

  const selectedPlayerData = allPlayers.find(p => p.id.toString() === selectedPlayer);

  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle>Cards & Fouls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <Label>Team</Label>
            <div className="flex gap-2 mt-1">
              <Button
                size="sm"
                variant={selectedTeam === 'home' ? 'default' : 'outline'}
                onClick={() => onTeamChange('home')}
              >
                {selectedFixtureData.home_team?.name}
              </Button>
              <Button
                size="sm"
                variant={selectedTeam === 'away' ? 'default' : 'outline'}
                onClick={() => onTeamChange('away')}
              >
                {selectedFixtureData.away_team?.name}
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="player">Select Player</Label>
            <Select value={selectedPlayer} onValueChange={onPlayerSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a player" />
              </SelectTrigger>
              <SelectContent>
                {teamPlayers.map((player) => (
                  <SelectItem key={player.id} value={player.id.toString()}>
                    {player.name} {player.number ? `(#${player.number})` : ''} - {player.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Card Type</Label>
            <div className="flex gap-2 mt-1">
              <Button
                size="sm"
                variant={selectedCardType === 'yellow' ? 'default' : 'outline'}
                className={selectedCardType === 'yellow' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                onClick={() => onCardTypeChange('yellow')}
              >
                Yellow Card
              </Button>
              <Button
                size="sm"
                variant={selectedCardType === 'red' ? 'default' : 'outline'}
                className={selectedCardType === 'red' ? 'bg-red-500 hover:bg-red-600' : ''}
                onClick={() => onCardTypeChange('red')}
              >
                Red Card
              </Button>
            </div>
          </div>

          <Button
            onClick={onAddCard}
            className="w-full"
            disabled={!selectedPlayer}
          >
            Issue {selectedCardType === 'yellow' ? 'Yellow' : 'Red'} Card
            {selectedPlayerData && ` to ${selectedPlayerData.name}`}
          </Button>
        </div>

        {cards.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="font-semibold text-sm">Cards Issued</h4>
            {cards.map((card) => (
              <div key={card.id} className="flex items-center justify-between text-sm">
                <span>{card.player} ({card.team})</span>
                <Badge variant={card.type === 'yellow' ? 'outline' : 'destructive'}>
                  {card.type} • {formatTime(card.time)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CardManagementDropdown;
