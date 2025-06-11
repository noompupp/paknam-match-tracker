
import { useEnhancedTopScorers } from "@/hooks/usePlayerStats";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import PlayerAvatar from "./PlayerAvatar";
import { useTranslation } from "@/hooks/useTranslation";

interface TopScorersListProps {
  limit?: number;
  showViewAll?: boolean;
}

const TopScorersList = ({ limit = 10, showViewAll = false }: TopScorersListProps) => {
  const { t } = useTranslation();
  const { data: topScorers, isLoading, error } = useEnhancedTopScorers(limit);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: Math.min(5, limit) }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
              <div className="w-8 h-8 bg-muted rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-24 mb-1"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
              <div className="w-8 h-6 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t('common.error')}</p>
        <p className="text-sm text-muted-foreground mt-1">{t('message.connectionError')}</p>
      </div>
    );
  }

  if (!topScorers || topScorers.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-muted-foreground">{t('common.noData')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {topScorers.map((player, index) => (
        <div 
          key={player.id} 
          className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-background/80 to-background/40 hover:from-primary/5 hover:to-primary/10 transition-all duration-200 border border-border/30"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-muted-foreground w-6 text-center">
                #{index + 1}
              </span>
              <PlayerAvatar player={player} size="small" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{player.name}</p>
              <p className="text-xs text-muted-foreground truncate">{player.team_name}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-lg text-primary">{player.goals || 0}</p>
            <p className="text-xs text-muted-foreground">{t('common.goals')}</p>
          </div>
        </div>
      ))}
      
      {showViewAll && (
        <Button variant="ghost" className="w-full mt-4" size="sm">
          {t('dashboard.viewAll')}
        </Button>
      )}
    </div>
  );
};

export default TopScorersList;
