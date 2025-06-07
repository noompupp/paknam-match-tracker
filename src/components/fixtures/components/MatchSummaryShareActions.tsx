
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MatchSummaryShareActionsProps {
  fixture: any;
  goals?: any[];
  cards?: any[];
}

const MatchSummaryShareActions = ({ fixture, goals = [], cards = [] }: MatchSummaryShareActionsProps) => {
  const { toast } = useToast();

  const handleExportSummary = () => {
    // Enhanced export functionality with time in minutes
    const summaryData = {
      fixture: fixture,
      score: `${fixture?.home_score || 0}-${fixture?.away_score || 0}`,
      match_info: {
        home_team: fixture?.home_team?.name,
        away_team: fixture?.away_team?.name,
        home_score: fixture?.home_score || 0,
        away_score: fixture?.away_score || 0,
        match_date: fixture?.match_date,
        venue: fixture?.venue
      },
      events: goals,
      goals_and_assists: goals.map(goal => ({
        player: goal.playerName || goal.player_name,
        team: goal.team,
        type: goal.type,
        time: `${Math.floor((goal.time || goal.event_time || 0) / 60)} min`
      })),
      statistics: {
        total_events: goals.length,
        total_goals: goals.filter(g => g.type === 'goal').length,
        total_assists: goals.filter(g => g.type === 'assist').length
      },
      export_timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(summaryData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `match-summary-${fixture?.home_team?.name}-vs-${fixture?.away_team?.name}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Match Summary Exported",
      description: "Match data has been downloaded as JSON file.",
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <Button 
        onClick={handleExportSummary} 
        variant="outline" 
        className="h-12 flex items-center justify-center gap-3 font-medium transition-all hover:scale-105"
      >
        <FileText className="h-4 w-4" />
        <span>Export Match Data</span>
      </Button>
    </div>
  );
};

export default MatchSummaryShareActions;
