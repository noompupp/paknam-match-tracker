
import ImprovedMatchSelection from "./ImprovedMatchSelection";
import UnifiedPageHeader from "@/components/shared/UnifiedPageHeader";
import { useTranslation } from "@/hooks/useTranslation";

interface RefereeToolsHeaderProps {
  fixtures: any[];
  selectedFixture: string;
  onFixtureChange: (value: string) => void;
  enhancedPlayersData: {
    hasValidData: boolean;
    dataIssues: string[];
  };
}

const RefereeToolsHeader = ({
  fixtures,
  selectedFixture,
  onFixtureChange,
  enhancedPlayersData
}: RefereeToolsHeaderProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      <UnifiedPageHeader 
        title={t('page.referee')}
        logoSize="small"
        showLanguageToggle={true}
      />
      
      <div className="max-w-7xl mx-auto px-4">
        <ImprovedMatchSelection
          fixtures={fixtures}
          selectedFixture={selectedFixture}
          onFixtureChange={onFixtureChange}
          enhancedPlayersData={enhancedPlayersData}
        />
      </div>
    </div>
  );
};

export default RefereeToolsHeader;
