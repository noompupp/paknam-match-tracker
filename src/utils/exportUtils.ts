import html2canvas from 'html2canvas';

export const exportToJPEG = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found for export');
  }

  // Create canvas from the element
  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2, // Higher quality
    useCORS: true,
    allowTaint: true,
  });

  // Convert to JPEG and download
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/jpeg', 0.9);
  link.click();
};

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateEnhancedMatchSummary = (
  selectedFixtureData: any,
  goals: any[],
  cards: any[],
  trackedPlayers: any[],
  events: any[],
  homeScore: number,
  awayScore: number,
  matchTime: number,
  formatTime: (seconds: number) => string
) => {
  if (!selectedFixtureData) return '';

  const homeTeam = selectedFixtureData.home_team?.name || 'Home Team';
  const awayTeam = selectedFixtureData.away_team?.name || 'Away Team';
  
  // Enhanced statistics
  const homeGoals = goals.filter(g => g.team === homeTeam);
  const awayGoals = goals.filter(g => g.team === awayTeam);
  const homeCards = cards.filter(c => c.team === homeTeam);
  const awayCards = cards.filter(c => c.team === awayTeam);
  
  // Card statistics
  const homeYellowCards = homeCards.filter(c => c.type === 'yellow').length;
  const homeRedCards = homeCards.filter(c => c.type === 'red').length;
  const awayYellowCards = awayCards.filter(c => c.type === 'yellow').length;
  const awayRedCards = awayCards.filter(c => c.type === 'red').length;
  
  // Player time statistics
  const totalPlayersTracked = trackedPlayers.length;
  const averagePlayTime = totalPlayersTracked > 0 
    ? trackedPlayers.reduce((sum, p) => sum + p.totalTime, 0) / totalPlayersTracked 
    : 0;

  let summary = `ENHANCED MATCH SUMMARY\n`;
  summary += `${'='.repeat(50)}\n\n`;
  
  // Match Info
  summary += `📅 Match: ${homeTeam} vs ${awayTeam}\n`;
  summary += `📊 Final Score: ${homeScore} - ${awayScore}\n`;
  summary += `⏱️ Match Duration: ${formatTime(matchTime)}\n`;
  summary += `📍 Date: ${new Date().toLocaleDateString()}\n\n`;
  
  // Enhanced Team Statistics
  summary += `TEAM STATISTICS\n`;
  summary += `${'-'.repeat(30)}\n`;
  summary += `${homeTeam}:\n`;
  summary += `  ⚽ Goals: ${homeGoals.length}\n`;
  summary += `  🟨 Yellow Cards: ${homeYellowCards}\n`;
  summary += `  🟥 Red Cards: ${homeRedCards}\n\n`;
  
  summary += `${awayTeam}:\n`;
  summary += `  ⚽ Goals: ${awayGoals.length}\n`;
  summary += `  🟨 Yellow Cards: ${awayYellowCards}\n`;
  summary += `  🟥 Red Cards: ${awayRedCards}\n\n`;
  
  // Goal Details
  if (goals.length > 0) {
    summary += `GOAL DETAILS\n`;
    summary += `${'-'.repeat(20)}\n`;
    goals.forEach(goal => {
      summary += `⚽ ${formatTime(goal.time)} - ${goal.playerName} (${goal.team}) - ${goal.type}\n`;
    });
    summary += '\n';
  }
  
  // Card Details
  if (cards.length > 0) {
    summary += `DISCIPLINARY ACTIONS\n`;
    summary += `${'-'.repeat(25)}\n`;
    cards.forEach(card => {
      const cardIcon = card.type === 'yellow' ? '🟨' : '🟥';
      summary += `${cardIcon} ${formatTime(card.time)} - ${card.player} (${card.team}) - ${card.type} card\n`;
    });
    summary += '\n';
  }
  
  // Player Time Tracking
  if (trackedPlayers.length > 0) {
    summary += `PLAYER TIME TRACKING\n`;
    summary += `${'-'.repeat(25)}\n`;
    summary += `📊 Total Players Tracked: ${totalPlayersTracked}\n`;
    summary += `⏱️ Average Playing Time: ${formatTime(Math.round(averagePlayTime))}\n\n`;
    
    summary += `Individual Player Times:\n`;
    trackedPlayers
      .sort((a, b) => b.totalTime - a.totalTime)
      .forEach(player => {
        const status = player.isPlaying ? '🟢 Playing' : '⏸️ Stopped';
        summary += `  ${player.name} (${player.team}): ${formatTime(player.totalTime)} ${status}\n`;
      });
    summary += '\n';
  }
  
  // Key Events Timeline
  if (events.length > 0) {
    summary += `EVENT TIMELINE\n`;
    summary += `${'-'.repeat(20)}\n`;
    events
      .sort((a, b) => a.time - b.time)
      .forEach(event => {
        summary += `${formatTime(event.time)} - ${event.description}\n`;
      });
    summary += '\n';
  }
  
  // Match Statistics Summary
  summary += `MATCH SUMMARY\n`;
  summary += `${'-'.repeat(20)}\n`;
  summary += `📊 Total Goals: ${goals.length}\n`;
  summary += `🟨 Total Yellow Cards: ${homeYellowCards + awayYellowCards}\n`;
  summary += `🟥 Total Red Cards: ${homeRedCards + awayRedCards}\n`;
  summary += `📋 Total Events: ${events.length}\n`;
  summary += `⏱️ Match Duration: ${formatTime(matchTime)}\n\n`;
  
  summary += `Generated by Referee Tools - ${new Date().toLocaleString()}\n`;
  summary += `${'='.repeat(50)}`;
  
  return summary;
};
