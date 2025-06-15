
import React from "react";

// Small pulsing red dot, can be absolutely positioned or inline
const PulseDotBadge: React.FC<{ className?: string }> = ({ className }) => (
  <span
    className={[
      "relative flex h-3 w-3",
      className || "",
    ].join(" ")}
  >
    <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
  </span>
);

export default PulseDotBadge;
