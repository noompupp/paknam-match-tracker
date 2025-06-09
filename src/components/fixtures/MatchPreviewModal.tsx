
import { useState, useEffect } from "react";
import { 
  EnhancedDialog,
  EnhancedDialogContent,
  EnhancedDialogHeader,
  EnhancedDialogTitle,
} from "@/components/ui/enhanced-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Fixture } from "@/types/database";
import { enhancedMatchDataService, EnhancedMatchData } from "@/services/fixtures/enhancedMatchDataService";
import MatchPreviewHeader from "./components/MatchPreviewHeader";
import MatchPreviewOverview from "./components/MatchPreviewOverview";
import MatchPreviewSquads from "./components/MatchPreviewSquads";
import MatchPreviewForm from "./components/MatchPreviewForm";

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
      <EnhancedDialogContent className="w-full h-full max-w-none max-h-none p-0 sm:max-w-4xl sm:max-h-[90vh] sm:h-auto sm:p-6 sm:rounded-lg">
        <div className="flex flex-col h-full">
          <EnhancedDialogHeader className="px-4 py-3 sm:px-0 sm:py-0 border-b sm:border-b-0">
            <EnhancedDialogTitle className="text-lg font-bold">
              Match Preview
            </EnhancedDialogTitle>
          </EnhancedDialogHeader>

          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-center gap-4 p-6">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : error ? (
              <div className="p-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            ) : matchData ? (
              <ScrollArea className="h-full">
                <div className="p-4 sm:p-0">
                  <MatchPreviewHeader 
                    fixture={matchData.fixture}
                    homeTeam={matchData.homeTeam}
                    awayTeam={matchData.awayTeam}
                  />
                  
                  <Tabs defaultValue="overview" className="mt-6">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                      <TabsTrigger value="squads" className="text-xs sm:text-sm">Squads</TabsTrigger>
                      <TabsTrigger value="form" className="text-xs sm:text-sm">Form</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="mt-4">
                      <MatchPreviewOverview 
                        homeTeam={matchData.homeTeam}
                        awayTeam={matchData.awayTeam}
                        headToHead={matchData.headToHead}
                      />
                    </TabsContent>
                    
                    <TabsContent value="squads" className="mt-4">
                      <MatchPreviewSquads 
                        homeTeam={matchData.homeTeam}
                        awayTeam={matchData.awayTeam}
                        homeSquad={matchData.homeSquad}
                        awaySquad={matchData.awaySquad}
                      />
                    </TabsContent>
                    
                    <TabsContent value="form" className="mt-4">
                      <MatchPreviewForm 
                        homeTeam={matchData.homeTeam}
                        awayTeam={matchData.awayTeam}
                        recentForm={matchData.recentForm}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </ScrollArea>
            ) : null}
          </div>
        </div>
      </EnhancedDialogContent>
    </EnhancedDialog>
  );
};

export default MatchPreviewModal;
