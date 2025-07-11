
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Fixture } from "@/types/database";
import { debugPlayerDropdownData, ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { EnhancedRefereeSelect, EnhancedRefereeSelectContent, EnhancedRefereeSelectItem } from "@/components/ui/enhanced-referee-select";

interface CardData {
  id: number;
  player: string;
  team: string;
  type: 'yellow' | 'red';
  time: number;
}

interface CardManagementDropdownProps {
  selectedFixtureData: Fixture;
  allPlayers: ProcessedPlayer[];
  homeTeamPlayers?: ProcessedPlayer[];
  awayTeamPlayers?: ProcessedPlayer[];
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
  homeTeamPlayers,
  awayTeamPlayers,
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
  console.log('🟨 CardManagementDropdown Debug:');
  console.log('  - All players available:', allPlayers.length);
  console.log('  - Home team players:', homeTeamPlayers?.length || 0);
  console.log('  - Away team players:', awayTeamPlayers?.length || 0);
  console.log('  - Selected team:', selectedTeam);
  console.log('  - Selected fixture data:', selectedFixtureData);
  
  // Early return if no fixture data is available
  if (!selectedFixtureData) {
    return (
      <Card className="card-shadow-lg">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>Please select a fixture to manage cards</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use filtered players when available, otherwise filter from all players
  let teamPlayers: ProcessedPlayer[] = [];
  
  if (selectedTeam === 'home') {
    teamPlayers = homeTeamPlayers || allPlayers.filter(player => 
      player.team === selectedFixtureData.home_team?.name
    );
    console.log(`  - Home team (${selectedFixtureData.home_team?.name || 'Unknown'}) players:`, teamPlayers.length);
  } else if (selectedTeam === 'away') {
    teamPlayers = awayTeamPlayers || allPlayers.filter(player => 
      player.team === selectedFixtureData.away_team?.name
    );
    console.log(`  - Away team (${selectedFixtureData.away_team?.name || 'Unknown'}) players:`, teamPlayers.length);
  }
  
  // Debug filtered players
  debugPlayerDropdownData(teamPlayers, `Card Management - ${selectedTeam} team (Filtered)`);

  const selectedPlayerData = teamPlayers.find(p => p.id.toString() === selectedPlayer) || 
                           allPlayers.find(p => p.id.toString() === selectedPlayer);

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
                className="flex-1"
              >
                {selectedFixtureData.home_team?.name || 'Home Team'}
                <span className="ml-2 text-xs">
                  ({homeTeamPlayers?.length || allPlayers.filter(p => p.team === selectedFixtureData.home_team?.name).length})
                </span>
              </Button>
              <Button
                size="sm"
                variant={selectedTeam === 'away' ? 'default' : 'outline'}
                onClick={() => onTeamChange('away')}
                className="flex-1"
              >
                {selectedFixtureData.away_team?.name || 'Away Team'}
                <span className="ml-2 text-xs">
                  ({awayTeamPlayers?.length || allPlayers.filter(p => p.team === selectedFixtureData.away_team?.name).length})
                </span>
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="player">Select Player</Label>
            <EnhancedRefereeSelect 
              value={selectedPlayer} 
              onValueChange={onPlayerSelect}
              placeholder={
                !selectedTeam 
                  ? "Select a team first" 
                  : teamPlayers.length > 0 
                    ? "Choose a player" 
                    : "No players in selected team"
              }
              disabled={!selectedTeam || teamPlayers.length === 0}
            >
              <EnhancedRefereeSelectContent>
                {!selectedTeam ? (
                  <EnhancedRefereeSelectItem value="no-team" disabled>
                    Please select a team first
                  </EnhancedRefereeSelectItem>
                ) : teamPlayers.length === 0 ? (
                  <EnhancedRefereeSelectItem value="no-players" disabled>
                    No players found for {selectedTeam} team
                  </EnhancedRefereeSelectItem>
                ) : (
                  teamPlayers.map((player) => (
                    <EnhancedRefereeSelectItem 
                      key={`card-player-${player.id}`} 
                      value={player.id.toString()}
                      playerData={{
                        name: player.name,
                        team: player.team,
                        number: player.number || '?',
                        position: player.position
                      }}
                    >
                      {player.name}
                    </EnhancedRefereeSelectItem>
                  ))
                )}
              </EnhancedRefereeSelectContent>
            </EnhancedRefereeSelect>
            {selectedTeam && teamPlayers.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                ⚠️ No players found for {selectedTeam} team. Check team data.
              </p>
            )}
          </div>

          <div>
            <Label>Card Type</Label>
            <div className="flex gap-2 mt-1">
              <Button
                size="sm"
                variant={selectedCardType === 'yellow' ? 'default' : 'outline'}
                className={selectedCardType === 'yellow' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'hover:bg-yellow-50'}
                onClick={() => onCardTypeChange('yellow')}
              >
                Yellow Card
              </Button>
              <Button
                size="sm"
                variant={selectedCardType === 'red' ? 'default' : 'outline'}
                className={selectedCardType === 'red' ? 'bg-red-500 hover:bg-red-600 text-white' : 'hover:bg-red-50'}
                onClick={() => onCardTypeChange('red')}
              >
                Red Card
              </Button>
            </div>
          </div>

          <Button
            onClick={onAddCard}
            className="w-full"
            disabled={!selectedPlayer || !selectedTeam}
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
