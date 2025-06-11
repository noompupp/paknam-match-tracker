
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const formatTime = (timeString: string) => {
  if (!timeString || timeString === 'TBD') return 'TBD';
  
  try {
    // Handle time format - could be HH:MM:SS or HH:MM
    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
      const hour = parseInt(timeParts[0], 10);
      const minute = parseInt(timeParts[1], 10);
      
      // Create a date object for formatting
      const time = new Date();
      time.setHours(hour, minute, 0, 0);
      
      return time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
  } catch (error) {
    console.warn('Error formatting time:', timeString, error);
  }
  
  return timeString || 'TBD';
};

// Create a combined date-time for proper sorting with fallback for missing times
export const getFixtureDateTime = (fixture: any) => {
  const dateStr = fixture.match_date;
  // Use match_time if available, otherwise fall back to a default time
  const timeStr = fixture.match_time || '18:00:00';
  
  try {
    return new Date(`${dateStr}T${timeStr}`);
  } catch {
    // Fallback if date parsing fails
    return new Date(dateStr + 'T18:00:00');
  }
};

export const sortFixtures = (fixtures: any[]) => {
  return fixtures?.slice().sort((a, b) => {
    try {
      const dateTimeA = getFixtureDateTime(a);
      const dateTimeB = getFixtureDateTime(b);
      
      // For completed fixtures, show most recent first
      if (a.status === 'completed' && b.status === 'completed') {
        return dateTimeB.getTime() - dateTimeA.getTime();
      }
      
      // For scheduled/upcoming fixtures, show earliest first
      if (a.status !== 'completed' && b.status !== 'completed') {
        return dateTimeA.getTime() - dateTimeB.getTime();
      }
      
      // Mixed status: completed fixtures first, then upcoming
      if (a.status === 'completed') return -1;
      if (b.status === 'completed') return 1;
      
      return dateTimeA.getTime() - dateTimeB.getTime();
    } catch (error) {
      console.warn('Error sorting fixtures:', error, { fixtureA: a, fixtureB: b });
      // Fallback: sort by ID if date parsing fails
      return (a.id || 0) - (b.id || 0);
    }
  });
};

// Format match time in seconds to user-friendly format (mm:ss)
export const formatMatchTime = (seconds: number): string => {
  if (typeof seconds !== 'number' || isNaN(seconds)) {
    return '00:00';
  }
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Format match time for display in timeline (showing minutes only)
export const formatTimelineTime = (seconds: number): string => {
  if (typeof seconds !== 'number' || isNaN(seconds)) {
    return '0\'';
  }
  
  const mins = Math.floor(seconds / 60);
  return `${mins}'`;
};

// Get event count for a fixture
export const getEventCount = (goals: any[], cards: any[]): number => {
  return (goals?.length || 0) + (cards?.length || 0);
};

