
import { Button } from "@/components/ui/button";
import { Download, Share, AlertCircle, CheckCircle } from "lucide-react";
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
  const [processingStage, setProcessingStage] = useState('');

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
      console.log('📱 Export mode enabled for mobile');
    }
  };

  const disableExportMode = () => {
    const element = document.getElementById('match-summary-content');
    if (element && isMobile) {
      element.removeAttribute('data-export-mode');
      element.classList.remove('export-mode-mobile');
      console.log('📱 Export mode disabled');
    }
  };

  const validateElement = () => {
    const element = document.getElementById('match-summary-content');
    if (!element) {
      throw new Error('Match summary element not found');
    }
    
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      throw new Error('Element has no visible dimensions');
    }
    
    return element;
  };

  const handleSaveToCameraRoll = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setProcessingStage('Preparing export...');

    try {
      validateElement();
      
      setProcessingStage('Optimizing layout...');
      enableExportMode();
      
      // Enhanced wait time for mobile layout
      await new Promise(resolve => setTimeout(resolve, isMobile ? 600 : 200));

      setProcessingStage('Capturing image...');
      const filename = `match-summary-${getMatchTitle().replace(/\s+/g, '-').toLowerCase()}-${fixture?.match_date || 'today'}.jpg`;
      
      const imageBlob = await captureImageForSharing('match-summary-content');
      
      setProcessingStage('Saving to device...');
      await saveImageToDevice(imageBlob, filename);
      
      toast({
        title: "📥 Successfully Saved!",
        description: "Match summary has been saved to your camera roll.",
      });
    } catch (error) {
      console.error('Save failed:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Unable to save image. Please try again.",
        variant: "destructive",
      });
    } finally {
      disableExportMode();
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  const handleShareToStory = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setProcessingStage('Preparing share...');

    try {
      validateElement();
      
      setProcessingStage('Optimizing layout...');
      enableExportMode();
      
      // Enhanced wait time for mobile layout
      await new Promise(resolve => setTimeout(resolve, isMobile ? 600 : 200));

      setProcessingStage('Capturing image...');
      const title = getMatchTitle();
      const text = getShareText();
      
      const imageBlob = await captureImageForSharing('match-summary-content');
      
      setProcessingStage('Opening share menu...');
      await shareImage(imageBlob, title, text);
      
      toast({
        title: "📤 Share Ready!",
        description: "Match summary is ready to share!",
      });
    } catch (error) {
      console.error('Share failed:', error);
      toast({
        title: "Share Failed",
        description: "Saving to device instead...",
        variant: "destructive",
      });
      
      try {
        setProcessingStage('Fallback: saving to device...');
        await handleSaveToCameraRoll();
      } catch (saveError) {
        console.error('Fallback save failed:', saveError);
        toast({
          title: "Error",
          description: "Both share and save failed. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      disableExportMode();
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  return (
    <div className={`space-y-4`}>
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'}`}>
        <Button 
          onClick={handleSaveToCameraRoll} 
          variant="outline" 
          disabled={isProcessing}
          className={`${isMobile ? 'h-14 text-base' : 'h-12'} flex items-center justify-center gap-3 font-medium transition-all hover:scale-105 disabled:opacity-70`}
        >
          {isProcessing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
          ) : (
            <Download className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
          )}
          <span>📥 Save to Camera Roll</span>
        </Button>
        
        <Button 
          onClick={handleShareToStory} 
          variant="outline" 
          disabled={isProcessing}
          className={`${isMobile ? 'h-14 text-base' : 'h-12'} flex items-center justify-center gap-3 font-medium transition-all hover:scale-105 disabled:opacity-70 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200`}
        >
          {isProcessing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
          ) : (
            <Share className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
          )}
          <span>📤 Share to Story</span>
        </Button>
      </div>
      
      {isProcessing && processingStage && (
        <div className="text-center text-sm text-muted-foreground bg-slate-50 p-3 rounded-lg border">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
            <span>{processingStage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchSummaryShareActions;
