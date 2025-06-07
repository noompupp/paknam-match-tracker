
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Target } from "lucide-react";

interface RankingPlayer {
  name: string;
  team: string;
  goals?: number;
  assists?: number;
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

  const getIcon = () => {
    return statType === 'goals' ? Trophy : Target;
  };

  const Icon = getIcon();

  const getStatColor = () => {
    return statType === 'goals' ? 'bg-primary text-primary-foreground' : 'bg-blue-600 text-white';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Icon className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {error ? (
            <div className="text-center text-destructive py-8">
              <p className="font-medium">Error loading ranking data</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error.message || `Unable to fetch ${statType} ranking`}
              </p>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-8" />
                </div>
              ))}
            </div>
          ) : players && players.length > 0 ? (
            <div className="space-y-2">
              {players.map((player, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors border"
                >
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant="outline" 
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                    >
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-semibold text-sm">{player.name}</p>
                      <p className="text-xs text-muted-foreground">{player.team}</p>
                    </div>
                  </div>
                  <Badge className={`${getStatColor()} font-bold`}>
                    {getStatValue(player)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No {statType} data yet</p>
              <p className="text-sm mt-1">
                {statType === 'goals' ? 'Goals' : 'Assists'} will appear here once matches are played
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FullRankingModal;
