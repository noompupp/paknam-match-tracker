import { EnhancedDialog, EnhancedDialogContent, EnhancedDialogHeader, EnhancedDialogTitle } from "@/components/ui/enhanced-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Target } from "lucide-react";
import MiniPlayerAvatar from "./MiniPlayerAvatar";

// Updated dark mode friendly medal styling for top 3 (matches other components)
const rankStyles = [
  "bg-yellow-50 border-yellow-300 shadow-gold dark:bg-yellow-950 dark:border-yellow-900",
  "bg-gray-50 border-gray-300 shadow-silver dark:bg-zinc-900 dark:border-zinc-700",
  "bg-orange-50 border-orange-200 shadow-bronze dark:bg-orange-950 dark:border-orange-900"
];

interface RankingPlayer {
  id?: number | string;
  name: string;
  team: string;
  goals?: number;
  assists?: number;
  profileImageUrl?: string | null;
  optimized_avatar_url?: string | null;
  ProfileURL?: string | null;
  profile_picture?: string | null;
}

interface FullRankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  players: RankingPlayer[] | undefined;
  isLoading: boolean;
  error?: Error | null;
  statType: 'goals' | 'assists';
}

const FullRankingModal = ({
  isOpen,
  onClose,
  title,
  players,
  isLoading,
  error,
  statType
}: FullRankingModalProps) => {
  const getStatValue = (player: RankingPlayer) => {
    return statType === 'goals' ? player.goals || 0 : player.assists || 0;
  };

  const Icon = Target;

  const getStatColor = () => {
    return statType === 'goals' ? 'bg-primary text-primary-foreground' : 'bg-blue-600 text-white';
  };

  // 🚨 REMOVE legacy helper. Avatar image will be passed explicitly.

  return (
    <EnhancedDialog open={isOpen} onOpenChange={onClose}>
      <EnhancedDialogContent className="w-[100vw] h-[100vh] sm:w-auto sm:h-auto sm:max-w-md sm:max-h-[85vh] overflow-hidden flex flex-col p-4 sm:p-6 sm:rounded-lg">
        <EnhancedDialogHeader className="flex-shrink-0 pb-4">
          <EnhancedDialogTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold">
            <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            <span className="truncate">{title}</span>
          </EnhancedDialogTitle>
        </EnhancedDialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {error ? (
            <div className="text-center text-destructive py-12">
              <Icon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="font-semibold text-lg mb-2">Error loading ranking data</p>
              <p className="text-sm text-muted-foreground">
                {error.message || `Unable to fetch ${statType} ranking`}
              </p>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-7 w-10 rounded-full" />
                </div>
              ))}
            </div>
          ) : players && players.length > 0 ? (
            <div className="space-y-3">
              {players.map((player, index) => {
                // Explicit logging of the avatar binding mapping
                // eslint-disable-next-line no-console
                console.log("[Avatar Debug]", player.id, player.name, player.profileImageUrl);

                const isTop3 = index < 3;
                const rankClass = isTop3
                  ? `${rankStyles[index]} border-2 ring-[2px] ring-inset`
                  : "hover:bg-muted/50";

                return (
                  <div 
                    key={player.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors border bg-card shadow-sm mb-1 ${rankClass}`}
                  >
                    <div className="flex items-center space-x-4 min-w-0">
                      <Badge 
                        variant="outline" 
                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm bg-white/80 border-zinc-200"
                      >
                        {index + 1}
                      </Badge>
                      <MiniPlayerAvatar
                        name={player.name}
                        imageUrl={player.profileImageUrl}
                        size={38}
                      />
                      <div className="truncate max-w-[140px]">
                        <p className="font-semibold text-base truncate">{player.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{player.team}</p>
                      </div>
                    </div>
                    <Badge className={`${getStatColor()} font-bold text-base px-3 py-1 shadow-md`}>
                      {getStatValue(player)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-16">
              <Icon className="h-20 w-20 mx-auto mb-6 opacity-30" />
              <p className="font-semibold text-lg mb-2">No {statType} data yet</p>
              <p className="text-base">
                {statType === "goals" ? "Goals" : "Assists"} will appear here once matches are played
              </p>
            </div>
          )}
        </div>
      </EnhancedDialogContent>
    </EnhancedDialog>
  );
};

export default FullRankingModal;
