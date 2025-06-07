
import { Button } from "@/components/ui/button";
import { Download, Share, Instagram } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { captureImageForSharing, saveImageToDevice, shareImage } from "@/utils/exportUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

interface MatchSummaryShareActionsProps {
  fixture: any;
  goals?: any[];
  cards?: any[];
}

const MatchSummaryShareActions = ({ fixture, goals = [], cards = [] }: MatchSummaryShareActionsProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isProcessing, setIsProcessing] = useState(false);

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

  const enableExportMode = () => {
    const element = document.getElementById('match-summary-content');
    if (element && isMobile) {
      element.setAttribute('data-export-mode', 'true');
      element.classList.add('export-mode-mobile');
      // Force a reflow
      element.offsetHeight;
    }
  };

  const disableExportMode = () => {
    const element = document.getElementById('match-summary-content');
    if (element && isMobile) {
      element.removeAttribute('data-export-mode');
      element.classList.remove('export-mode-mobile');
    }
  };

  const handleSaveToCameraRoll = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);

    try {
      enableExportMode();
      
      // Wait longer for layout to settle with new design
      await new Promise(resolve => setTimeout(resolve, 300));

      const filename = `match-summary-${getMatchTitle().replace(/\s+/g, '-').toLowerCase()}-${fixture?.match_date || 'today'}.jpg`;
      
      const imageBlob = await captureImageForSharing('match-summary-content');
      await saveImageToDevice(imageBlob, filename);
      
      toast({
        title: "📥 Saved to Device",
        description: "Instagram Story format image saved to your camera roll!",
      });
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save image. Please try again.",
        variant: "destructive",
      });
    } finally {
      disableExportMode();
      setIsProcessing(false);
    }
  };

  const handleShareToStory = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);

    try {
      enableExportMode();
      
      // Wait longer for layout to settle with new design
      await new Promise(resolve => setTimeout(resolve, 300));

      const title = getMatchTitle();
      const text = getShareText();
      
      const imageBlob = await captureImageForSharing('match-summary-content');
      await shareImage(imageBlob, title, text);
      
      toast({
        title: "📤 Ready to Share!",
        description: "Instagram Story format image ready for sharing!",
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
      disableExportMode();
      setIsProcessing(false);
    }
  };

  return (
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
        <Instagram className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
        <span>📱 Share to Story</span>
      </Button>
      
      {isProcessing && (
        <div className={`${isMobile ? 'col-span-1' : 'col-span-2'} text-center text-sm text-muted-foreground`}>
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
            Optimizing for social media...
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchSummaryShareActions;
