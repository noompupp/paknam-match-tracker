
import { Trophy } from "lucide-react";
import { useState, useEffect } from "react";

interface TournamentLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const TournamentLogo = ({ size = 'medium', className = '' }: TournamentLogoProps) => {
  const [logoUrl] = useState<string>("http://sangthongkrabi.com/wp-content/uploads/2025/06/Andaman-Paknam-FC-Logo.png");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Test if the external image is accessible
    const img = new Image();
    img.onload = () => {
      setIsLoading(false);
      setHasError(false);
    };
    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
    };
    img.src = logoUrl;
  }, [logoUrl]);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8';
      case 'large':
        return 'w-16 h-16';
      default:
        return 'w-12 h-12';
    }
  };

  const sizeClasses = getSizeClasses();

  const getFallbackIcon = () => (
    <Trophy className={`${size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-8 h-8' : 'w-6 h-6'} text-white`} />
  );

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className={`${sizeClasses} bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse`}>
          <Trophy className={`${size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-8 h-8' : 'w-6 h-6'} text-white`} />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses} bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg overflow-hidden`}>
        {logoUrl && !hasError ? (
          <img
            src={logoUrl}
            alt="Tournament Logo"
            className="w-full h-full object-cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <Trophy className={`${size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-8 h-8' : 'w-6 h-6'} text-white`} />
        )}
      </div>
    </div>
  );
};

export default TournamentLogo;
