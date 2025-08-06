import React from 'react';
import { Image, ImageStyle, StyleProp, useColorScheme } from 'react-native';
import { useTheme } from 'react-native-paper';

interface LogoProps {
  style?: StyleProp<ImageStyle>;
  width?: number;
  height?: number;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
}

const Logo: React.FC<LogoProps> = ({ 
  style, 
  width = 200, 
  height = 80, 
  resizeMode = 'contain' 
}) => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  
  // Determinar qué logo usar basado en el tema
  const logoSource = colorScheme === 'dark' 
    ? require('../../assets/images/logo-volley_pass_white_back.png')
    : require('../../assets/images/logo-volley_pass_black_back.png');

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

export default Logo;