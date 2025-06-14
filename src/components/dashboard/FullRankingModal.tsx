import { EnhancedDialog, EnhancedDialogContent, EnhancedDialogHeader, EnhancedDialogTitle } from "@/components/ui/enhanced-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Target } from "lucide-react";
import MiniPlayerAvatar from "./MiniPlayerAvatar";

// Consistent highlight styles for top 3, supporting dark mode
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

  // Max height of player list, triggers scroll if list is long
  const PLAYER_LIST_MAX_HEIGHT = "min-h-[220px] max-h-[56vh] sm:max-h-[440px]"; // fallback for modal workflows

  return (
    <EnhancedDialog open={isOpen} onOpenChange={onClose}>
      <EnhancedDialogContent className="w-[98vw] sm:max-w-lg sm:w-auto flex flex-col py-2 px-2 rounded-xl">
        <EnhancedDialogHeader className="flex-shrink-0 pb-3 px-2 sm:px-4">
          <EnhancedDialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
            <Icon className="h-5 w-5 text-primary" />
            <span className="truncate">{title}</span>
          </EnhancedDialogTitle>
        </EnhancedDialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {error ? (
            <div className="flex flex-col items-center pt-10 pb-8 px-2">
              <Icon className="h-10 w-10 mb-2 opacity-40" />
              <p className="font-semibold text-base mb-1">Error loading data</p>
              <p className="text-xs text-destructive">{error.message || `Unable to fetch ${statType} ranking`}</p>
            </div>
          ) : isLoading ? (
            <div className={`space-y-2 ${PLAYER_LIST_MAX_HEIGHT} overflow-y-auto px-1 pb-1`}>
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between gap-2 p-2 rounded-md border shadow-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <Skeleton className="w-7 h-7 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-2 w-14" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-8 rounded-full" />
                </div>
              ))}
            </div>
          ) : players && players.length > 0 ? (
            <div className={`space-y-1 overflow-y-auto ${PLAYER_LIST_MAX_HEIGHT} px-0.5 pb-1`}>
              {players.map((player, index) => {
                // Debug log for modal avatar
                // console.log("[Avatar Debug]", { id: player.id, name: player.name, profileImageUrl: player.profileImageUrl, player, });
                const isTop3 = index < 3;
                const rankClass = isTop3
                  ? `${rankStyles[index]} border-2 ring-[2px] ring-inset`
                  : "hover:bg-muted/40";
                // Compact: keep row tight
                return (
                  <div 
                    key={`${player.id ?? index}-${player.profileImageUrl ?? "none"}`}
                    className={`flex items-center justify-between rounded-lg border bg-card shadow-sm transition mb-0 px-2 py-1 min-h-[38px] ${rankClass}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge 
                        variant="outline" 
                        className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs p-0.5 bg-white/90 border-zinc-200"
                      >
                        {index + 1}
                      </Badge>
                      <MiniPlayerAvatar
                        name={player.name}
                        imageUrl={player.profileImageUrl}
                        size={28}
                        className="flex-shrink-0"
                      />
                      <div className="truncate max-w-[112px]">
                        <p className="font-medium text-[15px] truncate">{player.name}</p>
                        <p className="text-xs text-muted-foreground truncate leading-tight">{player.team}</p>
                      </div>
                    </div>
                    <Badge className={`font-bold text-sm px-2 py-0.5 ${getStatColor()} shadow`}>
                      {getStatValue(player)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center pt-10 pb-8 px-2">
              <Icon className="h-10 w-10 mb-3 opacity-20" />
              <p className="font-semibold text-base mb-1">No {statType} data yet</p>
              <p className="text-sm text-muted-foreground text-center">
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
