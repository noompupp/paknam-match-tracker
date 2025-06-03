
import { Trophy } from "lucide-react";

interface TournamentLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const TournamentLogo = ({ size = 'medium', className = '' }: TournamentLogoProps) => {
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

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses} bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg`}>
        <Trophy className={`${size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-8 h-8' : 'w-6 h-6'} text-white`} />
      </div>
    </div>
  );
};

export default TournamentLogo;
