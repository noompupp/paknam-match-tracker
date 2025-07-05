import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Settings, Users, Award, RefreshCw, Calendar, Play, Save } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useLatestCompleteFixtures } from "@/hooks/useLatestCompleteFixtures";
import { useHybridPlayerRatings, useApprovedPlayerRatings } from "@/hooks/useHybridPlayerRatings";
import { selectTeamOfTheWeek, selectCaptainOfTheWeek, type TeamOfTheWeekPlayer, type CaptainOfTheWeekPlayer } from "@/utils/teamOfTheWeekSelection";
import { useCurrentWeeklyTOTW, useWeeklyPlayerPerformance, useGenerateWeeklyTOTW, useUpdateWeeklyTOTW } from "@/hooks/useWeeklyTOTW";
import { useToast } from "@/hooks/use-toast";
import TeamOfTheWeekDisplay from "./TeamOfTheWeekDisplay";
import ManualTOTWSelection from "./ManualTOTWSelection";

const TeamOfTheWeekPage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'weekly' | 'fixture'>('weekly');
  const [manualMode, setManualMode] = useState(false);

  // Weekly TOTW hooks
  const { data: currentWeeklyTOTW, isLoading: loadingWeekly } = useCurrentWeeklyTOTW();
  const { data: weeklyPerformance } = useWeeklyPlayerPerformance(currentWeeklyTOTW?.id);
  const generateWeeklyTOTW = useGenerateWeeklyTOTW();
  const updateWeeklyTOTW = useUpdateWeeklyTOTW();

  // Fixture-based fallback
  const { data: fixtures } = useLatestCompleteFixtures();
  const [selectedFixtureId, setSelectedFixtureId] = useState<number | null>(null);
  const currentFixture = fixtures?.[0] || null;
  const activeFixtureId = selectedFixtureId || currentFixture?.id || null;

  const { data: hybridRatings } = useHybridPlayerRatings(activeFixtureId);
  const { data: approvedRatings } = useApprovedPlayerRatings(activeFixtureId);

  // Calculate automatic TOTW from fixture data (fallback)
  const approvedMap = new Map(
    (approvedRatings || []).map(rating => [rating.player_id, rating])
  );

  const approvedPlayerRatings = (hybridRatings || []).filter(rating => 
    approvedMap.has(rating.player_id)
  );

  const automaticTOTW = selectTeamOfTheWeek(approvedPlayerRatings, approvedMap);
  const automaticCaptain = selectCaptainOfTheWeek(approvedPlayerRatings, approvedMap, automaticTOTW);

  // State for manual selections
  const [manualTOTW, setManualTOTW] = useState<TeamOfTheWeekPlayer[]>([]);
  const [manualCaptain, setManualCaptain] = useState<CaptainOfTheWeekPlayer | null>(null);

  // Initialize manual selections when switching modes or data changes
  useEffect(() => {
    if (viewMode === 'weekly' && currentWeeklyTOTW?.team_of_the_week) {
      setManualTOTW(currentWeeklyTOTW.team_of_the_week || []);
      setManualCaptain(currentWeeklyTOTW.captain_of_the_week || null);
    } else if (viewMode === 'fixture') {
      setManualTOTW(automaticTOTW);
      setManualCaptain(automaticCaptain);
    }
  }, [currentWeeklyTOTW, automaticTOTW, automaticCaptain, viewMode]);

  const handleGenerateWeeklyTOTW = async () => {
    try {
      await generateWeeklyTOTW.mutateAsync({});
      toast({
        title: "Weekly TOTW Generated",
        description: "Successfully generated this week's Team of the Week",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate weekly TOTW",
        variant: "destructive",
      });
    }
  };

  const handleSaveManualTOTW = async () => {
    if (!currentWeeklyTOTW?.id) return;

    try {
      await updateWeeklyTOTW.mutateAsync({
        id: currentWeeklyTOTW.id,
        team_of_the_week: manualTOTW,
        captain_of_the_week: manualCaptain,
        selection_method: 'manual',
      });
      toast({
        title: "TOTW Saved",
        description: "Manual Team of the Week selection saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save manual TOTW selection",
        variant: "destructive",
      });
    }
  };

  const handleFixtureChange = (fixtureId: number) => {
    setSelectedFixtureId(fixtureId);
    setManualMode(false);
  };

  const handleManualSelection = (totw: TeamOfTheWeekPlayer[], captain: CaptainOfTheWeekPlayer | null) => {
    setManualTOTW(totw);
    setManualCaptain(captain);
  };

  const handleToggleMode = () => {
    setManualMode(!manualMode);
  };

  // Determine what to display based on view mode and data availability
  const getDisplayData = () => {
    if (viewMode === 'weekly') {
      if (manualMode) {
        return { totw: manualTOTW, captain: manualCaptain };
      }
      return {
        totw: currentWeeklyTOTW?.team_of_the_week || [],
        captain: currentWeeklyTOTW?.captain_of_the_week || null
      };
    } else {
      return {
        totw: manualMode ? manualTOTW : automaticTOTW,
        captain: manualMode ? manualCaptain : automaticCaptain
      };
    }
  };

  const { totw: displayTOTW, captain: displayCaptain } = getDisplayData();

  if (loadingWeekly) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="py-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading Team of the Week...</p>
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
        
        <div className="flex flex-col sm:flex-row gap-2">
          {/* View Mode Toggle */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant={viewMode === 'weekly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('weekly')}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Weekly
            </Button>
            <Button
              variant={viewMode === 'fixture' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('fixture')}
              className="flex items-center gap-2"
            >
              <Trophy className="h-4 w-4" />
              By Fixture
            </Button>
          </div>

          {/* Weekly Controls */}
          {viewMode === 'weekly' && (
            <div className="flex gap-2">
              {!currentWeeklyTOTW && (
                <Button
                  onClick={handleGenerateWeeklyTOTW}
                  disabled={generateWeeklyTOTW.isPending}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  {generateWeeklyTOTW.isPending ? 'Generating...' : 'Generate Weekly TOTW'}
                </Button>
              )}
              {manualMode && currentWeeklyTOTW && (
                <Button
                  onClick={handleSaveManualTOTW}
                  disabled={updateWeeklyTOTW.isPending}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {updateWeeklyTOTW.isPending ? 'Saving...' : 'Save Manual TOTW'}
                </Button>
              )}
            </div>
          )}

          {/* Fixture Controls */}
          {viewMode === 'fixture' && fixtures && fixtures.length > 1 && (
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

      {/* Weekly Status */}
      {viewMode === 'weekly' && (
        <Card className="border-l-4 border-l-purple-500 bg-purple-50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-800">
                  {currentWeeklyTOTW ? 'Current Week TOTW' : 'No Weekly TOTW Generated'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {currentWeeklyTOTW && (
                  <>
                    <Badge variant="outline">
                      {currentWeeklyTOTW.selection_method}
                    </Badge>
                    <Badge variant={currentWeeklyTOTW.is_finalized ? "default" : "secondary"}>
                      {currentWeeklyTOTW.is_finalized ? 'Finalized' : 'Draft'}
                    </Badge>
                  </>
                )}
                {weeklyPerformance && (
                  <Badge variant="secondary">
                    {weeklyPerformance.length} players analyzed
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              {viewMode === 'weekly' ? 
                (weeklyPerformance?.length || 0) : 
                approvedPlayerRatings.length
              } players available
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
              fixtureId={viewMode === 'fixture' ? activeFixtureId : null}
              onSelectionChange={handleManualSelection}
              initialTOTW={manualTOTW}
              initialCaptain={manualCaptain}
            />
          )}
        </TabsContent>

        <TabsContent value="ratings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {viewMode === 'weekly' ? 'Weekly Player Performance' : 'All Player Ratings'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {viewMode === 'weekly' ? (
                  weeklyPerformance && weeklyPerformance.length > 0 ? (
                    <div className="space-y-2">
                      {weeklyPerformance
                        .sort((a, b) => b.weighted_final_rating - a.weighted_final_rating)
                        .map((player, index) => (
                          <div key={player.player_id} className="flex items-center justify-between py-2 px-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="w-8 text-center">
                                #{index + 1}
                              </Badge>
                              <div>
                                <div className="font-medium">{player.player_name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {player.team_name} • {player.position} • {player.matches_played} matches
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">
                                {player.weighted_final_rating.toFixed(2)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {player.total_minutes} mins
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No weekly performance data available
                    </p>
                  )
                ) : (
                  approvedPlayerRatings.length === 0 ? (
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
                  )
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