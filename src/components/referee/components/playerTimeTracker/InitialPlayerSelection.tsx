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

  const getAvailablePlayers = () => {
    if (selectedTeam === 'home') return homeTeamPlayers;
    if (selectedTeam === 'away') return awayTeamPlayers;
    return [];
  };

  const availablePlayers = getAvailablePlayers();
  const isValidSelection = selectedPlayerIds.size === REQUIRED_PLAYERS;

  const handlePlayerToggle = (playerId: number, checked: boolean) => {
    setSelectedPlayerIds((prev) => {
      const newSelected = new Set(prev);
      if (checked && newSelected.size < REQUIRED_PLAYERS) {
        newSelected.add(playerId);
      } else if (!checked) {
        newSelected.delete(playerId);
      }
      return newSelected;
    });
  };

  const handleStartMatch = () => {
    if (!selectedTeam || !isValidSelection) return;

    const selectedPlayers = availablePlayers.filter(player =>
      selectedPlayerIds.has(player.id)
    );

    onStartMatch(selectedPlayers, selectedTeam);

    // Reset state
    setSelectedTeam(null);
    setSelectedPlayerIds(new Set());
    onClose();
  };

  const handleCancel = () => {
    setSelectedTeam(null);
    setSelectedPlayerIds(new Set());
    onClose();
  };

  const getTeamName = (team: 'home' | 'away') => {
    if (team === 'home') return selectedFixtureData?.home_team?.name || t('referee.homeTeam');
    return selectedFixtureData?.away_team?.name || t('referee.awayTeam');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="w-full max-w-2xl h-[90vh] max-h-[90vh] overflow-hidden flex flex-col p-0 sm:p-6 sm:h-auto sm:max-h-[80vh]">
        <DialogHeader className="p-4 sm:p-0 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {t('referee.startingSquadTitle').replace('{count}', String(REQUIRED_PLAYERS))}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col px-4 sm:px-0">
          {!selectedTeam ? (
            <TeamSelectionPanel
              homeTeamPlayers={homeTeamPlayers}
              awayTeamPlayers={awayTeamPlayers}
              getTeamName={getTeamName}
              onSelect={setSelectedTeam}
            />
          ) : (
            <PlayerSelectionPanel
              teamName={getTeamName(selectedTeam)}
              players={availablePlayers}
              selectedPlayerIds={selectedPlayerIds}
              requiredPlayers={REQUIRED_PLAYERS}
              onPlayerToggle={handlePlayerToggle}
              onBack={() => setSelectedTeam(null)}
              onStart={handleStartMatch}
              isValidSelection={isValidSelection}
            />
          )}
        </div>

        {/* Mobile Safe Area Bottom Padding */}
        <div className="h-4 sm:h-0 flex-shrink-0"></div>
      </DialogContent>
    </Dialog>
  );
};

export default InitialPlayerSelection;
