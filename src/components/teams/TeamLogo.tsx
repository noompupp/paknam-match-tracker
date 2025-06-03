
interface TeamLogoProps {
  team: any;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const TeamLogo = ({ team, size = 'medium', className = '' }: TeamLogoProps) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-8 text-2xl';
      case 'large':
        return 'w-16 h-16 text-6xl';
      default:
        return 'w-12 h-12 text-4xl';
    }
  };

  const sizeClasses = getSizeClasses();

  // Prioritize logoURL, then fallback to logo, then default emoji
  if (team?.logoURL) {
    return (
      <div className={`flex items-center ${className}`}>
        <img 
          src={team.logoURL} 
          alt={`${team.name} logo`} 
          className={`${sizeClasses.replace(/text-\w+/, '')} object-contain rounded-lg border border-gray-200`}
          onError={(e) => {
            // Fallback to emoji if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <span className={`${sizeClasses.replace(/w-\w+ h-\w+/, '')} hidden`}>
          {team?.logo || '⚽'}
        </span>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center ${className}`}>
      <span className={sizeClasses.replace(/w-\w+ h-\w+/, '')}>
        {team?.logo || '⚽'}
      </span>
    </div>
  );
};

export default TeamLogo;
