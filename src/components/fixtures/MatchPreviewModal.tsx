
import { useState, useEffect } from "react";
import { 
  EnhancedDialog,
  EnhancedDialogContent,
  EnhancedDialogHeader,
  EnhancedDialogTitle,
} from "@/components/ui/enhanced-dialog";
import { Fixture } from "@/types/database";
import { enhancedMatchDataService, EnhancedMatchData } from "@/services/fixtures/enhancedMatchDataService";
import MatchPreviewModalContent from "./components/MatchPreviewModalContent";

interface MatchPreviewModalProps {
  fixture: Fixture | null;
  isOpen: boolean;
  onClose: () => void;
}

const MatchPreviewModal = ({ fixture, isOpen, onClose }: MatchPreviewModalProps) => {
  const [matchData, setMatchData] = useState<EnhancedMatchData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (fixture && isOpen) {
      fetchMatchData();
    }
  }, [fixture, isOpen]);

  const fetchMatchData = async () => {
    if (!fixture) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await enhancedMatchDataService.getMatchData(fixture.id);
      if (data) {
        setMatchData(data);
      } else {
        setError('Failed to load match data');
      }
    } catch (err) {
      console.error('Error fetching match data:', err);
      setError('An error occurred while loading match data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMatchData(null);
    setError(null);
    onClose();
  };

  if (!fixture) return null;

  return (
    <EnhancedDialog open={isOpen} onOpenChange={handleClose}>
      <EnhancedDialogContent className="w-[95vw] max-w-4xl max-h-[90vh] p-0 bg-gradient-to-b from-background via-background to-muted/20">
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Fixed Header */}
          <EnhancedDialogHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm flex-shrink-0">
            <EnhancedDialogTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Match Preview
            </EnhancedDialogTitle>
          </EnhancedDialogHeader>

          {/* Scrollable Content Container */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/50">
            <MatchPreviewModalContent 
              matchData={matchData}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </EnhancedDialogContent>
    </EnhancedDialog>
  );
};

export default MatchPreviewModal;
