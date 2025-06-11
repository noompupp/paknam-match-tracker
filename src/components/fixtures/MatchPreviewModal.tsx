
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
import { usePlatformDetection } from "@/hooks/usePlatformDetection";

interface MatchPreviewModalProps {
  fixture: Fixture | null;
  isOpen: boolean;
  onClose: () => void;
}

const MatchPreviewModal = ({ fixture, isOpen, onClose }: MatchPreviewModalProps) => {
  const [matchData, setMatchData] = useState<EnhancedMatchData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isMobile } = usePlatformDetection();

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
      <EnhancedDialogContent className="w-[100vw] h-[100vh] sm:w-[95vw] sm:h-auto sm:max-w-4xl sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 sm:rounded-lg">
        <EnhancedDialogHeader className="pb-3 sm:pb-4">
          <EnhancedDialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
            Match Preview
          </EnhancedDialogTitle>
        </EnhancedDialogHeader>

        <div className="space-y-4 sm:space-y-6">
          <MatchPreviewModalContent 
            matchData={matchData}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </EnhancedDialogContent>
    </EnhancedDialog>
  );
};

export default MatchPreviewModal;
