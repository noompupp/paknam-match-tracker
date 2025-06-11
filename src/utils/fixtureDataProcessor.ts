
export const sortFixturesChronologically = (fixtures: any[]) => {
  return fixtures?.slice().sort((a, b) => {
    const dateA = new Date(a.match_date || '');
    const dateB = new Date(b.match_date || '');
    
    // Scheduled fixtures first, then completed
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    
    // For scheduled fixtures, show earliest first
    if (a.status !== 'completed' && b.status !== 'completed') {
      return dateA.getTime() - dateB.getTime();
    }
    
    // For completed fixtures, show most recent first
    return dateB.getTime() - dateA.getTime();
  }) || [];
};

export const getMatchStatus = (fixture: any) => {
  if (fixture.status === 'completed') return { label: 'Completed', variant: 'secondary' as const };
  if (fixture.status === 'in_progress') return { label: 'Live', variant: 'destructive' as const };
  if (fixture.home_score !== null || fixture.away_score !== null) {
    return { label: 'Scored', variant: 'default' as const };
  }
  return { label: 'Scheduled', variant: 'outline' as const };
};

export const formatMatchDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

export const formatMatchTime = (timeStr: string) => {
  try {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } catch {
    return timeStr;
  }
};
