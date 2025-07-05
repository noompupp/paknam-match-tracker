
import EnhancedMatchSummary from "../../EnhancedMatchSummary";
import MatchEvents from "../../MatchEvents";
import ManualEventForm from "../ManualEventForm";
import EventManagementList from "../EventManagementList";
import EditEventModal from "../EditEventModal";
import { ComponentPlayer } from "../../hooks/useRefereeState";
import { useDataValidation } from "@/hooks/useDataValidation";
import UnifiedMatchTimer from "../UnifiedMatchTimer";
import { useMatchStore } from "@/stores/useMatchStore";
import { useMatchEvents } from "@/hooks/useMatchEvents";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MatchEvent } from "@/types/database";

interface SummaryTabProps {
  selectedFixtureData: any;
  matchTime: number;
  events: any[];
  goals: any[];
  cards: any[];
  trackedPlayers: any[];
  allPlayers: ComponentPlayer[];
  onExportSummary: () => void;
  formatTime: (seconds: number) => string;
  resetState?: {
    shouldUseLocalState: () => boolean;
    isInFreshResetState: () => boolean;
    lastResetTimestamp: string | null;
  };
}

const SummaryTab = ({
  selectedFixtureData,
  matchTime,
  events,
  goals,
  cards,
  trackedPlayers,
  allPlayers,
  onExportSummary,
  formatTime,
  resetState,
  onToggleTimer,
  onResetMatch,
  isRunning
}: SummaryTabProps & {
  onToggleTimer?: () => void;
  onResetMatch?: () => void;
  isRunning?: boolean;
}) => {
  // Add data validation for this component
  useDataValidation({
    componentName: 'SummaryTab',
    goals,
    cards,
    enabled: true
  });

  // Get live scores from match store (local state is prioritized after reset)
  const { homeScore, awayScore } = useMatchStore();
  
  // Fetch match events for management with error handling
  const { data: matchEvents = [], refetch: refetchEvents, isLoading: eventsLoading, error: eventsError } = useMatchEvents(selectedFixtureData?.id);
  const [editingEvent, setEditingEvent] = useState<MatchEvent | null>(null);

  // Enhanced debugging for team and player data
  console.log('🏟️ SummaryTab - Data Debug:', {
    selectedFixture: selectedFixtureData?.id,
    homeTeamId: selectedFixtureData?.home_team_id,
    awayTeamId: selectedFixtureData?.away_team_id,
    allPlayersCount: allPlayers?.length || 0,
    matchEventsCount: matchEvents.length,
    eventsLoading,
    eventsError: eventsError?.message
  });

  const handleEditEvent = (event: MatchEvent) => {
    setEditingEvent(event);
  };

  const handleCloseEditModal = () => {
    setEditingEvent(null);
    refetchEvents(); // Refresh events after editing
  };

  // Enhanced validation for event management
  const canManageEvents = useMemo(() => {
    const hasFixture = selectedFixtureData?.id;
    const hasTeams = selectedFixtureData?.home_team_id && selectedFixtureData?.away_team_id;
    const hasPlayers = allPlayers && allPlayers.length > 0;
    
    console.log('🔍 SummaryTab - Event Management Check:', {
      hasFixture,
      hasTeams,
      hasPlayers,
      canManage: hasFixture && hasTeams && hasPlayers
    });
    
    return hasFixture && hasTeams && hasPlayers;
  }, [selectedFixtureData, allPlayers]);

  return (
    <div className="space-y-6">
      {/* Enhanced Match Summary */}
      <EnhancedMatchSummary
        selectedFixtureData={selectedFixtureData}
        homeScore={homeScore}
        awayScore={awayScore}
        matchTime={matchTime}
        events={events}
        goals={goals}
        cards={cards}
        trackedPlayers={trackedPlayers}
        allPlayers={allPlayers}
        onExportSummary={onExportSummary}
        formatTime={formatTime}
        resetState={resetState}
      />

      <Separator />

      {/* Manual Event Management Section */}
      {canManageEvents ? (
        <Card>
          <CardHeader>
            <CardTitle>Event Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Event Form */}
            <ManualEventForm
              fixtureId={selectedFixtureData.id}
              matchTime={matchTime}
              formatTime={formatTime}
              homeTeamId={selectedFixtureData.home_team_id}
              awayTeamId={selectedFixtureData.away_team_id}
              allPlayers={allPlayers}
            />

            <Separator />

            {/* Event Management List */}
            {eventsLoading ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Loading match events...
                </CardContent>
              </Card>
            ) : eventsError ? (
              <Card>
                <CardContent className="p-6 text-center text-destructive">
                  Error loading events: {eventsError.message}
                </CardContent>
              </Card>
            ) : (
              <EventManagementList
                events={matchEvents}
                formatTime={formatTime}
                onEditEvent={handleEditEvent}
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Event Management</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center text-muted-foreground">
            {!selectedFixtureData?.id && "Please select a fixture to manage events"}
            {selectedFixtureData?.id && (!selectedFixtureData.home_team_id || !selectedFixtureData.away_team_id) && "Fixture missing team information"}
            {selectedFixtureData?.id && selectedFixtureData.home_team_id && selectedFixtureData.away_team_id && (!allPlayers || allPlayers.length === 0) && "No player data available"}
          </CardContent>
        </Card>
      )}

      <Separator />
      
      {/* Traditional Match Events Display */}
      <MatchEvents
        events={events}
        formatTime={formatTime}
      />

      {/* Edit Event Modal */}
      {canManageEvents && (
        <EditEventModal
          event={editingEvent}
          isOpen={!!editingEvent}
          onClose={handleCloseEditModal}
          formatTime={formatTime}
          homeTeamId={selectedFixtureData.home_team_id}
          awayTeamId={selectedFixtureData.away_team_id}
          allPlayers={allPlayers}
        />
      )}
    </div>
  );
};

export default SummaryTab;
