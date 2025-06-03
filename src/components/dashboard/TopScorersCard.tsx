
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

interface TopScorer {
  name: string;
  team: string;
  goals: number;
}

interface TopScorersCardProps {
  topScorers: TopScorer[] | undefined;
  isLoading: boolean;
}

const TopScorersCard = ({ topScorers, isLoading }: TopScorersCardProps) => {
  return (
    <Card className="card-shadow-lg animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">Top Scorers</CardTitle>
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-8" />
            </div>
          ))
        ) : topScorers && topScorers.length > 0 ? (
          topScorers.map((scorer, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                  {index + 1}
                </Badge>
                <div>
                  <p className="font-semibold">{scorer.name}</p>
                  <p className="text-sm text-muted-foreground">{scorer.team}</p>
                </div>
              </div>
              <Badge className="bg-primary text-primary-foreground">{scorer.goals}</Badge>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-4">
            No scorer data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopScorersCard;
