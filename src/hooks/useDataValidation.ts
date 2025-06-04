
import { useEffect, useCallback } from 'react';
import { 
  DataMonitoringService, 
  createGoalKey, 
  createCardKey,
  validateGoalData,
  validateCardData
} from '@/utils/dataMonitoring';

interface UseDataValidationProps {
  componentName: string;
  goals?: any[];
  cards?: any[];
  players?: any[];
  enabled?: boolean;
}

export const useDataValidation = ({
  componentName,
  goals = [],
  cards = [],
  players = [],
  enabled = true
}: UseDataValidationProps) => {
  
  const validateData = useCallback(() => {
    if (!enabled) return;

    const issues: string[] = [];
    
    // Validate goals
    if (goals.length > 0) {
      const goalDuplicates = DataMonitoringService.detectDuplicates(
        goals,
        createGoalKey,
        `${componentName}-goals`
      );
      
      // Validate individual goal records
      goals.forEach((goal, index) => {
        const goalIssues = validateGoalData(goal);
        if (goalIssues.length > 0) {
          issues.push(`Goal ${index + 1}: ${goalIssues.join(', ')}`);
        }
      });

      DataMonitoringService.generateReport(
        `${componentName}-goals`,
        goals,
        goalDuplicates,
        issues.filter(issue => issue.includes('Goal'))
      );
    }

    // Validate cards
    if (cards.length > 0) {
      const cardDuplicates = DataMonitoringService.detectDuplicates(
        cards,
        createCardKey,
        `${componentName}-cards`
      );
      
      // Validate individual card records
      cards.forEach((card, index) => {
        const cardIssues = validateCardData(card);
        if (cardIssues.length > 0) {
          issues.push(`Card ${index + 1}: ${cardIssues.join(', ')}`);
        }
      });

      DataMonitoringService.generateReport(
        `${componentName}-cards`,
        cards,
        cardDuplicates,
        issues.filter(issue => issue.includes('Card'))
      );
    }

    // Log summary if there are issues
    if (issues.length > 0) {
      console.warn(`⚠️ ${componentName}: Data validation issues found:`, issues);
    }

  }, [componentName, goals, cards, players, enabled]);

  // Run validation when data changes
  useEffect(() => {
    validateData();
  }, [validateData]);

  // Get data quality summary for this component
  const getComponentSummary = useCallback(() => {
    return DataMonitoringService.getReports(componentName);
  }, [componentName]);

  // Get overall data quality summary
  const getOverallSummary = useCallback(() => {
    return DataMonitoringService.getSummary();
  }, []);

  return {
    validateData,
    getComponentSummary,
    getOverallSummary
  };
};
