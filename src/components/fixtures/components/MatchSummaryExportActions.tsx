
import { Button } from "@/components/ui/button";
import { Download, FileImage, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToJPEG, exportToCSV } from "@/utils/exportUtils";

interface MatchSummaryExportActionsProps {
  fixture: any;
  matchEvents: any[];
  goals: any[];
  cards: any[];
  enhancedSuccess: boolean;
  enhancedData: any;
  formatTime: (seconds: number) => string;
  getGoalTeamId: (goal: any) => string;
  getGoalPlayerName: (goal: any) => string;
  getGoalTime: (goal: any) => number;
  getCardTeamId: (card: any) => string;
  getCardPlayerName: (card: any) => string;
  getCardTime: (card: any) => number;
  getCardType: (card: any) => string;
}

const MatchSummaryExportActions = ({
  fixture,
  matchEvents,
  goals,
  cards,
  enhancedSuccess,
  enhancedData,
  formatTime,
  getGoalTeamId,
  getGoalPlayerName,
  getGoalTime,
  getCardTeamId,
  getCardPlayerName,
  getCardTime,
  getCardType
}: MatchSummaryExportActionsProps) => {
  const { toast } = useToast();

  const handleExportJSON = () => {
    const summaryData = {
      fixture: {
        homeTeam: fixture?.home_team?.name,
        awayTeam: fixture?.away_team?.name,
        homeScore: fixture?.home_score || 0,
        awayScore: fixture?.away_score || 0,
        date: fixture?.match_date,
        venue: fixture?.venue
      },
      events: matchEvents || [],
      goals,
      cards,
      enhancedData: enhancedSuccess ? enhancedData : null
    };
    
    const dataStr = JSON.stringify(summaryData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `match-summary-${fixture?.home_team?.name}-vs-${fixture?.away_team?.name}-${fixture?.match_date}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Match Summary Exported",
      description: "Match summary has been downloaded as JSON file.",
    });
  };

  const handleExportJPEG = async () => {
    try {
      const filename = `match-summary-${fixture?.home_team?.name}-vs-${fixture?.away_team?.name}-${fixture?.match_date}.jpg`;
      await exportToJPEG('match-summary-content', filename);
      toast({
        title: "Match Summary Exported",
        description: "Match summary has been downloaded as JPEG image.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export match summary as image.",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    try {
      const getResult = () => {
        const homeScore = fixture?.home_score || 0;
        const awayScore = fixture?.away_score || 0;
        if (homeScore > awayScore) return 'Home Win';
        if (awayScore > homeScore) return 'Away Win';
        return 'Draw';
      };

      const csvData = [
        { Type: 'Match', Team: fixture?.home_team?.name, Score: fixture?.home_score || 0, Result: getResult() },
        { Type: 'Match', Team: fixture?.away_team?.name, Score: fixture?.away_score || 0, Result: getResult() },
        ...goals.map(goal => ({
          Type: 'Goal',
          Team: getGoalTeamId(goal) === fixture?.home_team_id ? fixture?.home_team?.name : fixture?.away_team?.name,
          Player: getGoalPlayerName(goal),
          Time: formatTime(getGoalTime(goal)),
          Description: goal.assistPlayerName ? `Assist: ${goal.assistPlayerName}` : ''
        })),
        ...cards.map(card => ({
          Type: getCardType(card),
          Team: getCardTeamId(card) === fixture?.home_team_id ? fixture?.home_team?.name : fixture?.away_team?.name,
          Player: getCardPlayerName(card),
          Time: formatTime(getCardTime(card)),
          Description: ''
        }))
      ];

      const filename = `match-summary-${fixture?.home_team?.name}-vs-${fixture?.away_team?.name}-${fixture?.match_date}.csv`;
      exportToCSV(csvData, filename);
      
      toast({
        title: "Match Summary Exported",
        description: "Match summary has been downloaded as CSV file.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export match summary as CSV.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleExportJSON} variant="outline" className="flex-1">
        <Download className="h-4 w-4 mr-2" />
        JSON
      </Button>
      <Button onClick={handleExportJPEG} variant="outline" className="flex-1">
        <FileImage className="h-4 w-4 mr-2" />
        JPEG
      </Button>
      <Button onClick={handleExportCSV} variant="outline" className="flex-1">
        <FileText className="h-4 w-4 mr-2" />
        CSV
      </Button>
    </div>
  );
};

export default MatchSummaryExportActions;
