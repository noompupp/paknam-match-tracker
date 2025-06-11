
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import TeamCard from "./TeamCard";
import { Team } from "@/types/database";

interface TeamsGridProps {
  teams: Team[] | undefined;
  isLoading: boolean;
  onViewSquad: (teamId: number) => void;
}

const TeamsGrid = ({ teams, isLoading, onViewSquad }: TeamsGridProps) => {
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="card-shadow-lg">
            <CardHeader className="text-center">
              <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
              <Skeleton className="h-6 w-32 mx-auto mb-2" />
              <div className="flex justify-center gap-2 mt-2">
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-5 w-12" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="col-span-full text-center text-white">
        <p className="text-xl mb-2">No teams found</p>
        <p className="text-white/80">Teams will appear here once they are added to the database.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team) => (
        <TeamCard 
          key={team.id} 
          team={team} 
          onViewSquad={onViewSquad}
        />
      ))}
    </div>
  );
};

export default TeamsGrid;
