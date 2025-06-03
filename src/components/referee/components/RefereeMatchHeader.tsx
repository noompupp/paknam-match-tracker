
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RefereeMatchHeaderProps {
  selectedFixtureData: any;
}

const RefereeMatchHeader = ({ selectedFixtureData }: RefereeMatchHeaderProps) => {
  return (
    <Card className="card-shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {selectedFixtureData?.home_team?.name} vs {selectedFixtureData?.away_team?.name}
        </CardTitle>
        <p className="text-muted-foreground">
          Match Date: {selectedFixtureData?.match_date} | Venue: {selectedFixtureData?.venue || 'TBD'}
        </p>
      </CardHeader>
    </Card>
  );
};

export default RefereeMatchHeader;
