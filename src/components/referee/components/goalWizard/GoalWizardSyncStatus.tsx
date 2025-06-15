
import React from "react";
import { Loader2, CheckCircle, CircleX } from "lucide-react";

type Status = "synced" | "saving" | "unsaved" | "error";

interface Props {
  status: Status;
  message?: string;
}

const GoalWizardSyncStatus: React.FC<Props> = ({ status, message }) => {
  let icon;
  let colorClass = "";
  let label = "";

  switch (status) {
    case "saving":
      icon = <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      label = "Saving...";
      colorClass = "text-blue-500";
      break;
    case "synced":
      icon = <CheckCircle className="h-4 w-4 text-green-600" />;
      label = "Saved!";
      colorClass = "text-green-600";
      break;
    case "unsaved":
      icon = <CircleX className="h-4 w-4 text-yellow-500" />;
      label = "Unsaved";
      colorClass = "text-yellow-500";
      break;
    case "error":
      icon = <CircleX className="h-4 w-4 text-red-500" />;
      label = "Save failed";
      colorClass = "text-red-500";
      break;
  }

  return (
    <div className={`flex items-center gap-2 text-xs mt-2 ${colorClass}`}>
      {icon}
      <span>{label}{message ? `: ${message}` : ""}</span>
    </div>
  );
};

export default GoalWizardSyncStatus;
