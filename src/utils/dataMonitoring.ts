interface DataQualityReport {
  timestamp: string;
  component: string;
  issues: string[];
  duplicates: number;
  totalRecords: number;
  status: 'healthy' | 'warning' | 'error';
}

interface DuplicateDetectionResult {
  hasDuplicates: boolean;
  duplicateCount: number;
  uniqueCount: number;
  duplicateKeys: string[];
}

export class DataMonitoringService {
  private static reports: DataQualityReport[] = [];

  // Detect duplicates in any array of objects
  static detectDuplicates(
    data: any[], 
    keyGenerator: (item: any) => string,
    componentName: string
  ): DuplicateDetectionResult {
    const keys = data.map(keyGenerator);
    const uniqueKeys = new Set(keys);
    const duplicateKeys = keys.filter((key, index) => keys.indexOf(key) !== index);
    
    const result: DuplicateDetectionResult = {
      hasDuplicates: duplicateKeys.length > 0,
      duplicateCount: duplicateKeys.length,
      uniqueCount: uniqueKeys.size,
      duplicateKeys: Array.from(new Set(duplicateKeys))
    };

    // Log results
    if (result.hasDuplicates) {
      console.warn(`🔍 ${componentName}: Duplicates detected:`, result);
    } else {
      console.log(`✅ ${componentName}: No duplicates found in ${data.length} records`);
    }

    return result;
  }

  // Generate data quality report
  static generateReport(
    componentName: string,
    data: any[],
    duplicateResult: DuplicateDetectionResult,
    additionalIssues: string[] = []
  ): DataQualityReport {
    const issues = [...additionalIssues];
    
    if (duplicateResult.hasDuplicates) {
      issues.push(`${duplicateResult.duplicateCount} duplicate records found`);
    }

    const status: 'healthy' | 'warning' | 'error' = 
      issues.length === 0 ? 'healthy' :
      duplicateResult.duplicateCount > 5 ? 'error' : 'warning';

    const report: DataQualityReport = {
      timestamp: new Date().toISOString(),
      component: componentName,
      issues,
      duplicates: duplicateResult.duplicateCount,
      totalRecords: data.length,
      status
    };

    this.reports.push(report);
    
    // Keep only last 100 reports
    if (this.reports.length > 100) {
      this.reports = this.reports.slice(-100);
    }

    return report;
  }

  // Get recent reports
  static getReports(componentName?: string): DataQualityReport[] {
    if (componentName) {
      return this.reports.filter(report => report.component === componentName);
    }
    return this.reports;
  }

  // Get summary of data quality across all components
  static getSummary(): {
    totalComponents: number;
    healthyComponents: number;
    warningComponents: number;
    errorComponents: number;
    totalDuplicates: number;
  } {
    const latestReports = new Map<string, DataQualityReport>();
    
    // Get latest report for each component
    this.reports.forEach(report => {
      const existing = latestReports.get(report.component);
      if (!existing || new Date(report.timestamp) > new Date(existing.timestamp)) {
        latestReports.set(report.component, report);
      }
    });

    const reports = Array.from(latestReports.values());
    
    return {
      totalComponents: reports.length,
      healthyComponents: reports.filter(r => r.status === 'healthy').length,
      warningComponents: reports.filter(r => r.status === 'warning').length,
      errorComponents: reports.filter(r => r.status === 'error').length,
      totalDuplicates: reports.reduce((sum, r) => sum + r.duplicates, 0)
    };
  }

  // Clear reports (for testing or reset)
  static clearReports(): void {
    this.reports = [];
  }
}

// Helper functions for common duplicate detection patterns
export const createGoalKey = (goal: any): string => {
  return `${goal.playerId || goal.player_id}-${goal.time}-${goal.type || goal.goal_type}-${goal.team}`;
};

export const createCardKey = (card: any): string => {
  return `${card.playerId || card.player_id}-${card.time}-${card.type || card.card_type}-${card.team}`;
};

export const createPlayerKey = (player: any): string => {
  return `${player.id}-${player.team_id || player.teamId}`;
};

// Enhanced validation functions
export const validateGoalData = (goal: any): string[] => {
  const issues: string[] = [];
  
  if (!goal.playerId && !goal.player_id) issues.push('Missing player ID');
  if (!goal.playerName && !goal.player_name) issues.push('Missing player name');
  if (!goal.team) issues.push('Missing team');
  if (!goal.type && !goal.goal_type) issues.push('Missing goal type');
  if (goal.time === undefined || goal.time === null) issues.push('Missing time');
  
  return issues;
};

export const validateCardData = (card: any): string[] => {
  const issues: string[] = [];
  
  if (!card.playerId && !card.player_id) issues.push('Missing player ID');
  if (!card.playerName && !card.player_name) issues.push('Missing player name');
  if (!card.team) issues.push('Missing team');
  if (!card.type && !card.card_type) issues.push('Missing card type');
  if (card.time === undefined || card.time === null) issues.push('Missing time');
  
  return issues;
};
