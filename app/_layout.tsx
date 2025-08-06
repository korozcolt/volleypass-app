import React from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Componentes y proveedores
import { AuthProvider } from '../providers/AuthProvider';
import AppNavigator from '../components/navigation/AppNavigator';
import NotificationHandler from '../components/notifications/NotificationHandler';

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
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NotificationHandler>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <AppNavigator />
        </NotificationHandler>
      </AuthProvider>
    </PaperProvider>
  );
}
