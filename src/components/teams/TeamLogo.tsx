
interface TeamLogoProps {
  team: any;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  showColor?: boolean;
}

const TeamLogo = ({ team, size = 'medium', className = '', showColor = false }: TeamLogoProps) => {
  console.log('🖼️ TeamLogo: Rendering with props:', {
    teamName: team?.name,
    hasLogoURL: !!team?.logoURL,
    logoURL: team?.logoURL,
    logo: team?.logo,
    hasColor: !!team?.color,
    color: team?.color,
    size,
    showColor
  });

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

  // Create style object for team color background
  const getColorStyle = () => {
    if (!showColor || !team?.color) return {};
    return {
      backgroundColor: team.color,
      borderColor: team.color,
    };
  };

  const colorStyle = getColorStyle();
  const hasColor = showColor && team?.color;

  // Prioritize logoURL, then fallback to logo, then default emoji
  if (team?.logoURL) {
    console.log('🖼️ TeamLogo: Using logoURL:', team.logoURL);
    return (
      <div className={`flex items-center ${className}`}>
        <div 
          className={`${sizeClasses.replace(/text-\w+/, '')} border-2 p-1 ${
            hasColor ? 'border-current' : 'border-gray-200'
          } overflow-hidden`}
          style={colorStyle}
        >
          <img 
            src={team.logoURL} 
            alt={`${team.name} logo`} 
            className="w-full h-full object-contain"
            onError={(e) => {
              console.log('🖼️ TeamLogo: Image failed to load, falling back to emoji:', team.logoURL);
              // Fallback to emoji if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
            onLoad={() => {
              console.log('🖼️ TeamLogo: Image loaded successfully:', team.logoURL);
            }}
          />
          <span className={`${sizeClasses.replace(/w-\w+ h-\w+/, '')} hidden flex items-center justify-center`}>
            {team?.logo || '⚽'}
          </span>
        </div>
      </div>
    );
  }
  
  console.log('🖼️ TeamLogo: Using emoji fallback:', team?.logo || '⚽');
  return (
    <div className={`flex items-center ${className}`}>
      <div 
        className={`${sizeClasses.replace(/text-\w+/, '')} border-2 flex items-center justify-center ${
          hasColor ? 'border-current text-white' : 'border-gray-200'
        }`}
        style={colorStyle}
      >
        <span className={sizeClasses.replace(/w-\w+ h-\w+/, '')}>
          {team?.logo || '⚽'}
        </span>
      </div>
    </div>
  );
};

export default TeamLogo;
