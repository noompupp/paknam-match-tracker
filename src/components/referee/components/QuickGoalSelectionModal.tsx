
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuickGoal {
  id: number;
  event_time: number;
  team_id: string;
  description: string;
  created_at: string;
}

interface QuickGoalSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalSelected: (goal: QuickGoal) => void;
  fixtureId?: number;
  formatTime: (seconds: number) => string;
  homeTeamName?: string;
  awayTeamName?: string;
}

const QuickGoalSelectionModal = ({
  isOpen,
  onClose,
  onGoalSelected,
  fixtureId,
  formatTime,
  homeTeamName = 'Home Team',
  awayTeamName = 'Away Team'
}: QuickGoalSelectionModalProps) => {
  const [quickGoals, setQuickGoals] = useState<QuickGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchQuickGoals = async () => {
    if (!fixtureId) return;

    setIsLoading(true);
    try {
      console.log('🔍 QuickGoalSelectionModal: Fetching quick goals for fixture:', fixtureId);
      
      const { data: goals, error } = await supabase
        .from('match_events')
        .select('*')
        .eq('fixture_id', fixtureId)
        .eq('event_type', 'goal')
        .eq('player_name', 'Quick Goal')
        .order('event_time', { ascending: true });

      if (error) {
        console.error('❌ QuickGoalSelectionModal: Error fetching quick goals:', error);
        toast({
          title: "Error Loading Goals",
          description: "Failed to load quick goals",
          variant: "destructive"
        });
        return;
      }

      console.log('📊 QuickGoalSelectionModal: Found quick goals:', goals);
      setQuickGoals(goals || []);

    } catch (error) {
      console.error('❌ QuickGoalSelectionModal: Unexpected error:', error);
      toast({
        title: "Error Loading Goals",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && fixtureId) {
      fetchQuickGoals();
    }
  }, [isOpen, fixtureId]);

  const getTeamName = (teamId: string) => {
    // This is a simplified approach - in a real implementation, you'd want to 
    // fetch the actual team data or pass it as props
    return teamId.includes('home') || teamId === homeTeamName ? homeTeamName : awayTeamName;
  };

  const handleGoalSelect = (goal: QuickGoal) => {
    console.log('🎯 QuickGoalSelectionModal: Goal selected:', goal);
    onGoalSelected(goal);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            Select Quick Goal to Edit
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Loading quick goals...</p>
            </div>
          )}

          {!isLoading && quickGoals.length === 0 && (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No quick goals found that need player details</p>
            </div>
          )}

          {!isLoading && quickGoals.length > 0 && (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {quickGoals.map((goal) => (
                <Card key={goal.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        <div>
                          <div className="font-medium text-sm">Quick Goal</div>
                          <div className="text-xs text-muted-foreground">
                            {getTeamName(goal.team_id)} • {formatTime(goal.event_time)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(goal.event_time)}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleGoalSelect(goal)}
                          className="h-8"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickGoalSelectionModal;
