
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface TeamSquadHeaderProps {
  teamName: string;
  playerCount: number;
}

const TeamSquadHeader = ({ teamName, playerCount }: TeamSquadHeaderProps) => {
  const { t } = useTranslation();
  
  return (
    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
      <CardTitle className="flex items-center gap-3 text-xl">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <span className="text-primary font-bold">{teamName}</span>
          <span className="ml-2 text-muted-foreground">{t('teams.squad')}</span>
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({playerCount} {t('teams.players')})
          </span>
        </div>
      </CardTitle>
    </CardHeader>
  );
};

export default TeamSquadHeader;
