
import { useState } from "react";
import { ComponentPlayer } from "../../../hooks/useRefereeState";
import { quickGoalService } from "@/services/quickGoalService";
import { useToast } from "@/hooks/use-toast";
import GoalsTabScoreDisplay from "./GoalsTabScoreDisplay";
import GoalsTabGoalsList from "./GoalsTabGoalsList";
import GoalsTabWizardHandler from "./GoalsTabWizardHandler";
import GoalsTabModals from "./GoalsTabModals";
import SimplifiedGoalRecording from "./SimplifiedGoalRecording";

interface GoalsTabContainerProps {
  allPlayers: ComponentPlayer[];
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  goals: any[];
  selectedPlayer: string;
  selectedGoalType: 'goal' | 'assist';
  selectedGoalTeam: string;
  matchTime: number;
  onPlayerSelect: (value: string) => void;
  onGoalTypeChange: (value: 'goal' | 'assist') => void;
  onGoalTeamChange: (value: string) => void;
  onAssignGoal: (player: ComponentPlayer) => void;
  formatTime: (seconds: number) => string;
  homeScore: number;
  awayScore: number;
  selectedFixtureData: any;
  forceRefresh?: () => Promise<void>;
}

const GoalsTabContainer = (props: GoalsTabContainerProps) => {
  const [showWizard, setShowWizard] = useState(false);
  const [showQuickGoalSelection, setShowQuickGoalSelection] = useState(false);
  const [showQuickGoalEdit, setShowQuickGoalEdit] = useState(false);
  const [selectedQuickGoal, setSelectedQuickGoal] = useState<any>(null);
  const [wizardInitialTeam, setWizardInitialTeam] = useState<'home' | 'away' | undefined>(undefined);
  const [wizardMode, setWizardMode] = useState<'quick' | 'detailed' | 'assign'>('quick');
  const [isProcessingQuickGoal, setIsProcessingQuickGoal] = useState(false);
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [teamSelectionMode, setTeamSelectionMode] = useState<'quick' | 'detailed'>('quick');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();

  const homeTeamName = props.selectedFixtureData?.home_team?.name || 'Home Team';
  const awayTeamName = props.selectedFixtureData?.away_team?.name || 'Away Team';

  // Use props for scores and calculate unassigned goals from props
  const { homeScore, awayScore } = props;
  const unassignedGoalsCount = props.goals.filter(g => g.playerName === 'Quick Goal').length;

  console.log('📊 GoalsTabContainer: Using props scores:', { homeScore, awayScore, unassignedGoalsCount });

  // Enhanced quick goal handler
  const handleQuickGoal = async (team: 'home' | 'away') => {
    if (!props.selectedFixtureData || isProcessingQuickGoal) return;

    setIsProcessingQuickGoal(true);

    try {
      console.log('⚡ GoalsTabContainer: Adding quick goal for team:', team);
      
      const homeTeamId = props.selectedFixtureData.home_team?.__id__ || props.selectedFixtureData.home_team_id;
      const awayTeamId = props.selectedFixtureData.away_team?.__id__ || props.selectedFixtureData.away_team_id;

      const result = await quickGoalService.addQuickGoal({
        fixtureId: props.selectedFixtureData.id,
        team,
        matchTime: props.matchTime,
        homeTeam: {
          id: homeTeamId,
          name: props.selectedFixtureData.home_team?.name,
          __id__: homeTeamId
        },
        awayTeam: {
          id: awayTeamId,
          name: props.selectedFixtureData.away_team?.name,
          __id__: awayTeamId
        }
      });

      if (result.success) {
        toast({
          title: "⚡ Quick Goal Added!",
          description: `Goal recorded for ${team === 'home' ? homeTeamName : awayTeamName} at ${props.formatTime(props.matchTime)}. Score updated automatically.`,
        });
        
        // Trigger refresh
        setRefreshTrigger(prev => prev + 1);
        
        if (props.forceRefresh) {
          setTimeout(() => {
            props.forceRefresh!();
          }, 300);
        }
      } else {
        toast({
          title: "Quick Goal Failed",
          description: result.error || 'Failed to add quick goal',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ GoalsTabContainer: Error adding quick goal:', error);
      toast({
        title: "Quick Goal Failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessingQuickGoal(false);
    }
  };

  // Handle goal recording - simplified to only show wizard
  const handleRecordGoal = () => {
    setShowWizard(true);
  };

  // Handle team selection from modal
  const handleTeamSelected = (team: 'home' | 'away') => {
    if (teamSelectionMode === 'quick') {
      handleQuickGoal(team);
    } else {
      setWizardInitialTeam(team);
      setShowWizard(true);
    }
  };

  // Handle quick goal selection from modal
  const handleQuickGoalSelected = (goal: any) => {
    console.log('🎯 GoalsTabContainer: Quick goal selected for editing:', goal);
    setSelectedQuickGoal(goal);
    setShowQuickGoalSelection(false);
    setShowQuickGoalEdit(true);
  };

  // Handle quick goal update completion
  const handleQuickGoalUpdated = (updatedGoal: any) => {
    console.log('✅ GoalsTabContainer: Quick goal updated:', updatedGoal);
    
    setRefreshTrigger(prev => prev + 1);
    
    if (props.forceRefresh) {
      setTimeout(() => {
        props.forceRefresh!();
      }, 300);
    }
    
    setShowQuickGoalEdit(false);
    setSelectedQuickGoal(null);
  };

  const handleWizardGoalAssigned = (goalData: {
    player: ComponentPlayer;
    goalType: 'goal' | 'assist';
    team: 'home' | 'away';
    isOwnGoal?: boolean;
    assistPlayer?: ComponentPlayer;
  }) => {
    console.log('🎯 GoalsTabContainer: Goal assigned via wizard:', goalData);
    props.onAssignGoal(goalData.player);
    
    if (goalData.assistPlayer && !goalData.isOwnGoal) {
      setTimeout(() => {
        props.onAssignGoal(goalData.assistPlayer!);
      }, 100);
    }
    
    setRefreshTrigger(prev => prev + 1);
    
    if (props.forceRefresh) {
      setTimeout(() => {
        props.forceRefresh!();
      }, 300);
    }
    
    setShowWizard(false);
    setWizardInitialTeam(undefined);
  };

  return (
    <div className="space-y-6">
      <GoalsTabScoreDisplay
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        homeScore={homeScore}
        awayScore={awayScore}
        matchTime={props.matchTime}
        formatTime={props.formatTime}
      />

      <SimplifiedGoalRecording
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        onRecordGoal={handleRecordGoal}
        isDisabled={false}
      />

      <GoalsTabModals
        showTeamSelection={showTeamSelection}
        showQuickGoalSelection={showQuickGoalSelection}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        goals={props.goals}
        formatTime={props.formatTime}
        onCloseTeamSelection={() => setShowTeamSelection(false)}
        onCloseQuickGoalSelection={() => setShowQuickGoalSelection(false)}
        onTeamSelected={handleTeamSelected}
        onQuickGoalSelected={handleQuickGoalSelected}
      />

      <GoalsTabGoalsList
        goals={props.goals}
        formatTime={props.formatTime}
      />

      <GoalsTabWizardHandler
        showWizard={showWizard}
        showQuickGoalEdit={showQuickGoalEdit}
        selectedQuickGoal={selectedQuickGoal}
        selectedFixtureData={props.selectedFixtureData}
        homeTeamPlayers={props.homeTeamPlayers}
        awayTeamPlayers={props.awayTeamPlayers}
        matchTime={props.matchTime}
        formatTime={props.formatTime}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        onWizardGoalAssigned={handleWizardGoalAssigned}
        onQuickGoalUpdated={handleQuickGoalUpdated}
        onCloseWizard={() => {
          setShowWizard(false);
          setWizardInitialTeam(undefined);
        }}
        onCloseQuickGoalEdit={() => {
          setShowQuickGoalEdit(false);
          setSelectedQuickGoal(null);
        }}
        wizardInitialTeam={wizardInitialTeam}
      />
    </div>
  );
};

export default GoalsTabContainer;
