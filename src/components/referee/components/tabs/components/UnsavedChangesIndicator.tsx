
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface UnsavedChangesIndicatorProps {
  hasUnsavedChanges: boolean;
  unsavedItemsCount: {
    goals: number;
    cards: number;
    playerTimes: number;
  };
  onSave: () => void;
}

const UnsavedChangesIndicator = ({
  hasUnsavedChanges,
  unsavedItemsCount,
  onSave
}: UnsavedChangesIndicatorProps) => {
  if (!hasUnsavedChanges) return null;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <div>
            <div className="font-medium text-orange-800">Auto-Save Enabled</div>
            <div className="text-sm text-orange-700">
              {unsavedItemsCount.goals} goals, {unsavedItemsCount.cards} cards, {unsavedItemsCount.playerTimes} player times pending
            </div>
          </div>
          <Button 
            onClick={onSave}
            className="ml-auto"
            size="sm"
          >
            Save Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnsavedChangesIndicator;
