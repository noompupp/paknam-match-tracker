
import { Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import OptimizedImage from "./shared/OptimizedImage";

interface TournamentLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const TournamentLogo = ({ size = 'medium', className = '' }: TournamentLogoProps) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use the optimized CDN URL directly
  const optimizedLogoUrl = "http://sangthongkrabi.com/wp-content/uploads/2025/06/Andaman-Paknam-FC-Logo-96-x-96-px.png";

  useEffect(() => {
    const loadTournamentLogo = async () => {
      try {
        // Test if the optimized CDN URL is accessible
        const response = await fetch(optimizedLogoUrl, { method: 'HEAD' });
        if (response.ok) {
          setLogoUrl(optimizedLogoUrl);
        } else {
          console.log('Optimized tournament logo not accessible, using fallback');
        }
      } catch (error) {
        console.log('Failed to load optimized tournament logo, using fallback:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTournamentLogo();
  }, []);

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
        {logoUrl ? (
          <OptimizedImage
            src={logoUrl}
            alt="Tournament Logo"
            className="w-full h-full object-cover"
            variant={size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium'}
            fallback={getFallbackIcon()}
            priority={size === 'large'}
            loading="eager"
          />
        ) : (
          <Trophy className={`${size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-8 h-8' : 'w-6 h-6'} text-white`} />
        )}
      </div>
    </div>
  );
};

export default TournamentLogo;
