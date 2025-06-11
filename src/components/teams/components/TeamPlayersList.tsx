
import { Member, Team } from "@/types/database";
import EnhancedTeamPlayersList from "./EnhancedTeamPlayersList";

interface TeamPlayersListProps {
  players: Member[];
  teamData?: Team;
}

const TeamPlayersList = ({ players, teamData }: TeamPlayersListProps) => {
  return (
    <EnhancedTeamPlayersList 
      players={players} 
      teamData={teamData}
    />
  );
};

export default TeamPlayersList;
