
import RefereeToolsContainer from "./referee/RefereeToolsContainer";
import { MatchSaveStatusProvider } from "./referee/hooks/useMatchSaveStatus";

const RefereeTools = () => {
  return (
    <MatchSaveStatusProvider>
      <RefereeToolsContainer />
    </MatchSaveStatusProvider>
  );
};

export default RefereeTools;
