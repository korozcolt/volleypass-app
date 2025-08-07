import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Surface,
  Title,
  Paragraph,
  Button,
  Card,
  useTheme,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { Logo } from '../../components/ui/LogoVariants';
import { useAuth } from '../../providers/AuthProvider';

const { width } = Dimensions.get('window');

interface QuickAccessItem {
  title: string;
  description: string;
  icon: string;
  color: string;
  onPress: () => void;
}

const WelcomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();

  const quickAccessItems: QuickAccessItem[] = [
    {
      title: 'Torneos',
      description: 'Explora todos los torneos disponibles',
      icon: 'trophy',
      color: '#FFD700',
      onPress: () => navigation.navigate('Tournaments' as never),
    },
    {
      title: 'Partidos en Vivo',
      description: 'Sigue los partidos en tiempo real',
      icon: 'volleyball',
      color: '#FF6B35',
      onPress: () => navigation.navigate('LiveMatches' as never),
    },
    {
      title: 'Posiciones',
      description: 'Consulta las tablas de posiciones',
      icon: 'format-list-numbered',
      color: '#4ECDC4',
      onPress: () => navigation.navigate('Standings' as never),
    },
    {
      title: 'Inicio',
      description: 'Página principal con resumen',
      icon: 'home',
      color: '#45B7D1',
      onPress: () => navigation.navigate('Home' as never),
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: 20,
    },
    headerSection: {
      alignItems: 'center',
      marginBottom: 30,
      paddingVertical: 20,
    },
    logoContainer: {
      marginBottom: 20,
    },
    welcomeTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
      color: theme.colors.onBackground,
    },
    welcomeSubtitle: {
      fontSize: 16,
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
      lineHeight: 24,
    },
    quickAccessSection: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 15,
      color: theme.colors.onBackground,
    },
    quickAccessGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    quickAccessItem: {
      width: (width - 60) / 2,
      marginBottom: 15,
      elevation: 3,
    },
    quickAccessContent: {
      padding: 20,
      alignItems: 'center',
      minHeight: 140,
    },
    quickAccessIcon: {
      marginBottom: 10,
    },
    quickAccessTitle: {
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 5,
      color: theme.colors.onSurface,
    },
    quickAccessDescription: {
      fontSize: 12,
      textAlign: 'center',
      color: theme.colors.onSurfaceVariant,
      lineHeight: 16,
    },
    authSection: {
      marginBottom: 20,
    },
    authCard: {
      padding: 20,
      elevation: 2,
    },
    authTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 10,
      textAlign: 'center',
      color: theme.colors.onSurface,
    },
    authDescription: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 20,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 20,
    },
    authButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    authButton: {
      flex: 1,
      marginHorizontal: 5,
    },
    featuresSection: {
      marginBottom: 30,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
    },
    featureIcon: {
      marginRight: 15,
    },
    featureText: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.onBackground,
    },
    featureDescription: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
  });

  const features = [
    {
      icon: 'clock-outline',
      title: 'Resultados en Tiempo Real',
      description: 'Sigue los partidos minuto a minuto',
    },
    {
      icon: 'chart-line',
      title: 'Estadísticas Detalladas',
      description: 'Análisis completo de equipos y jugadores',
    },
    {
      icon: 'calendar',
      title: 'Calendario de Partidos',
      description: 'No te pierdas ningún encuentro importante',
    },
    {
      icon: 'trophy-outline',
      title: 'Múltiples Torneos',
      description: 'Competencias de todas las categorías',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Surface style={styles.headerSection} elevation={1}>
          <View style={styles.logoContainer}>
            <Logo width={200} height={80} />
          </View>
          <Title style={styles.welcomeTitle}>
            ¡Bienvenido a VolleyPass!
          </Title>
          <Paragraph style={styles.welcomeSubtitle}>
            Tu plataforma completa para seguir el voleibol.
            Resultados, estadísticas y mucho más.
          </Paragraph>
        </Surface>

        {/* Quick Access Section */}
        <View style={styles.quickAccessSection}>
          <Title style={styles.sectionTitle}>Acceso Rápido</Title>
          <View style={styles.quickAccessGrid}>
            {quickAccessItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <Card style={styles.quickAccessItem}>
                  <View style={styles.quickAccessContent}>
                    <Icon
                      name={item.icon}
                      size={40}
                      color={item.color}
                      style={styles.quickAccessIcon}
                    />
                    <Title style={styles.quickAccessTitle}>
                      {item.title}
                    </Title>
                    <Paragraph style={styles.quickAccessDescription}>
                      {item.description}
                    </Paragraph>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Authentication Section */}
        {!isAuthenticated && (
          <View style={styles.authSection}>
            <Card style={styles.authCard}>
              <Title style={styles.authTitle}>
                ¿Eres jugador, entrenador o árbitro?
              </Title>
              <Paragraph style={styles.authDescription}>
                Inicia sesión para acceder a funciones exclusivas como
                estadísticas personales, gestión de equipos y control de partidos.
              </Paragraph>
              <View style={styles.authButtons}>
                <Button
                  mode="outlined"
                  style={styles.authButton}
                  onPress={() => navigation.navigate('Login' as never)}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  mode="contained"
                  style={styles.authButton}
                  onPress={() => navigation.navigate('Register' as never)}
                >
                  Registrarse
                </Button>
              </View>
            </Card>
          </View>
        )}

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Title style={styles.sectionTitle}>Características</Title>
          <Surface style={{ padding: 15, borderRadius: 12 }} elevation={1}>
            {features.map((feature, index) => (
              <View key={index}>
                <View style={styles.featureItem}>
                  <Icon
                    name={feature.icon}
                    size={24}
                    color={theme.colors.primary}
                    style={styles.featureIcon}
                  />
                  <View style={styles.featureText}>
                    <Title style={styles.featureTitle}>
                      {feature.title}
                    </Title>
                    <Paragraph style={styles.featureDescription}>
                      {feature.description}
                    </Paragraph>
                  </View>
                </View>
                {index < features.length - 1 && (
                  <Divider style={{ marginVertical: 8 }} />
                )}
              </View>
            ))}
          </Surface>
        </View>

        {/* Footer */}
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
            VolleyPass © 2024
          </Paragraph>
          <Paragraph style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
            La mejor experiencia de voleibol
          </Paragraph>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WelcomeScreen;