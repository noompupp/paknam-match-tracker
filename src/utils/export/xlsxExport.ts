import * as XLSX from 'xlsx';

export interface ExcelExportData {
  fixture: any;
  goals: any[];
  cards: any[];
  playerTimes?: any[];
  summary: any;
}

export const exportToExcel = async (data: ExcelExportData, filename: string) => {
  const workbook = XLSX.utils.book_new();

  // Match Overview Sheet
  const matchOverview = [
    ['Match Summary'],
    [''],
    ['Home Team', data.fixture.home_team?.name || 'Home'],
    ['Away Team', data.fixture.away_team?.name || 'Away'],
    ['Final Score', `${data.fixture.home_score || 0} - ${data.fixture.away_score || 0}`],
    ['Date', data.fixture.match_date || ''],
    ['Venue', data.fixture.venue || ''],
    [''],
    ['Statistics'],
    ['Total Goals', data.goals?.filter(g => g.type === 'goal' || g.event_type === 'goal').length || 0],
    ['Total Cards', data.cards?.length || 0],
    ['Yellow Cards', data.cards?.filter(c => c.type === 'yellow' || c.card_type === 'yellow' || c.event_type === 'yellow_card').length || 0],
    ['Red Cards', data.cards?.filter(c => c.type === 'red' || c.card_type === 'red' || c.event_type === 'red_card').length || 0]
  ];

  const overviewWs = XLSX.utils.aoa_to_sheet(matchOverview);
  XLSX.utils.book_append_sheet(workbook, overviewWs, 'Match Overview');

  // Goals Sheet
  if (data.goals && data.goals.length > 0) {
    const goalsData = [
      ['Goals & Assists'],
      ['Time (min)', 'Player', 'Team', 'Type', 'Assist Player']
    ];

    data.goals.forEach(goal => {
      const time = goal.time ? Math.floor(goal.time / 60) : 
                  goal.event_time ? Math.floor(goal.event_time / 60) : 
                  goal.minute || '';
      const player = goal.playerName || goal.player_name || '';
      const team = goal.teamName || goal.team_name || goal.team || '';
      const type = goal.type || (goal.event_type === 'goal' ? 'Goal' : 'Assist');
      const assistPlayer = goal.assistPlayerName || goal.assist_player_name || '';

      goalsData.push([time, player, team, type, assistPlayer]);
    });

    const goalsWs = XLSX.utils.aoa_to_sheet(goalsData);
    XLSX.utils.book_append_sheet(workbook, goalsWs, 'Goals');
  }

  // Cards Sheet
  if (data.cards && data.cards.length > 0) {
    const cardsData = [
      ['Cards'],
      ['Time (min)', 'Player', 'Team', 'Card Type', 'Reason']
    ];

    data.cards.forEach(card => {
      const time = card.time ? Math.floor(card.time / 60) : 
                  card.event_time ? Math.floor(card.event_time / 60) : 
                  card.minute || '';
      const player = card.playerName || card.player_name || '';
      const team = card.teamName || card.team_name || card.team || '';
      const cardType = card.type || card.card_type || card.event_type?.replace('_card', '') || '';
      const reason = card.reason || card.description || '';

      cardsData.push([time, player, team, cardType, reason]);
    });

    const cardsWs = XLSX.utils.aoa_to_sheet(cardsData);
    XLSX.utils.book_append_sheet(workbook, cardsWs, 'Cards');
  }

  // Player Times Sheet (if available)
  if (data.playerTimes && data.playerTimes.length > 0) {
    const playerTimesData = [
      ['Player Time Tracking'],
      ['Player', 'Team', 'Total Time (min)', 'Status']
    ];

    data.playerTimes.forEach(player => {
      const totalTime = player.totalTime ? Math.floor(player.totalTime / 60) : 
                       player.total_time ? Math.floor(player.total_time / 60) : '';
      const status = player.isPlaying ? 'Playing' : 'Not Playing';

      playerTimesData.push([
        player.name || player.player_name,
        player.team || player.team_name,
        totalTime,
        status
      ]);
    });

    const playerTimesWs = XLSX.utils.aoa_to_sheet(playerTimesData);
    XLSX.utils.book_append_sheet(workbook, playerTimesWs, 'Player Times');
  }

  // Export the workbook
  XLSX.writeFile(workbook, filename);
};