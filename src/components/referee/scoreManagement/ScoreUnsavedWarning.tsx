
import React from "react";

const ScoreUnsavedWarning: React.FC<{ hasScoreChange: boolean }> = ({ hasScoreChange }) =>
  hasScoreChange ? (
    <div className="text-xs text-orange-600 text-center bg-orange-50 p-2 rounded border border-orange-200">
      ⚠️ You have unsaved changes. Click "Save Changes" to update the database.
    </div>
  ) : null;

export default ScoreUnsavedWarning;
