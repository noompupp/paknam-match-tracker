
import { Button } from "@/components/ui/button";
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
    const homeScore = fixture?.home_score || goals.filter(g => g.team_id === fixture?.home_team_id).length;
    const awayScore = fixture?.away_score || goals.filter(g => g.team_id === fixture?.away_team_id).length;
    return `${homeTeam} ${homeScore}-${awayScore} ${awayTeam}`;
  };

  const getShareText = () => {
    const matchTitle = getMatchTitle();
    const date = fixture?.match_date ? new Date(fixture.match_date).toLocaleDateString() : new Date().toLocaleDateString();
    return `Match Summary: ${matchTitle} - ${date}`;
  };

  const findExportElement = () => {
    const element = document.getElementById('match-summary-content');
    console.log('🔍 Export element search:', {
      found: !!element,
      elementId: element?.id,
      className: element?.className,
      hasExportMode: element?.hasAttribute('data-export-mode')
    });
    return element;
  };

  const enableExportMode = () => {
    const element = findExportElement();
    if (element) {
      element.setAttribute('data-export-mode', 'true');
      element.classList.add('export-mode');
      if (isMobile) {
        element.classList.add('export-mode-mobile');
      }
      console.log('🔧 Export mode enabled for element:', {
        elementId: element.id,
        classes: element.className,
        isMobile
      });
      return true;
    } else {
      console.error('❌ Export element not found - cannot enable export mode');
      return false;
    }
  };

  const disableExportMode = () => {
    const element = findExportElement();
    if (element) {
      element.removeAttribute('data-export-mode');
      element.classList.remove('export-mode', 'export-mode-mobile');
      console.log('🔧 Export mode disabled for element:', element.id);
    }
  };

  const handleSaveToCameraRoll = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);

    try {
      console.log('💾 Starting save to camera roll process...');
      
      const exportEnabled = enableExportMode();
      if (!exportEnabled) {
        throw new Error('Could not find export element');
      }
      
      // Wait for layout to settle and styles to apply
      await new Promise(resolve => setTimeout(resolve, 300));

      const filename = `match-summary-${getMatchTitle().replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${fixture?.match_date?.split('T')[0] || 'today'}.jpg`;
      
      console.log('📸 Capturing image for sharing...');
      const imageBlob = await captureImageForSharing('match-summary-content');
      
      console.log('💾 Saving image to device...');
      await saveImageToDevice(imageBlob, filename);
      
      toast({
        title: "✅ Saved Successfully",
        description: "Match summary has been saved to your device.",
      });
    } catch (error) {
      console.error('❌ Save failed:', error);
      toast({
        title: "❌ Save Failed",
        description: `Unable to save image: ${error.message}`,
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
      console.log('📱 Starting share to story process...');
      
      const exportEnabled = enableExportMode();
      if (!exportEnabled) {
        throw new Error('Could not find export element');
      }
      
      // Wait for layout to settle and styles to apply
      await new Promise(resolve => setTimeout(resolve, 300));

      const title = getMatchTitle();
      const text = getShareText();
      
      console.log('📸 Capturing image for sharing...');
      const imageBlob = await captureImageForSharing('match-summary-content');
      
      console.log('📤 Sharing image...');
      await shareImage(imageBlob, title, text);
      
      toast({
        title: "📤 Ready to Share",
        description: "Opening share dialog...",
      });
    } catch (error) {
      console.error('❌ Share failed:', error);
      toast({
        title: "⚠️ Share Unavailable",
        description: "Saving to device instead.",
        variant: "destructive",
      });
      
      // Fallback to save
      try {
        await handleSaveToCameraRoll();
      } catch (saveError) {
        console.error('❌ Fallback save failed:', saveError);
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
        className={`${isMobile ? 'h-14 text-base' : 'h-12'} flex items-center justify-center gap-3 font-medium transition-all hover:scale-105 bg-blue-50 hover:bg-blue-100 border-blue-200`}
      >
        <span className={`${isMobile ? 'text-xl' : 'text-lg'}`}>💾</span>
        <span>Save to Camera Roll</span>
      </Button>
      
      <Button 
        onClick={handleShareToStory} 
        variant="outline" 
        disabled={isProcessing}
        className={`${isMobile ? 'h-14 text-base' : 'h-12'} flex items-center justify-center gap-3 font-medium transition-all hover:scale-105 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200`}
      >
        <span className={`${isMobile ? 'text-xl' : 'text-lg'}`}>📱</span>
        <span>Share to Story</span>
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
  );
};

export default MatchSummaryShareActions;
