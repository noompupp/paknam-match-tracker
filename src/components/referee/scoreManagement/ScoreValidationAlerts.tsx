
import React from "react";
import { AlertTriangle, Info } from "lucide-react";

export interface ValidationData {
  errors: string[];
  warnings: string[];
}

const ScoreValidationAlerts: React.FC<{ validation: ValidationData }> = ({ validation }) => (
  <>
    {validation.errors.length > 0 && (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-red-800 font-medium mb-1">
          <AlertTriangle className="h-4 w-4" />
          Validation Errors
        </div>
        <ul className="list-disc list-inside text-red-700 text-sm">
          {validation.errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </div>
    )}
    {validation.warnings.length > 0 && (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-center gap-2 text-yellow-800 font-medium mb-1">
          <Info className="h-4 w-4" />
          Warnings
        </div>
        <ul className="list-disc list-inside text-yellow-700 text-sm">
          {validation.warnings.map((warning, index) => (
            <li key={index}>{warning}</li>
          ))}
        </ul>
      </div>
    )}
  </>
);

export default ScoreValidationAlerts;
