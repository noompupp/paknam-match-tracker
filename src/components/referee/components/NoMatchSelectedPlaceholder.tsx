
import { Card, CardContent } from "@/components/ui/card";

const NoMatchSelectedPlaceholder = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-center text-muted-foreground">No match selected</p>
      </CardContent>
    </Card>
  );
};

export default NoMatchSelectedPlaceholder;
