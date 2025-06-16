
import React from 'react';
import { CheckCircle, AlertCircle, Loader2, Clock } from "lucide-react";

interface GoalWizardSyncStatusProps {
  status: "unsaved" | "saving" | "synced" | "error";
  message?: string;
}

const GoalWizardSyncStatus = ({ status, message }: GoalWizardSyncStatusProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'saving':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'unsaved':
      default:
        return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'saving':
        return 'Saving...';
      case 'synced':
        return 'Synced';
      case 'error':
        return 'Error';
      case 'unsaved':
      default:
        return 'Unsaved';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'saving':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'synced':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'unsaved':
      default:
        return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };

  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium ${getStatusColor()}`}>
      {getStatusIcon()}
      <span>{message || getStatusText()}</span>
    </div>
  );
};

export default GoalWizardSyncStatus;
