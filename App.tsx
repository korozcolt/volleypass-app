import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

// Componentes y proveedores
import AppNavigator from './components/navigation/AppNavigator';
import CustomSplashScreen from './components/ui/SplashScreen';
import { AuthProvider } from './providers/AuthProvider';

// Configuración del tema personalizado
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1976d2',
    primaryContainer: '#e3f2fd',
    secondary: '#ff9800',
    secondaryContainer: '#fff3e0',
    surface: '#ffffff',
    surfaceVariant: '#f5f5f5',
    background: '#fafafa',
    error: '#d32f2f',
    errorContainer: '#ffebee',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#64b5f6',
    primaryContainer: '#1565c0',
    secondary: '#ffb74d',
    secondaryContainer: '#f57c00',
    surface: '#121212',
    surfaceVariant: '#1e1e1e',
    background: '#000000',
    error: '#f44336',
    errorContainer: '#b71c1c',
  },
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Inicializar WebFavicon
  React.useEffect(() => {
    // Solo en web
    if (typeof window !== 'undefined') {
      import('./components/ui/WebFavicon').then(({ default: WebFavicon }) => {
        // WebFavicon se ejecuta automáticamente
      });
    }
  }, [colorScheme]);

  if (!loaded) {
    return <CustomSplashScreen />;
  }

  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <ConditionalNotificationHandler>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ConditionalNotificationHandler>
      </AuthProvider>
    </PaperProvider>
  );
}
