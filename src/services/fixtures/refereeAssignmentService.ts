
export interface RefereeTeamAssignment {
  homeTeamReferee: string;
  awayTeamReferee: string;
  mainReferee?: string;
}

export const refereeAssignmentService = {
  /**
   * Assigns referee teams based on weekly rotation and match time
   * Implements fair rotation ensuring all teams get equal referee duties
   */
  getRefereeAssignment(
    matchTime: string,
    homeTeamId: string,
    awayTeamId: string,
    allTeams: any[],
    matchDate?: string
  ): RefereeTeamAssignment {
    console.log('🔍 Referee Assignment: Determining referee teams for match', {
      matchTime,
      homeTeamId,
      awayTeamId,
      matchDate
    });

    // Get teams not playing in this match
    const availableTeams = allTeams.filter(team => 
      team.__id__ !== homeTeamId && team.__id__ !== awayTeamId
    );

    if (availableTeams.length < 2) {
      console.warn('⚠️ Referee Assignment: Not enough teams available for referee assignment');
      return {
        homeTeamReferee: 'TBD',
        awayTeamReferee: 'TBD'
      };
    }

    // Sort teams alphabetically for consistent ordering
    const sortedAvailableTeams = [...availableTeams].sort((a, b) => 
      (a.name || '').localeCompare(b.name || '')
    );

    // Calculate week number for rotation
    const weekNumber = this.getWeekNumber(matchDate);
    const timeSlot = this.getTimeSlotIndex(matchTime);
    
    // Calculate rotation offset: each week shifts by 1, each time slot shifts by 2
    const rotationOffset = (weekNumber + (timeSlot * 2)) % sortedAvailableTeams.length;
    
    // Select two teams based on rotation
    const homeRefereeIndex = rotationOffset % sortedAvailableTeams.length;
    const awayRefereeIndex = (rotationOffset + 1) % sortedAvailableTeams.length;

    const assignment: RefereeTeamAssignment = {
      homeTeamReferee: sortedAvailableTeams[homeRefereeIndex]?.name || 'TBD',
      awayTeamReferee: sortedAvailableTeams[awayRefereeIndex]?.name || 'TBD'
    };

    console.log('✅ Referee Assignment: Assigned referee teams with rotation', {
      assignment,
      weekNumber,
      timeSlot,
      rotationOffset,
      homeRefereeIndex,
      awayRefereeIndex
    });
    
    return assignment;
  },

  /**
   * Calculate week number from match date for rotation
   */
  getWeekNumber(matchDate?: string): number {
    if (!matchDate) {
      // Fallback to current week if no date provided
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
      return Math.floor(days / 7);
    }
    
    const date = new Date(matchDate);
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.floor(days / 7);
  },

  /**
   * Gets time slot index for rotation calculation
   */
  getTimeSlotIndex(matchTime: string): number {
    const hour = parseInt(matchTime.split(':')[0]);
    
    if (hour < 12) return 0; // morning
    if (hour < 17) return 1; // afternoon
    return 2; // evening
  },

  /**
   * Determines the time slot category for a match
   */
  getTimeSlot(matchTime: string): 'morning' | 'afternoon' | 'evening' {
    const hour = parseInt(matchTime.split(':')[0]);
    
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  },

  /**
   * Gets a user-friendly referee assignment display
   * Only shows 2 teams - home and away referees
   */
  formatRefereeAssignment(assignment: RefereeTeamAssignment): string {
    const parts = [
      `Home: ${assignment.homeTeamReferee}`,
      `Away: ${assignment.awayTeamReferee}`
    ];

    return parts.join(' • ');
  }
};
