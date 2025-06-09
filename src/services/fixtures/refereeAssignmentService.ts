
export interface RefereeTeamAssignment {
  homeTeamReferee: string;
  awayTeamReferee: string;
  mainReferee?: string;
}

export const refereeAssignmentService = {
  /**
   * Assigns referee teams based on match time and team participation
   */
  getRefereeAssignment(
    matchTime: string,
    homeTeamId: string,
    awayTeamId: string,
    allTeams: any[]
  ): RefereeTeamAssignment {
    console.log('🔍 Referee Assignment: Determining referee teams for match', {
      matchTime,
      homeTeamId,
      awayTeamId
    });

    // Parse match time to determine time slot
    const timeSlot = this.getTimeSlot(matchTime);
    
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

    // Assign referee teams based on alphabetical order for consistency
    const sortedAvailableTeams = [...availableTeams].sort((a, b) => 
      (a.name || '').localeCompare(b.name || '')
    );

    const assignment: RefereeTeamAssignment = {
      homeTeamReferee: sortedAvailableTeams[0]?.name || 'TBD',
      awayTeamReferee: sortedAvailableTeams[1]?.name || 'TBD'
    };

    // For important matches (evening slots), assign a main referee if available
    if (timeSlot === 'evening' && sortedAvailableTeams.length > 2) {
      assignment.mainReferee = sortedAvailableTeams[2]?.name;
    }

    console.log('✅ Referee Assignment: Assigned referee teams', assignment);
    return assignment;
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
   */
  formatRefereeAssignment(assignment: RefereeTeamAssignment): string {
    const parts = [
      `Home: ${assignment.homeTeamReferee}`,
      `Away: ${assignment.awayTeamReferee}`
    ];

    if (assignment.mainReferee) {
      parts.unshift(`Main: ${assignment.mainReferee}`);
    }

    return parts.join(' • ');
  }
};
