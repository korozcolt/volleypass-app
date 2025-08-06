import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { LogoSmall } from '../ui/LogoVariants';

interface HeaderLogoProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const HeaderLogo: React.FC<HeaderLogoProps> = ({ onPress, style, ...props }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Por defecto, navegar al home
      try {
        navigation.navigate('Home' as never);
      } catch (error) {
        console.log('Navigation error:', error);
      }
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={style} {...props}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        <LogoSmall width={100} height={32} />
      </View>
    </TouchableOpacity>
  );
};

export default HeaderLogo;