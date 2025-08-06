import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl, Dimensions } from 'react-native';
import {
  Surface,
  Text,
  Card,
  Chip,
  Button,
  ActivityIndicator,
  Divider,
  DataTable,
  ProgressBar,
} from 'react-native-paper';
import { useAuth } from '../../providers/AuthProvider';

interface PlayerStatsScreenProps {
  navigation: any;
}

interface PlayerStats {
  season: string;
  matches_played: number;
  sets_played: number;
  points_scored: number;
  attacks: {
    total: number;
    successful: number;
    errors: number;
    percentage: number;
  };
  serves: {
    total: number;
    aces: number;
    errors: number;
    percentage: number;
  };
  blocks: {
    total: number;
    solo: number;
    assisted: number;
  };
  digs: number;
  receptions: {
    total: number;
    perfect: number;
    good: number;
    errors: number;
    percentage: number;
  };
  sets: {
    total: number;
    successful: number;
    errors: number;
    percentage: number;
  };
}

interface MatchHistory {
  id: string;
  date: string;
  opponent: string;
  result: 'win' | 'loss';
  sets_score: string;
  points_scored: number;
  playing_time: string;
  position: string;
}

const PlayerStatsScreen: React.FC<PlayerStatsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState('2024');
  const [viewMode, setViewMode] = useState<'stats' | 'history'>('stats');

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadPlayerStats();
  }, [selectedSeason]);

  const loadPlayerStats = async () => {
    try {
      setLoading(true);
      
      // Aquí iría la llamada a la API para obtener las estadísticas del jugador
      // Por ahora, usamos datos simulados
      const mockStats: PlayerStats = {
        season: selectedSeason,
        matches_played: 18,
        sets_played: 52,
        points_scored: 247,
        attacks: {
          total: 312,
          successful: 198,
          errors: 28,
          percentage: 63.5
        },
        serves: {
          total: 89,
          aces: 12,
          errors: 8,
          percentage: 91.0
        },
        blocks: {
          total: 34,
          solo: 8,
          assisted: 26
        },
        digs: 156,
        receptions: {
          total: 234,
          perfect: 89,
          good: 112,
          errors: 33,
          percentage: 85.9
        },
        sets: {
          total: 45,
          successful: 38,
          errors: 7,
          percentage: 84.4
        }
      };

      const mockHistory: MatchHistory[] = [
        {
          id: '1',
          date: '2024-01-15',
          opponent: 'Club Deportivo A',
          result: 'win',
          sets_score: '3-1',
          points_scored: 18,
          playing_time: '1h 45m',
          position: 'Atacante Exterior'
        },
        {
          id: '2',
          date: '2024-01-08',
          opponent: 'Equipo Rival B',
          result: 'loss',
          sets_score: '1-3',
          points_scored: 12,
          playing_time: '1h 32m',
          position: 'Atacante Exterior'
        },
        {
          id: '3',
          date: '2024-01-01',
          opponent: 'Voleibol Club C',
          result: 'win',
          sets_score: '3-0',
          points_scored: 15,
          playing_time: '1h 18m',
          position: 'Atacante Exterior'
        },
        {
          id: '4',
          date: '2023-12-20',
          opponent: 'Academia D',
          result: 'win',
          sets_score: '3-2',
          points_scored: 22,
          playing_time: '2h 05m',
          position: 'Atacante Exterior'
        },
        {
          id: '5',
          date: '2023-12-15',
          opponent: 'Club Elite E',
          result: 'loss',
          sets_score: '2-3',
          points_scored: 16,
          playing_time: '1h 58m',
          position: 'Atacante Exterior'
        }
      ];
      
      setStats(mockStats);
      setMatchHistory(mockHistory);
    } catch (error) {
      console.error('Error loading player stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPlayerStats();
    setRefreshing(false);
  }, [selectedSeason]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getEfficiencyColor = (percentage: number) => {
    if (percentage >= 80) return '#4caf50';
    if (percentage >= 60) return '#ff9800';
    return '#f44336';
  };

  const seasons = ['2024', '2023', '2022'];

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando estadísticas...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header con información del jugador */}
      <Surface style={{ padding: 16, elevation: 2 }}>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
            Mis Estadísticas
          </Text>
          <Text variant="bodyMedium" style={{ color: '#666' }}>
            {user?.name} - #{user?.jersey_number || 'N/A'}
          </Text>
          <Text variant="bodySmall" style={{ color: '#666', textTransform: 'capitalize' }}>
            {user?.position || 'Posición no definida'}
          </Text>
        </View>

        {/* Selector de temporada */}
        <View style={{ marginBottom: 16 }}>
          <Text variant="titleMedium" style={{ marginBottom: 8 }}>Temporada:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row' }}>
              {seasons.map((season) => (
                <Chip
                  key={season}
                  selected={selectedSeason === season}
                  onPress={() => setSelectedSeason(season)}
                  style={{ marginRight: 8 }}
                >
                  {season}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Selector de vista */}
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <Button
            mode={viewMode === 'stats' ? 'contained' : 'outlined'}
            onPress={() => setViewMode('stats')}
            style={{ marginRight: 8, flex: 1 }}
            compact
          >
            Estadísticas
          </Button>
          <Button
            mode={viewMode === 'history' ? 'contained' : 'outlined'}
            onPress={() => setViewMode('history')}
            style={{ marginLeft: 8, flex: 1 }}
            compact
          >
            Historial
          </Button>
        </View>
      </Surface>

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {viewMode === 'stats' && stats ? (
          <View style={{ padding: 16 }}>
            {/* Resumen general */}
            <Card style={{ marginBottom: 16 }}>
              <Card.Content>
                <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                  Resumen Temporada {stats.season}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {stats.matches_played}
                    </Text>
                    <Text variant="bodySmall">Partidos</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {stats.sets_played}
                    </Text>
                    <Text variant="bodySmall">Sets</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {stats.points_scored}
                    </Text>
                    <Text variant="bodySmall">Puntos</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Estadísticas de ataque */}
            <Card style={{ marginBottom: 16 }}>
              <Card.Content>
                <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                  Ataque
                </Text>
                <View style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text>Efectividad</Text>
                    <Text style={{ fontWeight: 'bold', color: getEfficiencyColor(stats.attacks.percentage) }}>
                      {stats.attacks.percentage}%
                    </Text>
                  </View>
                  <ProgressBar 
                    progress={stats.attacks.percentage / 100} 
                    color={getEfficiencyColor(stats.attacks.percentage)}
                  />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{stats.attacks.total}</Text>
                    <Text variant="bodySmall">Total</Text>
                  </View>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', color: '#4caf50' }}>
                      {stats.attacks.successful}
                    </Text>
                    <Text variant="bodySmall">Exitosos</Text>
                  </View>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', color: '#f44336' }}>
                      {stats.attacks.errors}
                    </Text>
                    <Text variant="bodySmall">Errores</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Estadísticas de saque */}
            <Card style={{ marginBottom: 16 }}>
              <Card.Content>
                <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                  Saque
                </Text>
                <View style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text>Efectividad</Text>
                    <Text style={{ fontWeight: 'bold', color: getEfficiencyColor(stats.serves.percentage) }}>
                      {stats.serves.percentage}%
                    </Text>
                  </View>
                  <ProgressBar 
                    progress={stats.serves.percentage / 100} 
                    color={getEfficiencyColor(stats.serves.percentage)}
                  />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{stats.serves.total}</Text>
                    <Text variant="bodySmall">Total</Text>
                  </View>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', color: '#4caf50' }}>
                      {stats.serves.aces}
                    </Text>
                    <Text variant="bodySmall">Aces</Text>
                  </View>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', color: '#f44336' }}>
                      {stats.serves.errors}
                    </Text>
                    <Text variant="bodySmall">Errores</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Estadísticas de recepción */}
            <Card style={{ marginBottom: 16 }}>
              <Card.Content>
                <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                  Recepción
                </Text>
                <View style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text>Efectividad</Text>
                    <Text style={{ fontWeight: 'bold', color: getEfficiencyColor(stats.receptions.percentage) }}>
                      {stats.receptions.percentage}%
                    </Text>
                  </View>
                  <ProgressBar 
                    progress={stats.receptions.percentage / 100} 
                    color={getEfficiencyColor(stats.receptions.percentage)}
                  />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{stats.receptions.total}</Text>
                    <Text variant="bodySmall">Total</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', color: '#4caf50' }}>
                      {stats.receptions.perfect}
                    </Text>
                    <Text variant="bodySmall">Perfectas</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', color: '#ff9800' }}>
                      {stats.receptions.good}
                    </Text>
                    <Text variant="bodySmall">Buenas</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', color: '#f44336' }}>
                      {stats.receptions.errors}
                    </Text>
                    <Text variant="bodySmall">Errores</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Otras estadísticas */}
            <Card style={{ marginBottom: 16 }}>
              <Card.Content>
                <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: 'bold' }}>
                  Otras Estadísticas
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {stats.blocks.total}
                    </Text>
                    <Text variant="bodySmall">Bloqueos</Text>
                    <Text variant="bodySmall" style={{ color: '#666' }}>
                      ({stats.blocks.solo} solo, {stats.blocks.assisted} asist.)
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {stats.digs}
                    </Text>
                    <Text variant="bodySmall">Defensas</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', color: '#1976d2' }}>
                      {stats.sets.successful}/{stats.sets.total}
                    </Text>
                    <Text variant="bodySmall">Armados</Text>
                    <Text variant="bodySmall" style={{ color: '#666' }}>
                      ({stats.sets.percentage}%)
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </View>
        ) : (
          /* Historial de partidos */
          <View style={{ padding: 16 }}>
            <Text variant="titleMedium" style={{ marginBottom: 16, fontWeight: 'bold' }}>
              Historial de Partidos
            </Text>
            {matchHistory.map((match) => (
              <Card key={match.id} style={{ marginBottom: 12 }}>
                <Card.Content>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold', flex: 1 }}>
                      vs {match.opponent}
                    </Text>
                    <Chip 
                      style={{ 
                        backgroundColor: match.result === 'win' ? '#e8f5e8' : '#ffebee',
                      }}
                      textStyle={{ 
                        color: match.result === 'win' ? '#2e7d32' : '#c62828',
                        fontWeight: 'bold'
                      }}
                    >
                      {match.result === 'win' ? 'Victoria' : 'Derrota'}
                    </Chip>
                  </View>
                  <Text variant="bodyMedium" style={{ marginBottom: 4 }}>
                    {formatDate(match.date)} • {match.sets_score}
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text variant="bodySmall" style={{ color: '#666' }}>
                      {match.points_scored} puntos • {match.playing_time}
                    </Text>
                    <Text variant="bodySmall" style={{ color: '#666' }}>
                      {match.position}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PlayerStatsScreen;