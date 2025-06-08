
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Home, Plane } from "lucide-react";

interface TeamSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamSelect: (team: 'home' | 'away') => void;
  homeTeamName: string;
  awayTeamName: string;
  title: string;
  description: string;
}

const TeamSelectionModal = ({
  isOpen,
  onClose,
  onTeamSelect,
  homeTeamName,
  awayTeamName,
  title,
  description
}: TeamSelectionModalProps) => {
  const handleTeamSelect = (team: 'home' | 'away') => {
    onTeamSelect(team);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleTeamSelect('home')}
              variant="outline"
              className="h-16 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
            >
              <Home className="h-5 w-5 text-blue-600" />
              <div className="text-center">
                <div className="font-medium">Home Team</div>
                <div className="text-xs text-muted-foreground">{homeTeamName}</div>
              </div>
            </Button>
            
            <Button
              onClick={() => handleTeamSelect('away')}
              variant="outline"
              className="h-16 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
            >
              <Plane className="h-5 w-5 text-blue-600" />
              <div className="text-center">
                <div className="font-medium">Away Team</div>
                <div className="text-xs text-muted-foreground">{awayTeamName}</div>
              </div>
            </Button>
          </div>
          
          <Button 
            onClick={onClose} 
            variant="ghost" 
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamSelectionModal;
