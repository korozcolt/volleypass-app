import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { Logo } from './LogoVariants';

interface AnimatedLogoProps {
  variant?: 'auto' | 'light' | 'dark';
  width?: number;
  height?: number;
  style?: any;
  animationType?: 'pulse' | 'fade' | 'scale' | 'bounce';
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({
  variant = 'auto',
  width = 200,
  height = 80,
  style,
  animationType = 'pulse',
}) => {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    switch (animationType) {
      case 'pulse':
        opacity.value = withRepeat(
          withSequence(
            withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        break;

      case 'fade':
        opacity.value = withRepeat(
          withSequence(
            withTiming(0.3, { duration: 1500 }),
            withTiming(1, { duration: 1500 })
          ),
          -1,
          false
        );
        break;

      case 'scale':
        scale.value = withRepeat(
          withSequence(
            withTiming(0.9, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          false
        );
        break;

      case 'bounce':
        translateY.value = withRepeat(
          withSequence(
            withTiming(-10, { duration: 600, easing: Easing.out(Easing.ease) }),
            withTiming(0, { duration: 600, easing: Easing.in(Easing.ease) })
          ),
          -1,
          false
        );
        break;
    }
  }, [animationType, opacity, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
    };
  }, [opacity, scale, translateY]);

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={animatedStyle}>
        <Logo
          variant={variant}
          width={width}
          height={height}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AnimatedLogo;