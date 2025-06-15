
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Clock, FileText, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const RefereeTabsNavigation = () => {
  const { t } = useTranslation();

  return (
    <TabsList className="grid w-full grid-cols-4">
      <TabsTrigger value="timer-tracking" className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <span className="hidden sm:inline">{t('referee.tab.timer')}</span>
      </TabsTrigger>
      <TabsTrigger value="score" className="flex items-center gap-2">
        <Trophy className="h-4 w-4" />
        <span className="hidden sm:inline">{t('referee.tab.score')}</span>
      </TabsTrigger>
      <TabsTrigger value="cards" className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <span className="hidden sm:inline">{t('referee.tab.cards')}</span>
      </TabsTrigger>
      <TabsTrigger value="summary" className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">{t('referee.tab.summary')}</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default RefereeTabsNavigation;
