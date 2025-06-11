
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

const NoMatchSelected = () => {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Match Selected</h3>
          <p className="text-muted-foreground">Select a fixture to manage multi-referee coordination</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoMatchSelected;
