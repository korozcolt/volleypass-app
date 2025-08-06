import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

const LoadingScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <Text 
        variant="headlineMedium" 
        style={[styles.title, { color: theme.colors.onPrimary }]}
      >
        VolleyPass
      </Text>
      <ActivityIndicator 
        size="large" 
        color={theme.colors.onPrimary} 
        style={styles.loader}
      />
      <Text 
        variant="bodyMedium" 
        style={[styles.subtitle, { color: theme.colors.onPrimary }]}
      >
        Cargando...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  subtitle: {
    opacity: 0.8,
  },
});

export default LoadingScreen;