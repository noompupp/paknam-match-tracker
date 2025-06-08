
import { ComponentPlayer } from "../../hooks/useRefereeState";

export type WizardStep = 'team' | 'player' | 'goal-type' | 'assist' | 'confirm';

export interface GoalWizardData {
  selectedTeam: 'home' | 'away' | null;
  selectedPlayer: ComponentPlayer | null;
  isOwnGoal: boolean;
  needsAssist: boolean;
  assistPlayer: ComponentPlayer | null;
}

export interface BaseStepProps {
  selectedFixtureData: any;
  homeTeamPlayers?: ComponentPlayer[];
  awayTeamPlayers?: ComponentPlayer[];
  wizardData: GoalWizardData;
  onNext: () => void;
  onBack: () => void;
  onDataChange: (data: Partial<GoalWizardData>) => void;
}
