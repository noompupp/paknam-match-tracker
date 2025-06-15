
import UnifiedPageHeader from "@/components/shared/UnifiedPageHeader";
import { useTranslation } from "@/hooks/useTranslation";

const FixturesHeader = () => {
  const { t } = useTranslation();
  
  return (
    <UnifiedPageHeader 
      title={t('nav.fixtures')}
      logoSize="small"
      showLanguageToggle={true}
    />
  );
};

export default FixturesHeader;

