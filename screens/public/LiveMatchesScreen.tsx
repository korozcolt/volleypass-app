import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, RefreshControl, View } from 'react-native';
import {
  Card,
  Title,
  Text,
  Chip,
  ActivityIndicator,
  Surface,
  Button,
  useTheme,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import api from '../../services/api';
import { webSocketService } from '../../services/websocket';
import { Match, LiveMatchUpdate } from '../../types';
import { useAuth } from '../../providers/AuthProvider';

type RootStackParamList = {
  MatchDetail: { matchId: number; title: string };
};

const LiveMatchesScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  
  const wsService = webSocketService;

  useEffect(() => {
    loadLiveMatches();
    setupWebSocket();
    
    return () => {
      cleanupWebSocket();
    };
  }, []);

  const loadLiveMatches = async () => {
    try {
      setError(null);
      const response = await api.getLiveMatches();
      setLiveMatches(response || []);
    } catch (error) {
      console.error('Error cargando partidos en vivo:', error);
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    // Suscribirse a actualizaciones de partidos en vivo
    liveMatches.forEach(match => {
      wsService.subscribeToMatch(match.id, {
        onMatchScoreUpdated: handleLiveMatchUpdate,
        onMatchStatusChanged: handleLiveMatchUpdate,
        onSetCompleted: handleLiveMatchUpdate,
      });
    });
  };

  const cleanupWebSocket = () => {
    liveMatches.forEach(match => {
      wsService.unsubscribeFromMatch(match.id);
    });
  };

  const handleLiveMatchUpdate = (update: LiveMatchUpdate) => {
    setLiveMatches(prevMatches => 
      prevMatches.map(match => {
        if (match.id === update.match_id) {
          return {
            ...match,
            home_sets: update.data?.home_sets || update.data?.home_score || match.home_sets || 0,
            away_sets: update.data?.away_sets || update.data?.away_score || match.away_sets || 0,
            current_set: update.data?.current_set || match.current_set || 1,
            status: update.data?.status || match.status || 'in_progress',
            sets: update.data?.sets || match.sets,
          };
        }
        return match;
      })
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLiveMatches();
    setRefreshing(false);
  };

  const formatMatchTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return '#ff4444';
      case 'break':
        return '#ff8800';
      case 'finished':
        return '#00aa00';
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live':
        return 'EN VIVO';
      case 'break':
        return 'DESCANSO';
      case 'finished':
        return 'FINALIZADO';
      default:
        return status.toUpperCase();
    }
  };

  const renderMatchCard = (match: Match) => (
    <Card
      key={match.id}
      style={{ marginBottom: 12 }}
      onPress={() => navigation.navigate('MatchDetail', { matchId: match.id, title: match.home_team.name })}
    >
      <Card.Content style={{ padding: 16 }}>
        {/* Header del partido */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
              {match.tournament.name}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant }}>
              {formatMatchTime(match.scheduled_at)} • {match.venue?.name || 'Sede por confirmar'}
            </Text>
          </View>
          <Chip
            mode="flat"
            style={{ backgroundColor: getStatusColor(match.status) }}
            textStyle={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}
          >
            {getStatusText(match.status)}
          </Chip>
        </View>

        {/* Equipos y marcador */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Equipo local */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
              {match.home_team.name}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
              Local
            </Text>
          </View>

          {/* Marcador */}
          <View style={{ alignItems: 'center', marginHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
                {match.home_sets ?? 0}
              </Text>
              <Text style={{ fontSize: 20, marginHorizontal: 8, color: theme.colors.onSurfaceVariant }}>
                -
              </Text>
              <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
                {match.away_sets ?? 0}
              </Text>
            </View>
            {match.current_set && (
              <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                Set {match.current_set}
              </Text>
            )}
          </View>

          {/* Equipo visitante */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
              {match.away_team.name}
            </Text>
            <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
              Visitante
            </Text>
          </View>
        </View>

        {/* Sets */}
        {match.sets && match.sets.length > 0 && (
          <>
            <Divider style={{ marginVertical: 12 }} />
            <View>
              <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: theme.colors.onSurfaceVariant }}>
                Sets
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                {match.sets.map((set, index) => (
                  <View key={index} style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 10, color: theme.colors.onSurfaceVariant, marginBottom: 2 }}>
                      Set {index + 1}
                    </Text>
                    <Text style={{ fontWeight: 'bold' }}>
                      {set.home_score} - {set.away_score}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando partidos en vivo...</Text>
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
        {/* Header */}
        <Surface
          style={{
            padding: 16,
            marginBottom: 16,
            borderRadius: 12,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon
              name="circle"
              size={12}
              color="#ff4444"
              style={{ marginRight: 8 }}
            />
            <Title style={{ fontSize: 20 }}>Partidos en Vivo</Title>
          </View>
          <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            Sigue los partidos en tiempo real
          </Text>
        </Surface>

        {/* Error */}
        {error && (
          <Surface
            style={{
              backgroundColor: theme.colors.errorContainer,
              padding: 16,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon
                name="alert-circle"
                size={20}
                color={theme.colors.onErrorContainer}
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: theme.colors.onErrorContainer, flex: 1 }}>
                {error}
              </Text>
            </View>
            <Button
              mode="text"
              onPress={loadLiveMatches}
              style={{ alignSelf: 'flex-start', marginTop: 8 }}
              textColor={theme.colors.onErrorContainer}
            >
              Reintentar
            </Button>
          </Surface>
        )}

        {/* Lista de partidos */}
        {liveMatches.length > 0 ? (
          liveMatches.map(renderMatchCard)
        ) : (
          <Card>
            <Card.Content style={{ alignItems: 'center', padding: 32 }}>
              <Icon
                name="volleyball"
                size={64}
                color={theme.colors.onSurfaceVariant}
                style={{ marginBottom: 16 }}
              />
              <Title style={{ textAlign: 'center', marginBottom: 8 }}>
                No hay partidos en vivo
              </Title>
              <Text style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                Actualmente no hay partidos en curso. Revisa más tarde o explora los próximos partidos.
              </Text>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Tournaments' as never)}
                style={{ marginTop: 16 }}
              >
                Ver Torneos
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Información sobre actualizaciones en tiempo real */}
        {isAuthenticated && liveMatches.length > 0 && (
          <Surface
            style={{
              padding: 12,
              marginTop: 16,
              borderRadius: 8,
              backgroundColor: theme.colors.primaryContainer,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon
                name="wifi"
                size={16}
                color={theme.colors.onPrimaryContainer}
                style={{ marginRight: 8 }}
              />
              <Text style={{ 
                color: theme.colors.onPrimaryContainer, 
                fontSize: 12,
                flex: 1 
              }}>
                Los marcadores se actualizan automáticamente en tiempo real
              </Text>
            </View>
          </Surface>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LiveMatchesScreen;