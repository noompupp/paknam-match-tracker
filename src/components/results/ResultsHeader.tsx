
import UnifiedPageHeader from "@/components/shared/UnifiedPageHeader";
import { useTranslation } from "@/hooks/useTranslation";

const ResultsHeader = () => {
  const { t } = useTranslation();
  
  return (
    <UnifiedPageHeader 
      title={t('page.results')}
      logoSize="small"
      showLanguageToggle={true}
    />
  );
};

export default ResultsHeader;
