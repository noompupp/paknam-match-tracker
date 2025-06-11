
export type RefereeWorkflowMode = 'two_referees' | 'multi_referee';

export interface TwoRefereesConfig {
  homeReferee: {
    id: string;
    name: string;
    responsibilities: ('score_goals' | 'cards_discipline' | 'time_tracking')[];
  };
  awayReferee: {
    id: string;
    name: string;
    responsibilities: ('score_goals' | 'cards_discipline' | 'time_tracking')[];
  };
}

export interface MultiRefereeConfig {
  assignments: {
    score_goals: string | null;
    cards_discipline: string | null;
    time_tracking: string | null;
    coordination: string | null;
  };
}

export interface WorkflowModeConfig {
  mode: RefereeWorkflowMode;
  fixtureId: number;
  userAssignments: any[];
  allAssignments: any[];
  createdAt: string;
  updatedAt: string;
  twoRefereesConfig?: TwoRefereesConfig;
  multiRefereeConfig?: MultiRefereeConfig;
}

export interface WorkflowModeSelection {
  selectedMode: RefereeWorkflowMode | null;
  onModeSelect: (mode: RefereeWorkflowMode) => void;
  onConfigureMode: (config: WorkflowModeConfig) => void;
}
