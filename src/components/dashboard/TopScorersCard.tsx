import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { useFilteredScorersRanking } from "@/hooks/useFullRankingData";
import FullRankingModal from "./FullRankingModal";
import MiniPlayerAvatar from "./MiniPlayerAvatar";
import DiagnosticAvatar from "./DiagnosticAvatar";

const rankStyles = [
  "bg-yellow-50 border-yellow-300 ring-[2.5px] ring-yellow-300 dark:bg-yellow-950 dark:border-yellow-800 dark:ring-yellow-900/80",
  "bg-gray-50 border-gray-300 ring-[2.5px] ring-gray-300 dark:bg-zinc-900 dark:border-zinc-700 dark:ring-zinc-400/60",
  "bg-orange-50 border-orange-200 ring-[2.5px] ring-orange-200 dark:bg-orange-950 dark:border-orange-900 dark:ring-orange-900/70"
];

interface TopScorer {
  id?: number | string;
  name: string;
  team: string;
  goals: number;
  profileImageUrl?: string | null;
  optimized_avatar_url?: string | null;
  ProfileURL?: string | null;
  profile_picture?: string | null;
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

  const handleSeeAllClick = () => setIsModalOpen(true);

  // DIAGNOSTIC LOG: Show fullRanking being rendered
  console.log('[Card Render] TopScorersCard final fullRanking prop:', fullRanking);

  return (
    <>
      <Card className="shadow-xl border bg-card text-card-foreground transition-all duration-200 animate-fade-in">
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
            topScorers.map((scorer, index) => {
              // DIAGNOSTIC LOG inside card, right before passing to MiniPlayerAvatar/DiagnosticAvatar
              console.log("[Card Render] scorer from topScorers:", scorer);

              const isTop3 = index < 3;
              const boxShadow = isTop3
                ? "0 0 0 2px rgba(240,200,50,0.12), 0 1px 4px 0 rgba(0,0,0,0.03)"
                : undefined;

              return (
                <div
                  key={`${scorer.id ?? index}-${scorer.profileImageUrl ?? ""}`}
                  className={`flex items-center justify-between p-2 sm:p-3 rounded-lg transition-colors mb-1 ${
                    isTop3 ? `${rankStyles[index]} border ring` : "hover:bg-muted/30"
                  }`}
                  style={{
                    boxShadow: isTop3 ? boxShadow : undefined
                  }}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                    <Badge
                      variant="outline"
                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold border bg-white ${
                        isTop3 ? "shadow-sm" : ""
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {index + 1}
                      </span>
                    </Badge>
                    <div className="flex flex-col">
                      <MiniPlayerAvatar
                        name={scorer.name}
                        imageUrl={scorer.profileImageUrl}
                        size={32}
                      />
                      <span className="block text-[10px] text-center text-gray-400">Mini</span>
                    </div>
                    <div className="flex flex-col">
                      <DiagnosticAvatar
                        name={scorer.name}
                        imageUrl={scorer.profileImageUrl}
                        playerId={scorer.id}
                      />
                      <span className="block text-[10px] text-center text-blue-500">Diag</span>
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-sm truncate">{scorer.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{scorer.team}</p>
                    </div>
                  </div>
                  <Badge className="bg-primary text-primary-foreground text-xs font-bold shadow-md">{scorer.goals}</Badge>
                </div>
              );
            })
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
