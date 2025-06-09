
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { useFilteredScorersRanking } from "@/hooks/useFullRankingData";
import FullRankingModal from "./FullRankingModal";

interface TopScorer {
  name: string;
  team: string;
  goals: number;
}

interface TopScorersCardProps {
  topScorers: TopScorer[] | undefined;
  isLoading: boolean;
  error?: Error | null;
}

const TopScorersCard = ({ topScorers, isLoading, error }: TopScorersCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { 
    data: fullRanking, 
    isLoading: fullRankingLoading, 
    error: fullRankingError 
  } = useFilteredScorersRanking();

  const handleSeeAllClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Card className="card-shadow-lg animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl font-bold">Top Scorers</CardTitle>
          <button
            onClick={handleSeeAllClick}
            className="p-1 rounded-full hover:bg-muted/50 transition-colors"
            aria-label="See full scorers ranking"
          >
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-4 px-3 sm:px-6">
          {error ? (
            <div className="text-center text-destructive py-3 sm:py-4">
              <p className="font-medium text-sm">Error loading scorer data</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {error.message || 'Unable to fetch top scorers'}
              </p>
            </div>
          ) : isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between p-2 sm:p-3 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-20 sm:h-4 sm:w-24" />
                    <Skeleton className="h-2 w-12 sm:h-3 sm:w-16" />
                  </div>
                </div>
                <Skeleton className="h-5 w-6 sm:h-6 sm:w-8" />
              </div>
            ))
          ) : topScorers && topScorers.length > 0 ? (
            topScorers.map((scorer, index) => (
              <div key={index} className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Badge variant="outline" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-semibold text-sm">{scorer.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{scorer.team}</p>
                  </div>
                </div>
                <Badge className="bg-primary text-primary-foreground text-xs">{scorer.goals}</Badge>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-6 sm:py-8">
              <p className="font-medium text-sm">No scoring data yet</p>
              <p className="text-xs sm:text-sm mt-1">Goals will appear here once matches are played</p>
            </div>
          )}
        </CardContent>
      </Card>

      <FullRankingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Top Scorers - Full Ranking"
        players={fullRanking}
        isLoading={fullRankingLoading}
        error={fullRankingError}
        statType="goals"
      />
    </>
  );
};

export default TopScorersCard;
