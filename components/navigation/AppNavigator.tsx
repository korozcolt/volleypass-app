import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../providers/AuthProvider';
import { LogoSmall } from '../ui/LogoVariants';

// Importar pantallas públicas
import HomeScreen from '../../screens/public/HomeScreen';
import LiveMatchesScreen from '../../screens/public/LiveMatchesScreen';
import MatchDetailScreen from '../../screens/public/MatchDetailScreen';
import StandingsScreen from '../../screens/public/StandingsScreen';
import TournamentDetailScreen from '../../screens/public/TournamentDetailScreen';
import TournamentsScreen from '../../screens/public/TournamentsScreen';
import WelcomeScreen from '../../screens/public/WelcomeScreen';

// Pantallas de autenticación
import LoginScreen from '../../screens/auth/LoginScreen';
import RegisterScreen from '../../screens/auth/RegisterScreen';

// Pantallas de usuario autenticado
import EditProfileScreen from '../../screens/user/EditProfileScreen';
import NotificationsScreen from '../../screens/user/NotificationsScreen';
import ProfileScreen from '../../screens/user/ProfileScreen';

// Pantallas de jugador
import PlayerPaymentsScreen from '../../screens/player/PlayerPaymentsScreen';
import PlayerSanctionsScreen from '../../screens/player/PlayerSanctionsScreen';
import PlayerStatsScreen from '../../screens/player/PlayerStatsScreen';

// Pantallas de árbitro
import MatchControlScreen from '../../screens/referee/MatchControlScreen';
import QRScannerScreen from '../../screens/referee/QRScannerScreen';
import RefereeMatchesScreen from '../../screens/referee/RefereeMatchesScreen';

// Pantallas de entrenador/dirigente
import PlayerManagementScreen from '../../screens/coach/PlayerManagementScreen';
import TeamManagementScreen from '../../screens/coach/TeamManagementScreen';

// Pantallas de liga
import LeagueMatchesScreen from '../../screens/league/LeagueMatchesScreen';
import SanctionManagementScreen from '../../screens/league/SanctionManagementScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Navegación de pestañas públicas
const PublicTabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Tournaments':
              iconName = focused ? 'trophy' : 'trophy-outline';
              break;
            case 'LiveMatches':
              iconName = focused ? 'volleyball' : 'volleyball';
              break;
            case 'Standings':
              iconName = focused ? 'format-list-numbered' : 'format-list-numbered';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitle: () => <LogoSmall />,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen 
        name="Tournaments" 
        component={TournamentsScreen} 
        options={{ title: 'Torneos' }}
      />
      <Tab.Screen 
        name="LiveMatches" 
        component={LiveMatchesScreen} 
        options={{ title: 'En Vivo' }}
      />
      <Tab.Screen 
        name="Standings" 
        component={StandingsScreen} 
        options={{ title: 'Posiciones' }}
      />
    </Tab.Navigator>
  );
};

