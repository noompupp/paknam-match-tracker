
import { Button } from "@/components/ui/button";
import { Download, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { captureImageForSharing, saveImageToDevice, shareImage } from "@/utils/exportUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import MobileExportLayout from "./MobileExportLayout";
import { extractTeamData, processTeamEvents } from "../utils/teamDataProcessor";
import { 
  getGoalTeamId,
  getGoalPlayerName,
  getGoalTime,
  getCardTeamId,
  getCardPlayerName,
  getCardTime,
  getCardType,
  isCardRed
} from "../utils/matchSummaryDataProcessor";

interface MatchSummaryShareActionsProps {
  fixture: any;
  goals?: any[];
  cards?: any[];
}

const MatchSummaryShareActions = ({ fixture, goals = [], cards = [] }: MatchSummaryShareActionsProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showExportLayout, setShowExportLayout] = useState(false);

  const getMatchTitle = () => {
    const homeTeam = fixture?.home_team?.name || 'Home';
    const awayTeam = fixture?.away_team?.name || 'Away';
    const homeScore = fixture?.home_score || 0;
    const awayScore = fixture?.away_score || 0;
    return `${homeTeam} ${homeScore}-${awayScore} ${awayTeam}`;
  };

  const getShareText = () => {
    const matchTitle = getMatchTitle();
    const date = fixture?.match_date || new Date().toLocaleDateString();
    return `Match Summary: ${matchTitle} - ${date}`;
  };

  const createExportLayout = () => {
    // Extract team data for mobile export layout
    const teamData = extractTeamData(fixture);
    const processedEvents = processTeamEvents(goals, cards, teamData, getCardTeamId);

    const exportContainer = document.createElement('div');
    exportContainer.id = 'mobile-export-container';
    exportContainer.style.position = 'fixed';
    exportContainer.style.top = '-10000px';
    exportContainer.style.left = '-10000px';
    exportContainer.style.zIndex = '-1';
    document.body.appendChild(exportContainer);

    return { exportContainer, teamData, processedEvents };
  };

  const removeExportLayout = (container: HTMLElement) => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  const handleSaveToCameraRoll = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    let exportContainer: HTMLElement | null = null;

    try {
      if (isMobile) {
        // Create temporary export layout for mobile
        const { exportContainer: container } = createExportLayout();
        exportContainer = container;
        setShowExportLayout(true);
        
        // Wait for React to render the export layout
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const elementId = isMobile ? 'mobile-export-container' : 'match-summary-content';
      const filename = `match-summary-${getMatchTitle().replace(/\s+/g, '-').toLowerCase()}-${fixture?.match_date || 'today'}.jpg`;
      
      const imageBlob = await captureImageForSharing(elementId);
      await saveImageToDevice(imageBlob, filename);
      
      toast({
        title: "📥 Saved to Device",
        description: "Match summary has been saved to your camera roll.",
      });
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setShowExportLayout(false);
      if (exportContainer) {
        removeExportLayout(exportContainer);
      }
    }
  };

  const handleShareToStory = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    let exportContainer: HTMLElement | null = null;

    try {
      if (isMobile) {
        // Create temporary export layout for mobile
        const { exportContainer: container } = createExportLayout();
        exportContainer = container;
        setShowExportLayout(true);
        
        // Wait for React to render the export layout
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const elementId = isMobile ? 'mobile-export-container' : 'match-summary-content';
      const title = getMatchTitle();
      const text = getShareText();
      
      const imageBlob = await captureImageForSharing(elementId);
      await shareImage(imageBlob, title, text);
      
      toast({
        title: "📤 Share Successful",
        description: "Match summary ready to share!",
      });
    } catch (error) {
      console.error('Share failed:', error);
      toast({
        title: "Share Failed",
        description: "Unable to share image. Saving to device instead.",
        variant: "destructive",
      });
      
      try {
        await handleSaveToCameraRoll();
      } catch (saveError) {
        console.error('Fallback save failed:', saveError);
      }
    } finally {
      setIsProcessing(false);
      setShowExportLayout(false);
      if (exportContainer) {
        removeExportLayout(exportContainer);
      }
    }
  };

  // Extract team data for mobile export layout
  const teamData = extractTeamData(fixture);
  const processedEvents = processTeamEvents(goals, cards, teamData, getCardTeamId);

  return (
    <>
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'}`}>
        <Button 
          onClick={handleSaveToCameraRoll} 
          variant="outline" 
          disabled={isProcessing}
          className={`${isMobile ? 'h-14 text-base' : 'h-12'} flex items-center justify-center gap-3 font-medium transition-all hover:scale-105`}
        >
          <Download className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
          <span>📥 Save to Camera Roll</span>
        </Button>
        
        <Button 
          onClick={handleShareToStory} 
          variant="outline" 
          disabled={isProcessing}
          className={`${isMobile ? 'h-14 text-base' : 'h-12'} flex items-center justify-center gap-3 font-medium transition-all hover:scale-105 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200`}
        >
          <Share className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
          <span>📤 Share to Story</span>
        </Button>
        
        {isProcessing && (
          <div className={`${isMobile ? 'col-span-1' : 'col-span-2'} text-center text-sm text-muted-foreground`}>
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
              Processing image...
            </div>
          </div>
        )}
      </div>

      {/* Hidden Export Layout for Mobile Image Capture */}
      {showExportLayout && isMobile && (
        <div 
          id="mobile-export-container" 
          style={{
            position: 'fixed',
            top: '-10000px',
            left: '-10000px',
            zIndex: -1
          }}
        >
          <MobileExportLayout
            fixture={fixture}
            goals={goals}
            cards={cards}
            homeGoals={processedEvents.homeGoals}
            awayGoals={processedEvents.awayGoals}
            homeTeamColor={teamData.homeTeamColor}
            awayTeamColor={teamData.awayTeamColor}
          />
        </div>
      )}
    </>
  );
};

export default MatchSummaryShareActions;
