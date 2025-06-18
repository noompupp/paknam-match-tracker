
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import TeamSelectionPanel from "./TeamSelectionPanel";
import PlayerSelectionPanel from "./PlayerSelectionPanel";
import { useTranslation } from "@/hooks/useTranslation";

interface InitialPlayerSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  homeTeamPlayers: ProcessedPlayer[];
  awayTeamPlayers: ProcessedPlayer[];
  onStartMatch: (selectedPlayers: ProcessedPlayer[], team: 'home' | 'away') => void;
  selectedFixtureData: any;
}

const InitialPlayerSelection = ({
  isOpen,
  onClose,
  homeTeamPlayers,
  awayTeamPlayers,
  onStartMatch,
  selectedFixtureData
}: InitialPlayerSelectionProps) => {
  const { t } = useTranslation();
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | null>(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<number>>(new Set());

  const REQUIRED_PLAYERS = 7;

  console.log('🎯 InitialPlayerSelection Debug:', {
    isOpen,
    selectedTeam,
    selectedPlayerIds: Array.from(selectedPlayerIds),
    homePlayersCount: homeTeamPlayers.length,
    awayPlayersCount: awayTeamPlayers.length,
    requiredPlayers: REQUIRED_PLAYERS
  });

  const getAvailablePlayers = () => {
    if (selectedTeam === 'home') return homeTeamPlayers;
    if (selectedTeam === 'away') return awayTeamPlayers;
    return [];
  };

  const availablePlayers = getAvailablePlayers();
  const isValidSelection = selectedPlayerIds.size === REQUIRED_PLAYERS;

  const handlePlayerToggle = (playerId: number, checked: boolean) => {
    console.log('🔄 InitialPlayerSelection: Player toggle:', { playerId, checked });
    
    setSelectedPlayerIds((prev) => {
      const newSelected = new Set(prev);
      if (checked && newSelected.size < REQUIRED_PLAYERS) {
        newSelected.add(playerId);
        console.log('✅ Added player to selection:', playerId);
      } else if (!checked) {
        newSelected.delete(playerId);
        console.log('➖ Removed player from selection:', playerId);
      } else {
        console.log('⚠️ Cannot add player - limit reached');
      }
      
      console.log('📊 Current selection count:', newSelected.size);
      return newSelected;
    });
  };

  const handleStartMatch = () => {
    if (!selectedTeam || !isValidSelection) {
      console.warn('❌ InitialPlayerSelection: Invalid selection state:', {
        selectedTeam,
        isValidSelection,
        selectedCount: selectedPlayerIds.size
      });
      return;
    }

    const selectedPlayers = availablePlayers.filter(player =>
      selectedPlayerIds.has(player.id)
    );

    console.log('🚀 InitialPlayerSelection: Starting match with players:', {
      team: selectedTeam,
      playerCount: selectedPlayers.length,
      players: selectedPlayers.map(p => ({ id: p.id, name: p.name }))
    });

    // Call the onStartMatch callback with the selected players
    onStartMatch(selectedPlayers, selectedTeam);

    // Reset state and close
    handleClose();
  };

  const handleClose = () => {
    console.log('🔄 InitialPlayerSelection: Resetting state and closing');
    setSelectedTeam(null);
    setSelectedPlayerIds(new Set());
    onClose();
  };

  const getTeamName = (team: 'home' | 'away') => {
    if (team === 'home') return selectedFixtureData?.home_team?.name || t('referee.homeTeam');
    return selectedFixtureData?.away_team?.name || t('referee.awayTeam');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-2xl h-[85vh] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {t('referee.startingSquadTitle', 'Select Starting Squad ({count} players)').replace('{count}', String(REQUIRED_PLAYERS))}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 px-6 pb-6">
          {!selectedTeam ? (
            <TeamSelectionPanel
              homeTeamPlayers={homeTeamPlayers}
              awayTeamPlayers={awayTeamPlayers}
              getTeamName={getTeamName}
              onSelect={(team) => {
                console.log('🎯 Team selected:', team);
                setSelectedTeam(team);
              }}
            />
          ) : (
            <PlayerSelectionPanel
              teamName={getTeamName(selectedTeam)}
              players={availablePlayers}
              selectedPlayerIds={selectedPlayerIds}
              requiredPlayers={REQUIRED_PLAYERS}
              onPlayerToggle={handlePlayerToggle}
              onBack={() => {
                console.log('🔙 Back to team selection');
                setSelectedTeam(null);
                setSelectedPlayerIds(new Set());
              }}
              onStart={handleStartMatch}
              isValidSelection={isValidSelection}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InitialPlayerSelection;