// Navegación de pestañas para jugadores
const PlayerTabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Tournaments':
              iconName = focused ? 'trophy' : 'trophy-outline';
              break;
            case 'LiveMatches':
              iconName = focused ? 'volleyball' : 'volleyball';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            case 'Stats':
              iconName = focused ? 'chart-line' : 'chart-line';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen 
        name="Tournaments" 
        component={TournamentsScreen} 
        options={{ title: 'Torneos' }}
      />
      <Tab.Screen 
        name="LiveMatches" 
        component={LiveMatchesScreen} 
        options={{ title: 'En Vivo' }}
      />
      <Tab.Screen 
        name="Stats" 
        component={PlayerStatsScreen} 
        options={{ title: 'Estadísticas' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

// Navegación de pestañas para árbitros
const RefereeTabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'MyMatches':
              iconName = focused ? 'whistle' : 'whistle-outline';
              break;
            case 'LiveMatches':
              iconName = focused ? 'volleyball' : 'volleyball';
              break;
            case 'QRScanner':
              iconName = focused ? 'qrcode-scan' : 'qrcode-scan';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen 
        name="MyMatches" 
        component={RefereeMatchesScreen} 
        options={{ title: 'Mis Partidos' }}
      />
      <Tab.Screen 
        name="LiveMatches" 
        component={LiveMatchesScreen} 
        options={{ title: 'En Vivo' }}
      />
      <Tab.Screen 
        name="QRScanner" 
        component={QRScannerScreen} 
        options={{ title: 'Escanear QR' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

// Navegación de pestañas para entrenadores/dirigentes
const CoachTabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'TeamManagement':
              iconName = focused ? 'account-group' : 'account-group-outline';
              break;
            case 'LiveMatches':
              iconName = focused ? 'volleyball' : 'volleyball';
              break;
            case 'Tournaments':
              iconName = focused ? 'trophy' : 'trophy-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen 
        name="TeamManagement" 
        component={TeamManagementScreen} 
        options={{ title: 'Equipo' }}
      />
      <Tab.Screen 
        name="LiveMatches" 
        component={LiveMatchesScreen} 
        options={{ title: 'En Vivo' }}
      />
      <Tab.Screen 
        name="Tournaments" 
        component={TournamentsScreen} 
        options={{ title: 'Torneos' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

// Navegación de pestañas para liga
const LeagueTabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'MatchManagement':
              iconName = focused ? 'calendar-check' : 'calendar-check-outline';
              break;
            case 'SanctionManagement':
              iconName = focused ? 'gavel' : 'gavel';
              break;
            case 'Tournaments':
              iconName = focused ? 'trophy' : 'trophy-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen 
        name="MatchManagement" 
        component={LeagueMatchesScreen} 
        options={{ title: 'Partidos' }}
      />
      <Tab.Screen 
        name="SanctionManagement" 
        component={SanctionManagementScreen} 
        options={{ title: 'Sanciones' }}
      />
      <Tab.Screen 
        name="Tournaments" 
        component={TournamentsScreen} 
        options={{ title: 'Torneos' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

// Navegación principal de la aplicación
const AppNavigator = () => {
  const theme = useTheme();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Estado local para manejar la carga inicial
  const [localLoading, setLocalLoading] = useState(true);
  const [localIsAuthenticated, setLocalIsAuthenticated] = useState(false);

  useEffect(() => {
    // Simular un tiempo de carga y luego usar el estado real de autenticación
    const timer = setTimeout(() => {
      setLocalIsAuthenticated(isAuthenticated);
      setLocalLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  // Mostrar pantalla de carga
  if (localLoading || isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background
      }}>
        <LogoSmall width={120} height={120} style={{ marginBottom: 20 }} />
        <Text style={{
          fontSize: 18,
          color: theme.colors.onBackground,
          marginTop: 16
        }}>
          Cargando VolleyPass...
        </Text>
      </View>
    );
  }
  
  // Determinar qué navegador de pestañas usar basado en el tipo de usuario
  const getTabNavigator = () => {
    if (!isAuthenticated) {
      return PublicTabNavigator;
    }

    switch (user?.user_type) {
      case 'player':
        return PlayerTabNavigator;
      case 'referee':
        return RefereeTabNavigator;
      case 'coach':
        return CoachTabNavigator;
      case 'league':
      case 'admin':
        return LeagueTabNavigator;
      default:
        return PublicTabNavigator;
    }
  };

  const TabNavigator = getTabNavigator();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      {/* Pantalla de bienvenida como pantalla principal */}
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen} 
        options={{ headerShown: false }}
      />
      
      {/* Pantallas públicas */}
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Inicio' }}
      />
      <Stack.Screen 
        name="Tournaments" 
        component={TournamentsScreen} 
        options={{ title: 'Torneos' }}
      />
      <Stack.Screen 
        name="LiveMatches" 
        component={LiveMatchesScreen} 
        options={{ title: 'Partidos en Vivo' }}
      />
      <Stack.Screen 
        name="Standings" 
        component={StandingsScreen} 
        options={{ title: 'Posiciones' }}
      />
      
      {/* Pantallas de autenticación */}
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ title: 'Iniciar Sesión' }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ title: 'Registrarse' }}
      />
      
      {/* Navegación por pestañas para usuarios autenticados */}
      {isAuthenticated && (
        <Stack.Screen 
          name="Main" 
          component={TabNavigator} 
          options={{ headerShown: false }}
        />
      )}
      
      {/* Pantallas autenticadas */}
      {isAuthenticated && (
        <>
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen} 
            options={{ title: 'Editar Perfil' }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen} 
            options={{ title: 'Notificaciones' }}
          />
          <Stack.Screen 
            name="PlayerSanctions" 
            component={PlayerSanctionsScreen} 
            options={{ title: 'Mis Sanciones' }}
          />
          <Stack.Screen 
            name="PlayerPayments" 
            component={PlayerPaymentsScreen} 
            options={{ title: 'Mis Pagos' }}
          />
          <Stack.Screen 
            name="MatchControl" 
            component={MatchControlScreen} 
            options={{ title: 'Control de Partido' }}
          />
          <Stack.Screen 
            name="PlayerManagement" 
            component={PlayerManagementScreen} 
            options={{ title: 'Gestión de Jugadores' }}
          />
        </>
      )}
        
      {/* Pantallas de detalle comunes */}
      <Stack.Screen 
        name="MatchDetail" 
        component={MatchDetailScreen as any} 
        options={{ title: 'Detalle del Partido' }}
      />
      <Stack.Screen 
        name="TournamentDetail" 
        component={TournamentDetailScreen as any} 
        options={{ title: 'Detalle del Torneo' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;