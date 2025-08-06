import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import {
    ActivityIndicator,
    Button,
    Card,
    Chip,
    Paragraph,
    Surface,
    Text,
    Title,
    useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Logo } from '../../components/ui/LogoVariants';
import { useAuth } from '../../providers/AuthProvider';
import api from '../../services/api';
import { Match, Tournament } from '../../types';

type RootStackParamList = {
  Login: undefined;
  MatchDetail: { matchId: number; title: string };
  LiveMatches: undefined;
  TournamentDetail: { tournamentId: number };
  Tournaments: undefined;
};

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
  const [error, setError] = useState<string | null>(null);

  

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar partidos en vivo
        const liveResponse = await api.getLiveMatches();
        setLiveMatches(liveResponse.slice(0, 3));

      // Cargar próximos partidos
        const upcomingResponse = await api.getMatches({
          status: 'scheduled',
          per_page: 3,
        });
        setUpcomingMatches(upcomingResponse.data.slice(0, 3));

      // Cargar torneos activos
        const tournamentsResponse = await api.getTournaments({});
        setActiveTournaments(tournamentsResponse.slice(0, 3));
    } catch (error) {
      console.error('Error cargando datos del inicio:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const formatMatchTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const getMatchDate = (match: Match) => {
    return match.scheduled_at;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getUserName = () => {
    if (!isAuthenticated || !user) return 'Invitado';
    return user.first_name || user.name || 'Usuario';
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Header con Logo */}
        <Surface
          style={{
            padding: 20,
            marginBottom: 16,
            borderRadius: 12,
            elevation: 2,
            alignItems: 'center',
          }}
        >
          <Logo width={250} height={100} style={{ marginBottom: 16 }} />
          <View style={{ alignItems: 'center' }}>
            <Title style={{ fontSize: 20, marginBottom: 4, textAlign: 'center' }}>
              {getGreeting()}, {getUserName()}
            </Title>
            <Paragraph style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              {isAuthenticated
                ? 'Bienvenido de vuelta a VolleyPass'
                : 'Bienvenido a VolleyPass'}
            </Paragraph>
          </View>
        </Surface>

        {/* Botón de login para usuarios no autenticados */}
        {!isAuthenticated && (
          <Card style={{ marginBottom: 16 }}>
            <Card.Content style={{ alignItems: 'center', padding: 20 }}>
              <Icon
                name="login"
                size={48}
                color={theme.colors.primary}
                style={{ marginBottom: 12 }}
              />
              <Title style={{ textAlign: 'center', marginBottom: 8 }}>
                Inicia Sesión
              </Title>
              <Paragraph style={{ textAlign: 'center', marginBottom: 16 }}>
                Accede a tu perfil, estadísticas y funciones exclusivas
              </Paragraph>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Login')}
                style={{ minWidth: 120 }}
              >
                Iniciar Sesión
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Partidos en vivo */}
        {liveMatches.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Icon name="circle" size={12} color="#ff4444" style={{ marginRight: 8 }} />
              <Title style={{ fontSize: 18 }}>En Vivo</Title>
            </View>
            {liveMatches.map((match) => (
              <Card
                key={match.id}
                style={{ marginBottom: 8 }}
                onPress={() => navigation.navigate('MatchDetail', {
                  matchId: match.id,
                  title: `${match.home_team.name} vs ${match.away_team.name}`,
                })}
              >
                <Card.Content style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                        {match.home_team.name} vs {match.away_team.name}
                      </Text>
                      <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                        {match.tournament.name}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Chip
                        mode="flat"
                        style={{ backgroundColor: '#ff4444' }}
                        textStyle={{ color: 'white', fontSize: 12 }}
                      >
                        EN VIVO
                      </Chip>
                      {(match.home_sets !== null && match.away_sets !== null) && (
                        <Text style={{ marginTop: 4, fontWeight: 'bold' }}>
                          {match.home_sets || 0} - {match.away_sets || 0}
                        </Text>
                      )}
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('LiveMatches')}
              style={{ marginTop: 8 }}
            >
              Ver todos los partidos en vivo
            </Button>
          </View>
        )}

        {/* Próximos partidos */}
        {upcomingMatches.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Title style={{ fontSize: 18, marginBottom: 12 }}>Próximos Partidos</Title>
            {upcomingMatches.map((match) => (
              <Card
                key={match.id}
                style={{ marginBottom: 8 }}
                onPress={() => navigation.navigate('MatchDetail', {
                  matchId: match.id,
                  title: `${match.home_team.name} vs ${match.away_team.name}`,
                })}
              >
                <Card.Content style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                        {match.home_team.name} vs {match.away_team.name}
                      </Text>
                      <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                        {match.tournament.name}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontWeight: 'bold' }}>
                        {formatMatchDate(getMatchDate(match))}
                      </Text>
                      <Text style={{ color: theme.colors.onSurfaceVariant }}>
                        {formatMatchTime(getMatchDate(match))}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        {/* Torneos activos */}
        {activeTournaments.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <Title style={{ fontSize: 18, marginBottom: 12 }}>Torneos Activos</Title>
            {activeTournaments.map((tournament) => (
              <Card
                key={tournament.id}
                style={{ marginBottom: 8 }}
                onPress={() => navigation.navigate('TournamentDetail', {
                  tournamentId: tournament.id,
                })}
              >
                <Card.Content style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon
                      name="trophy"
                      size={24}
                      color={theme.colors.primary}
                      style={{ marginRight: 12 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                        {tournament.name}
                      </Text>
                      <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                        {tournament.categories?.[0]?.name || 'Sin categoría'} • {tournament.league.name}
                      </Text>
                    </View>
                    <Chip mode="flat" style={{ backgroundColor: theme.colors.primaryContainer }}>
                      Activo
                    </Chip>
                  </View>
                </Card.Content>
              </Card>
            ))}
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Tournaments')}
              style={{ marginTop: 8 }}
            >
              Ver todos los torneos
            </Button>
          </View>
        )}

        {/* Mensaje cuando no hay datos */}
        {liveMatches.length === 0 && upcomingMatches.length === 0 && activeTournaments.length === 0 && (
          <Card>
            <Card.Content style={{ alignItems: 'center', padding: 32 }}>
              <Icon
                name="volleyball"
                size={64}
                color={theme.colors.onSurfaceVariant}
                style={{ marginBottom: 16 }}
              />
              <Title style={{ textAlign: 'center', marginBottom: 8 }}>
                No hay actividad reciente
              </Title>
              <Paragraph style={{ textAlign: 'center' }}>
                Explora los torneos y partidos disponibles
              </Paragraph>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;