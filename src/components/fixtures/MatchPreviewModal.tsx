
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
      <EnhancedDialogContent className="w-[95vw] h-[95vh] max-w-none max-h-none p-0 sm:max-w-4xl sm:max-h-[90vh] sm:h-auto sm:rounded-lg overflow-hidden bg-gradient-to-b from-background via-background to-muted/20">
        <div className="flex flex-col h-full">
          {/* Enhanced Header */}
          <EnhancedDialogHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm flex-shrink-0">
            <EnhancedDialogTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Match Preview
            </EnhancedDialogTitle>
          </EnhancedDialogHeader>

          {/* Content - Optimized for Mobile */}
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="p-4 sm:p-6 space-y-6">
                {/* Enhanced Mobile-First Loading Skeleton */}
                <div className="space-y-4">
                  {/* Team Banner Skeletons */}
                  {[1, 2].map((i) => (
                    <div key={i} className="p-4 rounded-lg border space-y-3">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24" />
                          <div className="flex gap-2">
                            <Skeleton className="h-4 w-8" />
                            <Skeleton className="h-4 w-8" />
                            <Skeleton className="h-4 w-8" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Kickoff Section Skeleton */}
                  <div className="text-center py-6 rounded-lg border space-y-3">
                    <Skeleton className="h-6 w-20 mx-auto" />
                    <Skeleton className="h-12 w-24 mx-auto" />
                    <div className="flex justify-center gap-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>
                
                {/* Tabs Skeleton */}
                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-40 w-full" />
              </div>
            ) : error ? (
              <div className="p-4 sm:p-6">
                <Alert className="border-destructive/50 bg-destructive/5">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-destructive-foreground">
                    {error}
                  </AlertDescription>
                </Alert>
              </div>
            ) : matchData ? (
              <ScrollArea className="h-full">
                <div className="p-4 sm:p-6 space-y-6">
                  {/* New Mobile-First Match Header */}
                  <MatchPreviewHeader 
                    fixture={matchData.fixture}
                    homeTeam={matchData.homeTeam}
                    awayTeam={matchData.awayTeam}
                    refereeAssignment={matchData.refereeAssignment}
                    venue={matchData.venue}
                  />
                  
                  {/* Enhanced Mobile-Optimized Tabs */}
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6 h-12 bg-muted/50 backdrop-blur-sm">
                      <TabsTrigger 
                        value="overview" 
                        className="text-sm font-medium py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        Overview
                      </TabsTrigger>
                      <TabsTrigger 
                        value="squads" 
                        className="text-sm font-medium py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        Squads
                      </TabsTrigger>
                      <TabsTrigger 
                        value="form" 
                        className="text-sm font-medium py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                      >
                        Form
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-6 mt-0">
                      <MatchPreviewOverview 
                        homeTeam={matchData.homeTeam}
                        awayTeam={matchData.awayTeam}
                        headToHead={matchData.headToHead}
                      />
                    </TabsContent>
                    
                    <TabsContent value="squads" className="space-y-6 mt-0">
                      <MatchPreviewSquads 
                        homeTeam={matchData.homeTeam}
                        awayTeam={matchData.awayTeam}
                        homeSquad={matchData.homeSquad}
                        awaySquad={matchData.awaySquad}
                      />
                    </TabsContent>
                    
                    <TabsContent value="form" className="space-y-6 mt-0">
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
