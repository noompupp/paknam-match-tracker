import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Target, Users, AlertTriangle, Save, RotateCcw } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface SummaryTabProps {
  selectedFixtureData: any;
  homeScore: number;
  awayScore: number;
  goals: any[];
  cards: any[];
  trackedPlayers: any[];
  events: any[];
  formatTime: (seconds: number) => string;
  matchTime: number;
  handleSaveMatch: () => void;
  saveAttempts: number;
  handleResetMatch: () => void;
  allPlayers: any[];
  playerHalfTimes?: Map<number, { firstHalf: number; secondHalf: number }>; // FIXED: Add this prop
}

const SummaryTab = ({
  selectedFixtureData,
  homeScore,
  awayScore,
  goals,
  cards,
  trackedPlayers,
  events,
  formatTime,
  matchTime,
  handleSaveMatch,
  saveAttempts,
  handleResetMatch,
  allPlayers,
  playerHalfTimes = new Map() // FIXED: Add this prop with default
}: SummaryTabProps) => {
  const { t } = useTranslation();

  const homeTeamName = selectedFixtureData?.home_team?.name || selectedFixtureData?.team1 || "Home";
  const awayTeamName = selectedFixtureData?.away_team?.name || selectedFixtureData?.team2 || "Away";

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-center">
            <div className="flex items-center justify-center gap-4">
              <span className="text-lg font-bold">{homeTeamName}</span>
              <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
                <span className="text-2xl font-bold">{homeScore}</span>
                <span className="text-muted-foreground">-</span>
                <span className="text-2xl font-bold">{awayScore}</span>
              </div>
              <span className="text-lg font-bold">{awayTeamName}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatTime(matchTime)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-5 w-5 text-green-600" />
              <span className="font-semibold">{t("referee.summary.goals", "Goals")}</span>
            </div>
            <div className="text-2xl font-bold">{goals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold">{t("referee.summary.cards", "Cards")}</span>
            </div>
            <div className="text-2xl font-bold">{cards.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">{t("referee.summary.players", "Players")}</span>
            </div>
            <div className="text-2xl font-bold">{trackedPlayers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="font-semibold">{t("referee.summary.events", "Events")}</span>
            </div>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Button onClick={handleSaveMatch} size="lg" className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {t("referee.action.saveMatch", "Save Match")}
          {saveAttempts > 0 && (
            <Badge variant="secondary" className="ml-2">
              {saveAttempts}
            </Badge>
          )}
        </Button>
        
        <Button variant="outline" onClick={handleResetMatch} size="lg" className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          {t("referee.action.resetMatch", "Reset Match")}
        </Button>
      </div>
    </div>
  );
};

export default SummaryTab;
