
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
    hasOptimizedUrl: !!team?.optimized_logo_url,
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

  // Enhanced gradient style function
  const getGradientStyle = () => {
    if (!showColor || !team?.color) return {};
    
    // Create a gradient using the team color as base
    const baseColor = team.color;
    
    // Generate a lighter shade for the gradient
    const lighterShade = lightenColor(baseColor, 20);
    const darkerShade = darkenColor(baseColor, 10);
    
    return {
      background: `linear-gradient(135deg, ${lighterShade} 0%, ${baseColor} 50%, ${darkerShade} 100%)`,
    };
  };

  // Helper function to lighten a color
  const lightenColor = (color: string, percent: number): string => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Lighten each component
    const newR = Math.min(255, Math.round(r + (255 - r) * (percent / 100)));
    const newG = Math.min(255, Math.round(g + (255 - g) * (percent / 100)));
    const newB = Math.min(255, Math.round(b + (255 - b) * (percent / 100)));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  // Helper function to darken a color
  const darkenColor = (color: string, percent: number): string => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Darken each component
    const newR = Math.max(0, Math.round(r * (1 - percent / 100)));
    const newG = Math.max(0, Math.round(g * (1 - percent / 100)));
    const newB = Math.max(0, Math.round(b * (1 - percent / 100)));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  const gradientStyle = getGradientStyle();
  const hasColor = showColor && team?.color;

  // Determine which image source to use (prioritize optimized)
  const imageSource = team?.optimized_logo_url || team?.logoURL;

  // Create emoji fallback component
  const getEmojiFallback = () => (
    <span className={`${sizeClasses.replace(/w-\w+ h-\w+/, '')} drop-shadow-sm`}>
      {team?.logo || '⚽'}
    </span>
  );

  // Use optimized image if available
  if (imageSource) {
    console.log('🖼️ TeamLogo: Using optimized image system');
    return (
      <div className={`flex items-center ${className}`}>
        <div 
          className={`${sizeClasses.replace(/text-\w+/, '')} rounded-lg overflow-hidden transition-all duration-200`}
          style={gradientStyle}
        >
          <OptimizedImage
            src={imageSource}
            alt={`${team?.name || 'Team'} logo`}
            className="w-full h-full"
            fallback={getEmojiFallback()}
            priority={size === 'large'}
            loading={size === 'small' ? 'lazy' : 'eager'}
          />
        </div>
      </div>
    );
  }
  
  console.log('🖼️ TeamLogo: Using emoji fallback:', team?.logo || '⚽');
  return (
    <div className={`flex items-center ${className}`}>
      <div 
        className={`${sizeClasses.replace(/text-\w+/, '')} rounded-lg flex items-center justify-center transition-all duration-200 ${
          hasColor ? 'text-white font-bold' : ''
        }`}
        style={gradientStyle}
      >
        {getEmojiFallback()}
      </div>
    </div>
  );
};

export default TeamLogo;
