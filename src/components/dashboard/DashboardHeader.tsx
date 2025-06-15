
import UnifiedPageHeader from "@/components/shared/UnifiedPageHeader";
import { useTranslation } from "@/hooks/useTranslation";

const DashboardHeader = () => {
  const { t } = useTranslation();
  
  return (
    <UnifiedPageHeader 
      title={t('nav.dashboard')}
      logoSize="medium"
      showLanguageToggle={true}
    />
  );
};

export default DashboardHeader;

