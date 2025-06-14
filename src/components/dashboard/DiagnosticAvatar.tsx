
import React, { useState } from "react";

type DiagnosticAvatarProps = {
  name: string;
  imageUrl?: string;
  playerId?: string | number;
};

export const DiagnosticAvatar: React.FC<DiagnosticAvatarProps> = ({
  name,
  imageUrl,
  playerId,
}) => {
  const [imgError, setImgError] = useState(false);

  const fallbackInitials = name
    ? name
        .split(" ")
        .map((n) => n[0]?.toUpperCase())
        .slice(0, 2)
        .join("")
    : "NA";

  console.log("[DiagnosticAvatar]", {
    name,
    imageUrl,
    playerId,
    fallbackUsed: imgError || !imageUrl,
  });

  return (
    <div className="flex flex-col items-center justify-center text-xs text-gray-600">
      <div className="h-10 w-10 rounded-full border border-gray-300 overflow-hidden bg-white">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-200 text-sm font-semibold">
            {fallbackInitials}
          </div>
        )}
      </div>
      <div className="mt-1 text-[10px] text-center">
        {playerId ? `ID: ${playerId}` : "No ID"}
      </div>
    </div>
  );
};

export default DiagnosticAvatar;
