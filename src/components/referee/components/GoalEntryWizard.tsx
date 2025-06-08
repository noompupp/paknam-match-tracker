
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Users, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { EnhancedRefereeSelect, EnhancedRefereeSelectContent, EnhancedRefereeSelectItem } from "@/components/ui/enhanced-referee-select";
import { ComponentPlayer } from "../hooks/useRefereeState";

interface GoalEntryWizardProps {
  selectedFixtureData: any;
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  matchTime: number;
  formatTime: (seconds: number) => string;
  onGoalAssigned: (goalData: {
    player: ComponentPlayer;
    goalType: 'goal' | 'assist';
    team: 'home' | 'away';
    isOwnGoal?: boolean;
  }) => void;
  onCancel: () => void;
}

type WizardStep = 'team' | 'player' | 'goal-type' | 'assist' | 'confirm';

const GoalEntryWizard = ({
  selectedFixtureData,
  homeTeamPlayers,
  awayTeamPlayers,
  matchTime,
  formatTime,
  onGoalAssigned,
  onCancel
}: GoalEntryWizardProps) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('team');
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | ''>('');
  const [selectedPlayer, setSelectedPlayer] = useState<ComponentPlayer | null>(null);
  const [isOwnGoal, setIsOwnGoal] = useState(false);
  const [needsAssist, setNeedsAssist] = useState(false);
  const [assistPlayer, setAssistPlayer] = useState<ComponentPlayer | null>(null);

  const getTeamPlayers = () => {
    if (selectedTeam === 'home') return homeTeamPlayers || [];
    if (selectedTeam === 'away') return awayTeamPlayers || [];
    return [];
  };

  const getOpposingTeamPlayers = () => {
    if (selectedTeam === 'home') return awayTeamPlayers || [];
    if (selectedTeam === 'away') return homeTeamPlayers || [];
    return [];
  };

  const getTeamName = (team: 'home' | 'away') => {
    if (team === 'home') return selectedFixtureData?.home_team?.name || 'Home Team';
    return selectedFixtureData?.away_team?.name || 'Away Team';
  };

  const handleTeamSelect = (team: 'home' | 'away') => {
    setSelectedTeam(team);
    setSelectedPlayer(null);
    setIsOwnGoal(false);
    setCurrentStep('player');
  };

  const handlePlayerSelect = (player: ComponentPlayer) => {
    setSelectedPlayer(player);
    
    // Check if this is an own goal (player from opposing team)
    if (selectedTeam !== '') {
      const playerTeam = player.team;
      const scoringTeam = getTeamName(selectedTeam as 'home' | 'away');
      const isOwnGoalScenario = playerTeam !== scoringTeam;
      
      setIsOwnGoal(isOwnGoalScenario);
      setCurrentStep('goal-type');
    }
  };

  const handleGoalTypeConfirm = () => {
    if (isOwnGoal) {
      // Own goals don't have assists
      setCurrentStep('confirm');
    } else {
      setCurrentStep('assist');
    }
  };

  const handleAssistDecision = (hasAssist: boolean) => {
    setNeedsAssist(hasAssist);
    if (!hasAssist) {
      setCurrentStep('confirm');
    }
    // If hasAssist is true, stay on assist step to select player
  };

  const handleAssistPlayerSelect = (player: ComponentPlayer) => {
    setAssistPlayer(player);
    setCurrentStep('confirm');
  };

  const handleConfirm = () => {
    if (!selectedPlayer || selectedTeam === '') return;

    // First assign the goal
    onGoalAssigned({
      player: selectedPlayer,
      goalType: 'goal',
      team: selectedTeam as 'home' | 'away',
      isOwnGoal
    });

    // Then assign the assist if applicable
    if (assistPlayer && !isOwnGoal && selectedTeam !== '') {
      setTimeout(() => {
        onGoalAssigned({
          player: assistPlayer,
          goalType: 'assist',
          team: selectedTeam as 'home' | 'away'
        });
      }, 100);
    }
  };

  const canGoBack = currentStep !== 'team';
  const goBack = () => {
    switch (currentStep) {
      case 'player':
        setCurrentStep('team');
        break;
      case 'goal-type':
        setCurrentStep('player');
        break;
      case 'assist':
        setCurrentStep('goal-type');
        break;
      case 'confirm':
        if (isOwnGoal || !needsAssist) {
          setCurrentStep('goal-type');
        } else {
          setCurrentStep('assist');
        }
        break;
    }
  };

  const renderStepIndicator = () => {
    const steps = ['team', 'player', 'goal-type', 'assist', 'confirm'];
    const currentIndex = steps.indexOf(currentStep);
    
    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((step, index) => {
          let isActive = index === currentIndex;
          let isCompleted = index < currentIndex;
          let isSkipped = step === 'assist' && isOwnGoal && index < currentIndex;
          
          return (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                isCompleted || isSkipped ? 'bg-green-500 text-white' :
                isActive ? 'bg-primary text-primary-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                {isCompleted || isSkipped ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${
                  isCompleted || isSkipped ? 'bg-green-500' : 'bg-muted'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Goal Entry - {formatTime(matchTime)}
        </CardTitle>
        {renderStepIndicator()}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Step 1: Team Selection */}
        {currentStep === 'team' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Which team scored?</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleTeamSelect('home')}
                variant="outline"
                className="h-16 text-lg"
              >
                {getTeamName('home')}
              </Button>
              <Button
                onClick={() => handleTeamSelect('away')}
                variant="outline"
                className="h-16 text-lg"
              >
                {getTeamName('away')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Player Selection */}
        {currentStep === 'player' && selectedTeam !== '' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Who scored for {getTeamName(selectedTeam as 'home' | 'away')}?
            </h3>
            <p className="text-sm text-muted-foreground">
              Tip: You can also select a player from the opposing team if it was an own goal
            </p>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-2">{getTeamName(selectedTeam as 'home' | 'away')} Players</h4>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {getTeamPlayers().map((player) => (
                    <Button
                      key={`team-${player.id}`}
                      onClick={() => handlePlayerSelect(player)}
                      variant="outline"
                      className="justify-start h-auto p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold">
                          {player.number || '?'}
                        </div>
                        <span>{player.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-muted-foreground">
                  {selectedTeam === 'home' ? getTeamName('away') : getTeamName('home')} Players (Own Goal)
                </h4>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                  {getOpposingTeamPlayers().map((player) => (
                    <Button
                      key={`opposing-${player.id}`}
                      onClick={() => handlePlayerSelect(player)}
                      variant="outline"
                      className="justify-start h-auto p-3 border-orange-200 hover:border-orange-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-700">
                          {player.number || '?'}
                        </div>
                        <span className="text-orange-700">{player.name}</span>
                        <Badge variant="outline" className="ml-auto text-orange-600 border-orange-300">
                          Own Goal
                        </Badge>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Goal Type Confirmation */}
        {currentStep === 'goal-type' && selectedPlayer && selectedTeam !== '' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Confirm Goal Details</h3>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <strong>Scorer:</strong> {selectedPlayer.name}
              </div>
              <div className="flex items-center gap-2">
                <strong>Team:</strong> {selectedPlayer.team}
              </div>
              <div className="flex items-center gap-2">
                <strong>Goal for:</strong> {getTeamName(selectedTeam as 'home' | 'away')}
              </div>
              {isOwnGoal && (
                <Badge variant="destructive" className="mt-2">
                  Own Goal
                </Badge>
              )}
            </div>
            <Button onClick={handleGoalTypeConfirm} className="w-full">
              {isOwnGoal ? 'Confirm Own Goal' : 'Continue to Assist'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 4: Assist Selection */}
        {currentStep === 'assist' && !isOwnGoal && selectedTeam !== '' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Was there an assist?</h3>
            
            {!needsAssist ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={() => handleAssistDecision(true)} variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Yes, add assist
                  </Button>
                  <Button onClick={() => handleAssistDecision(false)} variant="outline">
                    No assist
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="font-medium">Select assist player from {getTeamName(selectedTeam as 'home' | 'away')}</h4>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                  {getTeamPlayers()
                    .filter(player => player.id !== selectedPlayer?.id)
                    .map((player) => (
                    <Button
                      key={`assist-${player.id}`}
                      onClick={() => handleAssistPlayerSelect(player)}
                      variant="outline"
                      className="justify-start h-auto p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">
                          {player.number || '?'}
                        </div>
                        <span>{player.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
                <Button 
                  onClick={() => setNeedsAssist(false)} 
                  variant="ghost" 
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to assist decision
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Confirmation */}
        {currentStep === 'confirm' && selectedTeam !== '' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Confirm Goal Entry</h3>
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Goal Scorer:</span>
                <span>{selectedPlayer?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Team Scored For:</span>
                <span>{getTeamName(selectedTeam as 'home' | 'away')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Time:</span>
                <span>{formatTime(matchTime)}</span>
              </div>
              {isOwnGoal && (
                <Badge variant="destructive" className="w-full justify-center">
                  Own Goal
                </Badge>
              )}
              {assistPlayer && (
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="font-medium">Assist:</span>
                  <span>{assistPlayer.name}</span>
                </div>
              )}
            </div>
            <Button onClick={handleConfirm} className="w-full" size="lg">
              <Check className="h-4 w-4 mr-2" />
              Confirm Goal Entry
            </Button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button onClick={onCancel} variant="ghost">
            Cancel
          </Button>
          {canGoBack && (
            <Button onClick={goBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalEntryWizard;
