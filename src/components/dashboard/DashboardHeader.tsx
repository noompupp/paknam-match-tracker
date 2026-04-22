
import UnifiedPageHeader from "@/components/shared/UnifiedPageHeader";
import { useTranslation } from "@/hooks/useTranslation";
import SeasonSelector from "@/components/shared/SeasonSelector";

const DashboardHeader = () => {
  const { t } = useTranslation();
  
  return (
    <UnifiedPageHeader 
      title={t('nav.dashboard')}
      logoSize="medium"
      showLanguageToggle={true}
    >
      <div className="mt-3 flex justify-end">
        <SeasonSelector />
      </div>
    </UnifiedPageHeader>
  );
};

export default DashboardHeader;

