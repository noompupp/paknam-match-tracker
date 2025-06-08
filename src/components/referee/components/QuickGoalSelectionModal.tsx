
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, AlertCircle } from "lucide-react";
import { MatchGoal } from "@/stores/useMatchStore";

interface QuickGoalSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalSelected: (goal: MatchGoal) => void;
  goals: MatchGoal[];
  formatTime: (seconds: number) => string;
  homeTeamName?: string;
  awayTeamName?: string;
}

const QuickGoalSelectionModal = ({
  isOpen,
  onClose,
  onGoalSelected,
  goals,
  formatTime,
  homeTeamName = 'Home Team',
  awayTeamName = 'Away Team'
}: QuickGoalSelectionModalProps) => {
  
  console.log('🔍 QuickGoalSelectionModal: Rendering with goals:', goals);

  const handleGoalSelect = (goal: MatchGoal) => {
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
          {goals.length === 0 && (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No quick goals found that need player details</p>
            </div>
          )}

          {goals.length > 0 && (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {goals.map((goal) => (
                <Card key={goal.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        <div>
                          <div className="font-medium text-sm">Quick Goal</div>
                          <div className="text-xs text-muted-foreground">
                            {goal.teamName} • {formatTime(goal.time)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(goal.time)}
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
