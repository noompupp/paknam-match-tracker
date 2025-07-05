import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Settings, Users, Award, RefreshCw } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLatestCompleteFixtures } from "@/hooks/useLatestCompleteFixtures";
import { useHybridPlayerRatings, useApprovedPlayerRatings } from "@/hooks/useHybridPlayerRatings";
import { selectTeamOfTheWeek, selectCaptainOfTheWeek } from "@/utils/teamOfTheWeekSelection";
import TeamOfTheWeekDisplay from "./TeamOfTheWeekDisplay";
import ManualTOTWSelection from "./ManualTOTWSelection";

const TeamOfTheWeekPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedFixtureId, setSelectedFixtureId] = useState<number | null>(null);
  const [manualMode, setManualMode] = useState(false);
  
  const { data: fixtures } = useLatestCompleteFixtures();
  const currentFixture = fixtures?.[0] || null;
  
  // Use selected fixture or default to most recent
  const activeFixtureId = selectedFixtureId || currentFixture?.id || null;
  
  const { data: hybridRatings } = useHybridPlayerRatings(activeFixtureId);
  const { data: approvedRatings } = useApprovedPlayerRatings(activeFixtureId);

  // Calculate automatic TOTW
  const approvedMap = new Map(
    (approvedRatings || []).map(rating => [rating.player_id, rating])
  );

  const approvedPlayerRatings = (hybridRatings || []).filter(rating => 
    approvedMap.has(rating.player_id)
  );

  const automaticTOTW = selectTeamOfTheWeek(approvedPlayerRatings, approvedMap);
  const automaticCaptain = selectCaptainOfTheWeek(approvedPlayerRatings, approvedMap, automaticTOTW);

  // State for manual selections
  const [manualTOTW, setManualTOTW] = useState(automaticTOTW);
  const [manualCaptain, setManualCaptain] = useState(automaticCaptain);

  const handleFixtureChange = (fixtureId: number) => {
    setSelectedFixtureId(fixtureId);
    setManualMode(false); // Reset to automatic when changing fixtures
  };

  const handleToggleMode = () => {
    if (!manualMode) {
      // Switching to manual mode - initialize with automatic selections
      setManualTOTW(automaticTOTW);
      setManualCaptain(automaticCaptain);
    }
    setManualMode(!manualMode);
  };

  const displayTOTW = manualMode ? manualTOTW : automaticTOTW;
  const displayCaptain = manualMode ? manualCaptain : automaticCaptain;

  if (!fixtures || fixtures.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="py-8 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No completed fixtures available for Team of the Week selection
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-600" />
            {t("rating.teamOfTheWeek")} Manager
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and customize Team of the Week selections
          </p>
        </div>
        
        <div className="flex gap-2">
          {fixtures.length > 1 && (
            <select 
              value={activeFixtureId || ''}
              onChange={(e) => handleFixtureChange(Number(e.target.value))}
              className="px-3 py-2 border rounded-md bg-background"
            >
              {fixtures.slice(0, 5).map(fixture => (
                <option key={fixture.id} value={fixture.id}>
                  {fixture.home_team?.name || fixture.home_team_name || 'Home'} vs {fixture.away_team?.name || fixture.away_team_name || 'Away'}
                  {fixture.match_date && ` - ${new Date(fixture.match_date).toLocaleDateString()}`}
                </option>
              ))}
            </select>
          )}
          
          <Button
            variant={manualMode ? "default" : "outline"}
            onClick={handleToggleMode}
            className="flex items-center gap-2"
          >
            {manualMode ? <Settings className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
            {manualMode ? 'Manual Mode' : 'Automatic Mode'}
          </Button>
        </div>
      </div>

      {/* Mode Indicator */}
      <Card className={`border-l-4 ${manualMode ? 'border-l-blue-500 bg-blue-50' : 'border-l-green-500 bg-green-50'}`}>
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {manualMode ? (
                <>
                  <Settings className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Manual Selection Mode</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Automatic Selection Mode</span>
                </>
              )}
            </div>
            <Badge variant={manualMode ? "default" : "secondary"}>
              {approvedPlayerRatings.length} approved ratings available
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="display" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="display" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Display
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2" disabled={!manualMode}>
            <Settings className="h-4 w-4" />
            Manage Selection
          </TabsTrigger>
          <TabsTrigger value="ratings" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            All Ratings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="display" className="space-y-6">
          <TeamOfTheWeekDisplay 
            teamOfTheWeek={displayTOTW}
            captainOfTheWeek={displayCaptain}
          />
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          {manualMode && (
            <ManualTOTWSelection
              availablePlayers={approvedPlayerRatings}
              approvedMap={approvedMap}
              currentTOTW={manualTOTW}
              currentCaptain={manualCaptain}
              onTOTWChange={setManualTOTW}
              onCaptainChange={setManualCaptain}
            />
          )}
        </TabsContent>

        <TabsContent value="ratings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Player Ratings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {approvedPlayerRatings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No approved ratings available for this fixture
                  </p>
                ) : (
                  <div className="space-y-2">
                    {approvedPlayerRatings
                      .sort((a, b) => b.rating_data.final_rating - a.rating_data.final_rating)
                      .map((player, index) => (
                        <div key={player.player_id} className="flex items-center justify-between py-2 px-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="w-8 text-center">
                              #{index + 1}
                            </Badge>
                            <div>
                              <div className="font-medium">{player.player_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {player.team_name} • {player.position}
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary" className="font-bold">
                            {player.rating_data.final_rating.toFixed(2)}
                          </Badge>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamOfTheWeekPage;