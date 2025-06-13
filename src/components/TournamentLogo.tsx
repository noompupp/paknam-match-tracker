
import { Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import OptimizedImage from "./shared/OptimizedImage";

interface TournamentLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const TournamentLogo = ({ size = 'medium', className = '' }: TournamentLogoProps) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTournamentLogo = async () => {
      try {
        // Get the tournament logo URL from the correct bucket
        const { data } = supabase.storage
          .from('tournament-assets')
          .getPublicUrl('tournament-logo.png');

        if (data?.publicUrl) {
          // Check if the file actually exists by trying to fetch it
          const response = await fetch(data.publicUrl);
          if (response.ok) {
            setLogoUrl(data.publicUrl);
          }
        }
      } catch (error) {
        console.log('Tournament logo not found, using default trophy icon');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournamentLogo();
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
          />
        ) : (
          <Trophy className={`${size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-8 h-8' : 'w-6 h-6'} text-white`} />
        )}
      </div>
    </div>
  );
};

export default TournamentLogo;
