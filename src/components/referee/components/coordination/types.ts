
export interface Assignment {
  id: string;
  referee_id: string;
  assigned_role: 'score_goals' | 'cards_discipline' | 'time_tracking' | 'coordination';
  status: 'pending' | 'in_progress' | 'completed';
  completion_timestamp: string | null;
  notes: string | null;
}

export interface CoordinationData {
  coordination_id: string;
  fixture_id: number;
  status: string;
  assignments: Assignment[];
  completion_summary: any;
  ready_for_review: boolean;
}

export interface MultiRefereeCoordinationProps {
  selectedFixtureData: any;
  onRoleAssigned?: (role: string) => void;
}
