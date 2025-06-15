
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, HomeIcon, Users2 } from "lucide-react";

interface TeamSelectionPanelProps {
  homeTeamPlayers: { length: number };
  awayTeamPlayers: { length: number };
  getTeamName: (team: 'home' | 'away') => string;
  onSelect: (team: 'home' | 'away') => void;
}

const TeamSelectionPanel = ({
  homeTeamPlayers,
  awayTeamPlayers,
  getTeamName,
  onSelect,
}: TeamSelectionPanelProps) => (
  <div className="space-y-4 flex-1 flex flex-col justify-center">
    <Alert>
      <Users className="h-4 w-4" />
      <AlertDescription>
        Choose which team you want to track playing time for during this match.
      </AlertDescription>
    </Alert>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Button
        variant="outline"
        onClick={() => onSelect('home')}
        className="h-20 flex flex-col items-center gap-2"
        disabled={homeTeamPlayers.length === 0}
      >
        <HomeIcon className="h-6 w-6" />
        <div className="text-center">
          <div className="font-semibold">{getTeamName('home')}</div>
          <div className="text-sm text-muted-foreground">
            {homeTeamPlayers.length} players available
          </div>
        </div>
      </Button>

      <Button
        variant="outline"
        onClick={() => onSelect('away')}
        className="h-20 flex flex-col items-center gap-2"
        disabled={awayTeamPlayers.length === 0}
      >
        <Users2 className="h-6 w-6" />
        <div className="text-center">
          <div className="font-semibold">{getTeamName('away')}</div>
          <div className="text-sm text-muted-foreground">
            {awayTeamPlayers.length} players available
          </div>
        </div>
      </Button>
    </div>
  </div>
);

export default TeamSelectionPanel;

