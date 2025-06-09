
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
      <EnhancedDialogContent className="w-[95vw] h-[90vh] max-w-none max-h-none p-0 sm:max-w-4xl sm:max-h-[95vh] sm:h-auto sm:p-0 sm:rounded-lg overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header - Fixed */}
          <EnhancedDialogHeader className="px-3 py-2 sm:px-6 sm:py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
            <EnhancedDialogTitle className="text-base sm:text-lg font-bold">
              Match Preview
            </EnhancedDialogTitle>
          </EnhancedDialogHeader>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                {/* Loading skeleton */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-16 sm:h-6 sm:w-20" />
                    <Skeleton className="h-5 w-24 sm:h-6 sm:w-32" />
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 py-4 sm:py-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 sm:h-16 sm:w-16 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-20 sm:h-6 sm:w-24" />
                        <Skeleton className="h-3 w-12 sm:h-4 sm:w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-12 sm:h-12 sm:w-16" />
                    <div className="flex items-center gap-3">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-20 sm:h-6 sm:w-24" />
                        <Skeleton className="h-3 w-12 sm:h-4 sm:w-16" />
                      </div>
                      <Skeleton className="h-12 w-12 sm:h-16 sm:w-16 rounded-full" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-32 w-full sm:h-40" />
                <Skeleton className="h-24 w-full sm:h-32" />
              </div>
            ) : error ? (
              <div className="p-3 sm:p-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            ) : matchData ? (
              <ScrollArea className="h-full">
                <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Enhanced Match Header */}
                  <MatchPreviewHeader 
                    fixture={matchData.fixture}
                    homeTeam={matchData.homeTeam}
                    awayTeam={matchData.awayTeam}
                    refereeAssignment={matchData.refereeAssignment}
                    venue={matchData.venue}
                  />
                  
                  {/* Tabbed Content */}
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 h-9 sm:h-10">
                      <TabsTrigger value="overview" className="text-xs sm:text-sm font-medium py-1.5 sm:py-2">
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="squads" className="text-xs sm:text-sm font-medium py-1.5 sm:py-2">
                        Squads
                      </TabsTrigger>
                      <TabsTrigger value="form" className="text-xs sm:text-sm font-medium py-1.5 sm:py-2">
                        Form
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-0">
                      <MatchPreviewOverview 
                        homeTeam={matchData.homeTeam}
                        awayTeam={matchData.awayTeam}
                        headToHead={matchData.headToHead}
                      />
                    </TabsContent>
                    
                    <TabsContent value="squads" className="space-y-4 sm:space-y-6 mt-0">
                      <MatchPreviewSquads 
                        homeTeam={matchData.homeTeam}
                        awayTeam={matchData.awayTeam}
                        homeSquad={matchData.homeSquad}
                        awaySquad={matchData.awaySquad}
                      />
                    </TabsContent>
                    
                    <TabsContent value="form" className="space-y-4 sm:space-y-6 mt-0">
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
