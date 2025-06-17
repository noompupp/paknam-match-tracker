
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { ProcessedPlayer } from "@/utils/refereeDataProcessor";
import { useTranslation } from "@/hooks/useTranslation";

interface TeamSelectionPanelProps {
  homeTeamPlayers: ProcessedPlayer[];
  awayTeamPlayers: ProcessedPlayer[];
  getTeamName: (team: 'home' | 'away') => string;
  onSelect: (team: 'home' | 'away') => void;
}

const TeamSelectionPanel = ({
  homeTeamPlayers,
  awayTeamPlayers,
  getTeamName,
  onSelect
}: TeamSelectionPanelProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          {t('referee.selectTeam', 'Select Team')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('referee.selectTeamDesc', 'Choose which team to start with')}
        </p>
      </div>

      <div className="grid gap-4">
        {/* Home Team Card */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <Button
              variant="ghost"
              className="w-full h-auto p-0"
              onClick={() => onSelect('home')}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">{getTeamName('home')}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('referee.homeTeam', 'Home Team')}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">
                  {homeTeamPlayers.length} {t('referee.players', 'players')}
                </Badge>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Away Team Card */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <Button
              variant="ghost"
              className="w-full h-auto p-0"
              onClick={() => onSelect('away')}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">{getTeamName('away')}</div>
                    <div className="text-sm text-muted-foreground">
                      {t('referee.awayTeam', 'Away Team')}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">
                  {awayTeamPlayers.length} {t('referee.players', 'players')}
                </Badge>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamSelectionPanel;
