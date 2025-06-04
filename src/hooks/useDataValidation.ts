
import { useEffect, useState } from 'react';

interface ValidationConfig {
  componentName: string;
  goals?: any[];
  cards?: any[];
  players?: any[];
  enabled?: boolean;
}

interface ValidationIssue {
  type: 'warning' | 'error';
  component: string;
  message: string;
  data?: any;
}

export const useDataValidation = (config: ValidationConfig) => {
  const [issues, setIssues] = useState<ValidationIssue[]>([]);

  useEffect(() => {
    if (!config.enabled) return;

    const newIssues: ValidationIssue[] = [];

    // Validate goals data
    if (config.goals) {
      if (config.goals.length === 0) {
        newIssues.push({
          type: 'warning',
          component: config.componentName,
          message: 'No goals data found',
          data: { goalsCount: 0 }
        });
      } else {
        // Check for incomplete goal data
        const incompleteGoals = config.goals.filter(goal => 
          !goal.playerName || !goal.team || goal.time === undefined
        );
        
        if (incompleteGoals.length > 0) {
          newIssues.push({
            type: 'error',
            component: config.componentName,
            message: `${incompleteGoals.length} goals have incomplete data`,
            data: { incompleteGoals }
          });
        }
      }
    }

    // Validate cards data
    if (config.cards) {
      if (config.cards.length === 0) {
        newIssues.push({
          type: 'warning',
          component: config.componentName,
          message: 'No cards data found',
          data: { cardsCount: 0 }
        });
      } else {
        // Check for incomplete card data
        const incompleteCards = config.cards.filter(card => 
          !card.playerName || !card.team || card.time === undefined || !card.cardType
        );
        
        if (incompleteCards.length > 0) {
          newIssues.push({
            type: 'error',
            component: config.componentName,
            message: `${incompleteCards.length} cards have incomplete data`,
            data: { incompleteCards }
          });
        }
      }
    }

    // Validate players data
    if (config.players) {
      if (config.players.length === 0) {
        newIssues.push({
          type: 'warning',
          component: config.componentName,
          message: 'No players data found',
          data: { playersCount: 0 }
        });
      } else {
        // Check for players with missing stats
        const playersWithoutStats = config.players.filter(player => 
          (player.goals || 0) === 0 && 
          (player.assists || 0) === 0 && 
          (player.totalMinutesPlayed || 0) === 0
        );
        
        if (playersWithoutStats.length === config.players.length) {
          newIssues.push({
            type: 'warning',
            component: config.componentName,
            message: 'All players have zero stats - data may not be synced',
            data: { playersWithoutStats: playersWithoutStats.length }
          });
        }
      }
    }

    setIssues(newIssues);

    // Log issues for debugging
    if (newIssues.length > 0) {
      console.warn(`🔍 DataValidation [${config.componentName}]: Found ${newIssues.length} issues:`, newIssues);
    } else {
      console.log(`✅ DataValidation [${config.componentName}]: No issues found`);
    }
  }, [config.componentName, config.goals, config.cards, config.players, config.enabled]);

  return {
    issues,
    hasErrors: issues.some(issue => issue.type === 'error'),
    hasWarnings: issues.some(issue => issue.type === 'warning'),
    isValid: issues.length === 0
  };
};
