import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import {
  Surface,
  Text,
  Card,
  Chip,
  ActivityIndicator,
  Button,
  Divider,
  DataTable,
} from 'react-native-paper';
import api from '../../services/api';
import { webSocketService } from '../../services/websocket';
import { Match, Set, Player, Rotation } from '../../types';

interface MatchDetailScreenProps {
  navigation: any;
  route: {
    params: {
      matchId: string;
    };
  };
}

const MatchDetailScreen: React.FC<MatchDetailScreenProps> = ({ navigation, route }) => {
  const { matchId } = route.params;
  const [match, setMatch] = useState<Match | null>(null);
  const [sets, setSets] = useState<Set[]>([]);
  const [homeRotation, setHomeRotation] = useState<Rotation | null>(null);
  const [awayRotation, setAwayRotation] = useState<Rotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMatchData = async () => {
    try {
      setLoading(true);
      const [matchResponse, setsResponse] = await Promise.all([
        api.getMatch(matchId),
        api.getMatchSets(matchId)
      ]);
      
      setMatch(matchResponse);
      setSets(setsResponse);
      
      // Cargar rotaciones si el partido está en vivo
      if (matchResponse.data.status === 'live') {
        try {
          const [homeRotResponse, awayRotResponse] = await Promise.all([
            api.getRotation(matchId, matchResponse.home_team.id),
            api.getRotation(matchId, matchResponse.away_team.id)
          ]);
          setHomeRotation(homeRotResponse);
          setAwayRotation(awayRotResponse);
        } catch (rotError) {
          console.log('Rotations not available:', rotError);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading match data:', err);
      setError('Error al cargar los datos del partido');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatchData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadMatchData();

    // Suscribirse a actualizaciones en tiempo real
    const unsubscribe = webSocketService.subscribeToMatch(matchId, (update: any) => {
      setMatch(prev => prev ? {
        ...prev,
        home_sets: update.home_sets,
        away_sets: update.away_sets,
        current_set: update.current_set,
        status: update.status,
      } : null);
    });

    return () => {
      unsubscribe();
    };
  }, [matchId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return '#4caf50';
      case 'completed': return '#2196f3';
      case 'scheduled': return '#ff9800';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_progress': return 'EN VIVO';
      case 'completed': return 'FINALIZADO';
      case 'scheduled': return 'PROGRAMADO';
      case 'cancelled': return 'CANCELADO';
      default: return status.toUpperCase();
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando partido...</Text>
      </View>
    );
  }

  if (error || !match) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: '#d32f2f', marginBottom: 16, textAlign: 'center' }}>
          {error || 'No se pudo cargar el partido'}
        </Text>
        <Button mode="outlined" onPress={onRefresh}>
          Reintentar
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f5f5f5' }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Información del Partido */}
      <Surface style={{ margin: 16, padding: 16, borderRadius: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text variant="headlineSmall">Detalles del Partido</Text>
          <Chip 
            style={{ backgroundColor: getStatusColor(match.status) }}
            textStyle={{ color: 'white', fontWeight: 'bold' }}
          >
            {getStatusText(match.status)}
          </Chip>
        </View>

        {/* Marcador */}
        <Card style={{ marginBottom: 16 }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                  {match.home_team.name}
                </Text>
                <Text variant="bodyMedium" style={{ color: '#666' }}>
                  {match.home_team.club?.name}
                </Text>
              </View>
              
              <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
                <Text variant="displayMedium" style={{ fontWeight: 'bold' }}>
                  {match.home_sets || 0} - {match.away_sets || 0}
                </Text>
                {match.status === 'in_progress' && (
                  <Text variant="bodySmall" style={{ color: '#4caf50' }}>
                    Set {match.current_set || 1}
                  </Text>
                )}
              </View>
              
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                  {match.away_team.name}
                </Text>
                <Text variant="bodyMedium" style={{ color: '#666' }}>
                  {match.away_team.club?.name}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Información del Torneo */}
        <View style={{ marginBottom: 16 }}>
          <Text variant="titleMedium" style={{ marginBottom: 8 }}>Torneo</Text>
          <Text variant="bodyLarge">{match.tournament?.name}</Text>
          <Text variant="bodyMedium" style={{ color: '#666' }}>
            {match.tournament?.category?.name} • {match.tournament?.league?.name}
          </Text>
        </View>

        {/* Fecha y Venue */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={{ marginBottom: 4 }}>Fecha</Text>
            <Text variant="bodyMedium">
              {new Date(match.scheduled_at).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
          {match.venue && (
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={{ marginBottom: 4 }}>Sede</Text>
              <Text variant="bodyMedium">{match.venue.name}</Text>
              <Text variant="bodySmall" style={{ color: '#666' }}>
                {match.venue.address}
              </Text>
            </View>
          )}
        </View>
      </Surface>

      {/* Sets */}
      {sets.length > 0 && (
        <Surface style={{ margin: 16, padding: 16, borderRadius: 8 }}>
          <Text variant="titleLarge" style={{ marginBottom: 16 }}>Sets</Text>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Set</DataTable.Title>
              <DataTable.Title numeric>{match.home_team.name}</DataTable.Title>
              <DataTable.Title numeric>{match.away_team.name}</DataTable.Title>
              <DataTable.Title>Estado</DataTable.Title>
            </DataTable.Header>
            
            {sets.map((set) => (
              <DataTable.Row key={set.id}>
                <DataTable.Cell>{set.set_number}</DataTable.Cell>
                <DataTable.Cell numeric>{set.home_score}</DataTable.Cell>
                <DataTable.Cell numeric>{set.away_score}</DataTable.Cell>
                <DataTable.Cell>
                  <Chip 
                    compact
                    style={{ 
                      backgroundColor: set.status === 'completed' ? '#4caf50' : '#ff9800'
                    }}
                    textStyle={{ color: 'white', fontSize: 12 }}
                  >
                    {set.status === 'completed' ? 'Finalizado' : 'En curso'}
                  </Chip>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Surface>
      )}

      {/* Rotaciones (solo si está en vivo) */}
      {match.status === 'in_progress' && (homeRotation || awayRotation) && (
        <Surface style={{ margin: 16, padding: 16, borderRadius: 8 }}>
          <Text variant="titleLarge" style={{ marginBottom: 16 }}>Rotaciones Actuales</Text>
          
          {homeRotation && (
            <View style={{ marginBottom: 16 }}>
              <Text variant="titleMedium" style={{ marginBottom: 8 }}>
                {match.home_team.name}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {homeRotation.positions.map((position) => (
                  <Chip
                    key={position.position}
                    style={{ margin: 4 }}
                    compact
                  >
                    {position.position}: {position.player?.name || 'Sin asignar'}
                  </Chip>
                ))}
              </View>
            </View>
          )}
          
          {awayRotation && (
            <View>
              <Text variant="titleMedium" style={{ marginBottom: 8 }}>
                {match.away_team.name}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {awayRotation.positions.map((position) => (
                  <Chip
                    key={position.position}
                    style={{ margin: 4 }}
                    compact
                  >
                    {position.position}: {position.player?.name || 'Sin asignar'}
                  </Chip>
                ))}
              </View>
            </View>
          )}
        </Surface>
      )}

      {/* Árbitros */}
      {match.referees && match.referees.length > 0 && (
        <Surface style={{ margin: 16, padding: 16, borderRadius: 8 }}>
          <Text variant="titleLarge" style={{ marginBottom: 16 }}>Árbitros</Text>
          {match.referees.map((referee) => (
            <View key={referee.id} style={{ marginBottom: 8 }}>
              <Text variant="bodyLarge">{referee.name}</Text>
              <Text variant="bodyMedium" style={{ color: '#666' }}>
                {referee.role} • {referee.email}
              </Text>
            </View>
          ))}
        </Surface>
      )}
    </ScrollView>
  );
};

export default MatchDetailScreen;