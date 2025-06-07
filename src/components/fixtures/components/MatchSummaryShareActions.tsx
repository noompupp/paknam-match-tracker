
import { Button } from "@/components/ui/button";
import { Download, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveImageToDevice, shareImage } from "@/utils/exportUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

interface MatchSummaryShareActionsProps {
  fixture: any;
}

const MatchSummaryShareActions = ({ fixture }: MatchSummaryShareActionsProps) => {
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

  const handleSaveToCameraRoll = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const filename = `match-summary-${getMatchTitle().replace(/\s+/g, '-').toLowerCase()}-${fixture?.match_date || 'today'}.jpg`;
      await saveImageToDevice('match-summary-content', filename);
      
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
    }
  };

  const handleShareToStory = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const title = getMatchTitle();
      const text = getShareText();
      
      await shareImage('match-summary-content', title, text);
      
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
      
      // Fallback to save
      try {
        await handleSaveToCameraRoll();
      } catch (saveError) {
        console.error('Fallback save failed:', saveError);
      }
    } finally {
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
  );
};

export default MatchSummaryShareActions;
