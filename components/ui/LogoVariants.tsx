import React from 'react';
import { Image, ImageResizeMode, ImageStyle, StyleProp, useColorScheme } from 'react-native';
import { getLogoSource, LOGO_SIZES } from '../../constants/LogoConfig';

interface LogoVariantProps {
  style?: StyleProp<ImageStyle>;
  width?: number;
  height?: number;
  resizeMode?: ImageResizeMode;
  variant?: 'auto' | 'light' | 'dark';
}

// Logo principal que se adapta al tema
export const Logo: React.FC<LogoVariantProps> = ({ 
  style, 
  width = 200, 
  height = 80, 
  resizeMode = 'contain',
  variant = 'auto'
}) => {
  const colorScheme = useColorScheme();
  
  let logoSource;
  
  if (variant === 'light') {
    // Logo para fondos claros (logo negro)
    logoSource = getLogoSource(false);
  } else if (variant === 'dark') {
    // Logo para fondos oscuros (logo blanco)
    logoSource = getLogoSource(true);
  } else {
    // Auto: se adapta al tema del sistema
    logoSource = getLogoSource(colorScheme === 'dark');
  }

  return (
    <Image
      source={logoSource}
      style={[
        {
          width,
          height,
        },
        style,
      ]}
      resizeMode={resizeMode}
      accessibilityLabel="VolleyPass Logo"
    />
  );
};

// Logo pequeño para headers
export const LogoSmall: React.FC<LogoVariantProps> = (props) => (
  <Logo {...props} width={LOGO_SIZES.SMALL.width} height={LOGO_SIZES.SMALL.height} />
);

// Logo mediano para pantallas
export const LogoMedium: React.FC<LogoVariantProps> = (props) => (
  <Logo {...props} width={LOGO_SIZES.MEDIUM.width} height={LOGO_SIZES.MEDIUM.height} />
);

// Logo grande para splash/login
export const LogoLarge: React.FC<LogoVariantProps> = (props) => (
  <Logo {...props} width={LOGO_SIZES.LARGE.width} height={LOGO_SIZES.LARGE.height} />
);

// Logo extra grande para pantallas de bienvenida
export const LogoXLarge: React.FC<LogoVariantProps> = (props) => (
  <Logo {...props} width={LOGO_SIZES.XLARGE.width} height={LOGO_SIZES.XLARGE.height} />
);

// Logo para fondos claros específicamente
export const LogoLight: React.FC<Omit<LogoVariantProps, 'variant'>> = (props) => (
  <Logo {...props} variant="light" />
);

// Logo para fondos oscuros específicamente
export const LogoDark: React.FC<Omit<LogoVariantProps, 'variant'>> = (props) => (
  <Logo {...props} variant="dark" />
);

export default Logo;