
import { MatchSaveStatusProvider } from "../hooks/useMatchSaveStatus";
import RefereeToolsContent from "./RefereeToolsContent";

const RefereeToolsProvider = () => {
  return (
    <MatchSaveStatusProvider>
      <RefereeToolsContent />
    </MatchSaveStatusProvider>
  );
};

export default RefereeToolsProvider;
