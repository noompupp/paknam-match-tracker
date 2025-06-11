
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Eye } from "lucide-react";
import { Team } from "@/types/database";
import TeamLogo from "./TeamLogo";
import LoadingCard from "../fixtures/LoadingCard";
import { useTranslation } from "@/hooks/useTranslation";

interface TeamsGridProps {
  teams: Team[] | undefined;
  isLoading: boolean;
  onViewSquad: (teamId: number) => void;
}

const TeamsGrid = ({ teams, isLoading, onViewSquad }: TeamsGridProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5 text-primary" />
            {t('common.loading')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5 text-primary" />
            {t('page.teams')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">{t('common.noData')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Users className="h-5 w-5 text-primary" />
          {t('page.teams')} ({teams.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {teams.map((team) => (
            <div 
              key={team.id} 
              className="group p-4 rounded-lg border border-border/50 bg-gradient-to-br from-background to-background/80 hover:border-primary/30 hover:shadow-lg transition-all duration-200"
            >
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <TeamLogo team={team} size="large" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {team.name}
                  </h3>
                </div>
                <Button
                  onClick={() => onViewSquad(team.id)}
                  size="sm"
                  className="w-full"
                  variant="outline"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {t('teams.viewSquad')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamsGrid;
