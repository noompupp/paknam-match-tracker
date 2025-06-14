import OptimizedImage from '../shared/OptimizedImage';

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

  const getGradientStyle = () => {
    if (!showColor || !team?.color) return {};
    
    const baseColor = team.color;
    const lighterShade = lightenColor(baseColor, 20);
    const darkerShade = darkenColor(baseColor, 10);
    
    return {
      background: `linear-gradient(135deg, ${lighterShade} 0%, ${baseColor} 50%, ${darkerShade} 100%)`,
    };
  };

  const lightenColor = (color: string, percent: number): string => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const newR = Math.min(255, Math.round(r + (255 - r) * (percent / 100)));
    const newG = Math.min(255, Math.round(g + (255 - g) * (percent / 100)));
    const newB = Math.min(255, Math.round(b + (255 - b) * (percent / 100)));
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  const darkenColor = (color: string, percent: number): string => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const newR = Math.max(0, Math.round(r * (1 - percent / 100)));
    const newG = Math.max(0, Math.round(g * (1 - percent / 100)));
    const newB = Math.max(0, Math.round(b * (1 - percent / 100)));
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  const gradientStyle = getGradientStyle();
  const hasColor = showColor && team?.color;

  const imageSource = team?.logoURL;

  const getEmojiFallback = () => (
    <span className={`${sizeClasses.replace(/w-\w+ h-\w+/, '')} drop-shadow-sm`}>
      {team?.logo || '⚽'}
    </span>
  );

  return (
    <div className={`flex items-center ${className}`}>
      <div
        className={`${sizeClasses.replace(/text-\w+/, '')} rounded-lg overflow-hidden transition-all duration-200 flex items-center justify-center`}
        style={gradientStyle}
      >
        {imageSource ? (
          <OptimizedImage
            src={imageSource}
            alt={`${team?.name || 'Team'} logo`}
            className="w-full h-full"
            fallback={getEmojiFallback()}
            priority={size === 'large'}
            loading={size === 'small' ? 'lazy' : 'eager'}
          />
        ) : (
          getEmojiFallback()
        )}
      </div>
    </div>
  );
};

export default TeamLogo;
