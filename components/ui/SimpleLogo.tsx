import React from 'react';
import { Image, ImageStyle, StyleProp, useColorScheme } from 'react-native';

interface SimpleLogoProps {
  style?: StyleProp<ImageStyle>;
  width?: number;
  height?: number;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
  variant?: 'auto' | 'light' | 'dark';
}

const SimpleLogo: React.FC<SimpleLogoProps> = ({ 
  style, 
  width = 200, 
  height = 80, 
  resizeMode = 'contain',
  variant = 'auto'
}) => {
  const colorScheme = useColorScheme();
  
  // Determinar qué logo usar basado en el tema
  let logoSource;
  
  if (variant === 'light') {
    // Logo para fondos claros (logo negro)
    logoSource = require('../../assets/images/logo-volley_pass_black_back.png');
  } else if (variant === 'dark') {
    // Logo para fondos oscuros (logo blanco)
    logoSource = require('../../assets/images/logo-volley_pass_white_back.png');
  } else {
    // Auto: se adapta al tema del sistema
    logoSource = colorScheme === 'dark' 
      ? require('../../assets/images/logo-volley_pass_white_back.png')
      : require('../../assets/images/logo-volley_pass_black_back.png');
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

// Variantes de tamaño
export const SimpleLogoSmall: React.FC<Omit<SimpleLogoProps, 'width' | 'height'>> = (props) => (
  <SimpleLogo {...props} width={100} height={32} />
);

export const SimpleLogoMedium: React.FC<Omit<SimpleLogoProps, 'width' | 'height'>> = (props) => (
  <SimpleLogo {...props} width={200} height={80} />
);

export const SimpleLogoLarge: React.FC<Omit<SimpleLogoProps, 'width' | 'height'>> = (props) => (
  <SimpleLogo {...props} width={300} height={120} />
);

export default SimpleLogo;