import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

const CustomSplashScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <Image
        source={require('../../assets/images/logo-volley_pass_white_back.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text 
        variant="titleMedium" 
        style={[styles.subtitle, { color: theme.colors.onPrimary }]}
      >
        Cargando...
      </Text>
      <ActivityIndicator 
        size="large" 
        color={theme.colors.onPrimary} 
        style={styles.loader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 120,
    marginBottom: 20,
  },
  subtitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
});

export default CustomSplashScreen;