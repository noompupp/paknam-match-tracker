
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Fixture } from "@/types/database";

interface CardData {
  id: number;
  player: string;
  team: string;
  type: 'yellow' | 'red';
  time: number;
}

interface CardManagementProps {
  selectedFixtureData: Fixture;
  playerName: string;
  selectedTeam: string;
  cards: CardData[];
  onPlayerNameChange: (value: string) => void;
  onTeamChange: (team: string) => void;
  onAddCard: (type: 'yellow' | 'red') => void;
  formatTime: (seconds: number) => string;
}

const CardManagement = ({
  selectedFixtureData,
  playerName,
  selectedTeam,
  cards,
  onPlayerNameChange,
  onTeamChange,
  onAddCard,
  formatTime
}: CardManagementProps) => {
  return (
    <Card className="card-shadow-lg">
      <CardHeader>
        <CardTitle>Cards & Fouls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <Label htmlFor="player">Player Name</Label>
            <Input
              id="player"
              value={playerName}
              onChange={(e) => onPlayerNameChange(e.target.value)}
              placeholder="Enter player name"
            />
          </div>
          
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

          <div className="flex gap-2">
            <Button
              onClick={() => onAddCard('yellow')}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600"
              disabled={!playerName.trim()}
            >
              Yellow Card
            </Button>
            <Button
              onClick={() => onAddCard('red')}
              className="flex-1 bg-red-500 hover:bg-red-600"
              disabled={!playerName.trim()}
            >
              Red Card
            </Button>
          </div>
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

export default CardManagement;
