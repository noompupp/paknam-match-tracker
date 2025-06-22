
import { MatchSaveStatusProvider } from "../hooks/useMatchSaveStatus";
import RefereeToolsContainer from "../RefereeToolsContainer";

const RefereeToolsProvider = () => {
  return (
    <MatchSaveStatusProvider>
      <RefereeToolsContainer />
    </MatchSaveStatusProvider>
  );
};

export default RefereeToolsProvider;
