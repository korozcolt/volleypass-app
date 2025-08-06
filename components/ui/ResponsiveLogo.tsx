import React from 'react';
import { Dimensions, Platform } from 'react-native';
import { Logo, LogoLarge, LogoMedium, LogoSmall, LogoXLarge } from './LogoVariants';

interface ResponsiveLogoProps {
  variant?: 'auto' | 'light' | 'dark';
  style?: any;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
}

const ResponsiveLogo: React.FC<ResponsiveLogoProps> = ({ 
  variant = 'auto', 
  style, 
  resizeMode = 'contain' 
}) => {
  const { width, height } = Dimensions.get('window');
  const isTablet = width >= 768;
  const isLandscape = width > height;

  // Determinar el tamaño del logo basado en el dispositivo y orientación
  const getLogoSize = () => {
    if (Platform.OS === 'web') {
      // Para web, usar tamaños más grandes
      if (width >= 1200) return 'xlarge';
      if (width >= 768) return 'large';
      return 'medium';
    }

    if (isTablet) {
      // Para tablets
      if (isLandscape) return 'large';
      return 'medium';
    }

    // Para móviles
    if (isLandscape) return 'medium';
    return 'small';
  };

  const logoSize = getLogoSize();

  switch (logoSize) {
    case 'xlarge':
      return <LogoXLarge variant={variant} style={style} resizeMode={resizeMode} />;
    case 'large':
      return <LogoLarge variant={variant} style={style} resizeMode={resizeMode} />;
    case 'medium':
      return <LogoMedium variant={variant} style={style} resizeMode={resizeMode} />;
    case 'small':
      return <LogoSmall variant={variant} style={style} resizeMode={resizeMode} />;
    default:
      return <Logo variant={variant} style={style} resizeMode={resizeMode} />;
  }
};

export default ResponsiveLogo;