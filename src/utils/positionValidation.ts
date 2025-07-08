/**
 * Position Validation and Correction Utilities for TOTW System
 * Provides tools to validate and suggest position corrections
 */

export interface PositionValidationResult {
  isValid: boolean;
  normalizedPosition: string;
  originalPosition: string;
  confidence: number;
  suggestions?: string[];
  warnings?: string[];
}

export interface FormationValidationResult {
  isBalanced: boolean;
  formation: string;
  recommendations: string[];
  distribution: {
    goalkeepers: number;
    defenders: number;
    midfielders: number;
    forwards: number;
  };
}

/**
 * Enhanced position normalization with confidence scoring
 */
export function validateAndNormalizePosition(position: string, playerName?: string): PositionValidationResult {
  const originalPosition = position;
  const pos = position.toUpperCase().trim();
  
  let normalizedPosition = 'MF';
  let confidence = 0.5;
  const suggestions: string[] = [];
  const warnings: string[] = [];

  // High confidence mappings
  if (pos.includes('GK') || pos.includes('GOALKEEPER') || pos.includes('KEEPER')) {
    normalizedPosition = 'GK';
    confidence = 0.95;
  } else if (pos.includes('ST') || pos.includes('STRIKER') || pos.includes('CF') || 
             pos.includes('CENTRE-FORWARD') || pos.includes('CENTER-FORWARD')) {
    normalizedPosition = 'FW';
    confidence = 0.9;
  } else if (pos.includes('CB') || pos.includes('CENTRE-BACK') || pos.includes('CENTER-BACK') ||
             pos === 'CENTRE BACK' || pos === 'CENTER BACK') {
    normalizedPosition = 'DF';
    confidence = 0.9;
  } else if (pos.includes('CDM') || pos.includes('CAM') || pos.includes('CM')) {
    normalizedPosition = 'MF';
    confidence = 0.85;
  }
  
  // Medium confidence mappings
  else if (pos.includes('LB') || pos.includes('RB') || pos.includes('FULLBACK')) {
    normalizedPosition = 'DF';
    confidence = 0.8;
  } else if (pos.includes('LW') || pos.includes('RW') || pos.includes('WING')) {
    normalizedPosition = 'MF';
    confidence = 0.75;
    suggestions.push('Consider if winger should be classified as forward');
  } else if (pos.includes('DF') || pos.includes('DEF') || pos.includes('DEFENDER')) {
    normalizedPosition = 'DF';
    confidence = 0.7;
  } else if (pos.includes('FW') || pos.includes('FORWARD')) {
    normalizedPosition = 'FW';
    confidence = 0.7;
  } else if (pos.includes('MF') || pos.includes('MID') || pos.includes('MIDFIELDER')) {
    normalizedPosition = 'MF';
    confidence = 0.7;
  }
  
  // Jersey number fallback
  else if (/^\d+$/.test(pos)) {
    const num = parseInt(pos);
    if (num === 1) {
      normalizedPosition = 'GK';
      confidence = 0.8;
    } else if (num >= 2 && num <= 5) {
      normalizedPosition = 'DF';
      confidence = 0.6;
      suggestions.push('Jersey number suggests defender - verify actual position');
    } else if (num >= 6 && num <= 8) {
      normalizedPosition = 'MF';
      confidence = 0.6;
      suggestions.push('Jersey number suggests midfielder - verify actual position');
    } else if (num >= 9 && num <= 11) {
      normalizedPosition = 'FW';
      confidence = 0.6;
      suggestions.push('Jersey number suggests forward - verify actual position');
    } else {
      confidence = 0.3;
      warnings.push(`Unusual jersey number ${num} - manual verification needed`);
    }
  }
  
  // Low confidence - unclear position
  else {
    confidence = 0.3;
    warnings.push(`Unclear position "${originalPosition}" - defaulted to midfielder`);
    suggestions.push('Manual position assignment recommended');
  }

  // Additional validation based on player name patterns (Thai names)
  if (playerName && confidence < 0.8) {
    // This could be enhanced with machine learning or manual mapping
    suggestions.push('Consider manual verification for non-standard position names');
  }

  return {
    isValid: confidence > 0.6,
    normalizedPosition,
    originalPosition,
    confidence,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Validate formation balance for 7-a-side football
 */
export function validateFormation(players: Array<{ position: string }>): FormationValidationResult {
  const distribution = players.reduce((acc, player) => {
    const validation = validateAndNormalizePosition(player.position);
    acc[validation.normalizedPosition.toLowerCase() + 's' as keyof typeof acc]++;
    return acc;
  }, { goalkeepers: 0, defenders: 0, midfielders: 0, forwards: 0 });

  const recommendations: string[] = [];
  let isBalanced = true;

  // 7-a-side validation rules
  if (distribution.goalkeepers !== 1) {
    isBalanced = false;
    if (distribution.goalkeepers === 0) {
      recommendations.push('Missing goalkeeper - add 1 goalkeeper');
    } else {
      recommendations.push(`Too many goalkeepers (${distribution.goalkeepers}) - should have exactly 1`);
    }
  }

  if (distribution.defenders < 1) {
    isBalanced = false;
    recommendations.push('Need at least 1 defender for balanced formation');
  }

  if (distribution.defenders > 4) {
    recommendations.push('Consider if having more than 4 defenders is too defensive');
  }

  if (distribution.midfielders < 1) {
    isBalanced = false;
    recommendations.push('Need at least 1 midfielder for balanced formation');
  }

  if (distribution.forwards === 0) {
    recommendations.push('Consider adding at least 1 forward for attacking threat');
  }

  if (distribution.forwards > 3) {
    recommendations.push('Having more than 3 forwards might be too attacking');
  }

  // Check total players
  const totalOutfield = distribution.defenders + distribution.midfielders + distribution.forwards;
  if (totalOutfield !== 6) {
    isBalanced = false;
    recommendations.push(`Should have 6 outfield players, currently have ${totalOutfield}`);
  }

  const formation = `${distribution.defenders}-${distribution.midfielders}-${distribution.forwards}`;

  return {
    isBalanced,
    formation,
    recommendations,
    distribution
  };
}

/**
 * Get common 7-a-side formations for reference
 */
export function getRecommendedFormations(): Array<{
  formation: string;
  description: string;
  style: string;
}> {
  return [
    { formation: '3-2-1', description: 'Balanced formation', style: 'balanced' },
    { formation: '3-1-2', description: 'Attacking formation', style: 'attacking' },
    { formation: '2-3-1', description: 'Midfield heavy', style: 'possession' },
    { formation: '2-2-2', description: 'Very attacking', style: 'ultra-attacking' },
    { formation: '4-1-1', description: 'Defensive formation', style: 'defensive' },
    { formation: '3-3-0', description: 'Ultra defensive', style: 'ultra-defensive' }
  ];
}

/**
 * Suggest position corrections for a team
 */
export function suggestPositionCorrections(
  players: Array<{ player_name: string; position: string; rating?: number }>
): Array<{
  playerName: string;
  currentPosition: string;
  suggestedPosition: string;
  reason: string;
  confidence: number;
}> {
  const corrections: Array<{
    playerName: string;
    currentPosition: string;
    suggestedPosition: string;
    reason: string;
    confidence: number;
  }> = [];

  players.forEach(player => {
    const validation = validateAndNormalizePosition(player.position, player.player_name);
    
    if (!validation.isValid || validation.confidence < 0.7) {
      corrections.push({
        playerName: player.player_name,
        currentPosition: player.position,
        suggestedPosition: validation.normalizedPosition,
        reason: validation.warnings?.[0] || validation.suggestions?.[0] || 'Low confidence classification',
        confidence: validation.confidence
      });
    }
  });

  return corrections.sort((a, b) => a.confidence - b.confidence);
}