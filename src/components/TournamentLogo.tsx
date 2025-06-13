
import { Trophy } from "lucide-react";
import { useState } from "react";
import OptimizedImage from "./shared/OptimizedImage";

interface TournamentLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const TournamentLogo = ({ size = 'medium', className = '' }: TournamentLogoProps) => {
  const [imageError, setImageError] = useState(false);
  
  // Use the external tournament logo URL directly
  const logoUrl = "https://sangthongkrabi.com/wp-content/uploads/2025/06/Andaman-Paknam-FC-Logo.png";

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

  const handleImageError = () => {
    console.log('Tournament logo failed to load from:', logoUrl);
    setImageError(true);
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses} bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg overflow-hidden`}>
        {!imageError ? (
          <OptimizedImage
            src={logoUrl}
            alt="Tournament Logo"
            className="w-full h-full object-cover"
            fallback={getFallbackIcon()}
            priority={size === 'large'}
            onError={handleImageError}
          />
        ) : (
          getFallbackIcon()
        )}
      </div>
    </div>
  );
};

export default TournamentLogo;
