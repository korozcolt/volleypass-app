import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl, Alert } from 'react-native';
import {
  Surface,
  Text,
  Card,
  Chip,
  Button,
  ActivityIndicator,
  Avatar,
  IconButton,
  Divider,
  List,
  FAB,
  Searchbar,
} from 'react-native-paper';
import { useAuth } from '../../providers/AuthProvider';

interface RefereeMatchesScreenProps {
  navigation: any;
}

interface Match {
  id: string;
  home_team: {
    id: string;
    name: string;
    logo?: string;
  };
  away_team: {
    id: string;
    name: string;
    logo?: string;
  };
  tournament: {
    id: string;
    name: string;
    category: string;
  };
  date: string;
  time: string;
  venue: {
    name: string;
    address: string;
  };
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  referee_role: 'main' | 'assistant' | 'line_judge';
  score?: {
    home_sets: number;
    away_sets: number;
    sets: Array<{
      home_points: number;
      away_points: number;
    }>;
  };
  payment_amount?: number;
  payment_status: 'pending' | 'paid';
  notes?: string;
}

const RefereeMatchesScreen: React.FC<RefereeMatchesScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'today' | 'completed' | 'pending_payment'>('upcoming');

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      
      // Aquí iría la llamada a la API para obtener los partidos del árbitro
      // Por ahora, usamos datos simulados
      const mockMatches: Match[] = [
        {
          id: '1',
          home_team: {
            id: '1',
            name: 'Club Deportivo A',
            logo: undefined
          },
          away_team: {
            id: '2',
            name: 'Equipo Rival B',
            logo: undefined
          },
          tournament: {
            id: '1',
            name: 'Liga Regional 2024',
            category: 'Primera División'
          },
          date: '2024-02-15',
          time: '19:00',
          venue: {
            name: 'Polideportivo Central',
            address: 'Av. Principal 123'
          },
          status: 'scheduled',
          referee_role: 'main',
          payment_amount: 50000,
          payment_status: 'pending'
        },
        {
          id: '2',
          home_team: {
            id: '3',
            name: 'Academia C',
            logo: undefined
          },
          away_team: {
            id: '4',
            name: 'Club D',
            logo: undefined
          },
          tournament: {
            id: '1',
            name: 'Liga Regional 2024',
            category: 'Primera División'
          },
          date: '2024-02-10',
          time: '16:30',
          venue: {
            name: 'Gimnasio Municipal',
            address: 'Calle Deportes 456'
          },
          status: 'completed',
          referee_role: 'main',
          score: {
            home_sets: 3,
            away_sets: 1,
            sets: [
              { home_points: 25, away_points: 22 },
              { home_points: 23, away_points: 25 },
              { home_points: 25, away_points: 18 },
              { home_points: 25, away_points: 20 }
            ]
          },
          payment_amount: 50000,
          payment_status: 'paid'
        },
        {
          id: '3',
          home_team: {
            id: '5',
            name: 'Equipo E',
            logo: undefined
          },
          away_team: {
            id: '6',
            name: 'Club F',
            logo: undefined
          },
          tournament: {
            id: '2',
            name: 'Copa Juvenil 2024',
            category: 'Sub-18'
          },
          date: '2024-02-12',
          time: '14:00',
          venue: {
            name: 'Colegio San José',
            address: 'Av. Educación 789'
          },
          status: 'in_progress',
          referee_role: 'assistant',
          payment_amount: 35000,
          payment_status: 'pending'
        },
        {
          id: '4',
          home_team: {
            id: '7',
            name: 'Selección G',
            logo: undefined
          },
          away_team: {
            id: '8',
            name: 'Academia H',
            logo: undefined
          },
          tournament: {
            id: '1',
            name: 'Liga Regional 2024',
            category: 'Primera División'
          },
          date: '2024-02-08',
          time: '20:00',
          venue: {
            name: 'Polideportivo Norte',
            address: 'Zona Norte, Sector 3'
          },
          status: 'completed',
          referee_role: 'line_judge',
          score: {
            home_sets: 2,
            away_sets: 3,
            sets: [
              { home_points: 25, away_points: 23 },
              { home_points: 22, away_points: 25 },
              { home_points: 25, away_points: 19 },
              { home_points: 20, away_points: 25 },
              { home_points: 13, away_points: 15 }
            ]
          },
          payment_amount: 30000,
          payment_status: 'pending'
        },
        {
          id: '5',
          home_team: {
            id: '9',
            name: 'Club I',
            logo: undefined
          },
          away_team: {
            id: '10',
            name: 'Equipo J',
            logo: undefined
          },
          tournament: {
            id: '3',
            name: 'Torneo Interclubes',
            category: 'Libre'
          },
          date: '2024-02-18',
          time: '17:00',
          venue: {
            name: 'Centro Deportivo Sur',
            address: 'Av. Sur 321'
          },
          status: 'scheduled',
          referee_role: 'main',
          payment_amount: 60000,
          payment_status: 'pending'
        }
      ];
      
      setMatches(mockMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
      Alert.alert('Error', 'No se pudieron cargar los partidos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  }, []);

  const handleStartMatch = (matchId: string) => {
    navigation.navigate('MatchControl', { matchId });
  };

  const handleViewMatch = (matchId: string) => {
    navigation.navigate('MatchDetail', { matchId });
  };

  const handleAcceptMatch = async (matchId: string) => {
    try {
      // Aquí iría la llamada a la API para aceptar el partido
      Alert.alert('Éxito', 'Partido aceptado correctamente');
      await loadMatches();
    } catch (error) {
      Alert.alert('Error', 'No se pudo aceptar el partido');
    }
  };

  const handleDeclineMatch = (matchId: string) => {
    Alert.alert(
      'Rechazar partido',
      '¿Estás seguro de que quieres rechazar este partido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Aquí iría la llamada a la API para rechazar el partido
              Alert.alert('Partido rechazado', 'El partido ha sido rechazado');
              await loadMatches();
            } catch (error) {
              Alert.alert('Error', 'No se pudo rechazar el partido');
            }
          }
        }
      ]
    );
  };

  const getRoleLabel = (role: Match['referee_role']) => {
    switch (role) {
      case 'main': return 'Árbitro Principal';
      case 'assistant': return 'Árbitro Asistente';
      case 'line_judge': return 'Juez de Línea';
      default: return role;
    }
  };

  const getRoleColor = (role: Match['referee_role']) => {
    switch (role) {
      case 'main': return '#1976d2';
      case 'assistant': return '#388e3c';
      case 'line_judge': return '#f57c00';
      default: return '#757575';
    }
  };

  const getStatusLabel = (status: Match['status']) => {
    switch (status) {
      case 'scheduled': return 'Programado';
      case 'in_progress': return 'En Curso';
      case 'completed': return 'Finalizado';
      case 'cancelled': return 'Cancelado';
      case 'postponed': return 'Pospuesto';
      default: return status;
    }
  };

  const getStatusColor = (status: Match['status']) => {
    switch (status) {
      case 'scheduled': return '#2196f3';
      case 'in_progress': return '#4caf50';
      case 'completed': return '#9e9e9e';
      case 'cancelled': return '#f44336';
      case 'postponed': return '#ff9800';
      default: return '#757575';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const matchDate = new Date(dateString);
    return today.toDateString() === matchDate.toDateString();
  };

  const isUpcoming = (dateString: string, status: Match['status']) => {
    const today = new Date();
    const matchDate = new Date(dateString);
    return matchDate >= today && (status === 'scheduled' || status === 'in_progress');
  };

  const filteredMatches = matches.filter(match => {
    // Filtro por búsqueda
    const matchesSearch = searchQuery === '' || 
      match.home_team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.away_team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.venue.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Filtro por categoría
    switch (filter) {
      case 'all': return true;
      case 'upcoming': return isUpcoming(match.date, match.status);
      case 'today': return isToday(match.date);
      case 'completed': return match.status === 'completed';
      case 'pending_payment': return match.payment_status === 'pending';
      default: return true;
    }
  });

  const upcomingMatches = matches.filter(m => isUpcoming(m.date, m.status)).length;
  const todayMatches = matches.filter(m => isToday(m.date)).length;
  const pendingPayments = matches.filter(m => m.payment_status === 'pending').length;

  const filterOptions = [
    { value: 'upcoming', label: 'Próximos' },
    { value: 'today', label: 'Hoy' },
    { value: 'completed', label: 'Finalizados' },
    { value: 'pending_payment', label: 'Pago Pendiente' },
    { value: 'all', label: 'Todos' },
  ];

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando partidos...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header con resumen */}
      <Surface style={{ padding: 16, elevation: 2 }}>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
            Mis Partidos
          </Text>
          <Text variant="bodyMedium" style={{ color: '#666' }}>
            {user?.name} - Árbitro
          </Text>
        </View>

        {/* Resumen de partidos */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-around', 
          marginBottom: 16,
          backgroundColor: todayMatches > 0 ? '#e3f2fd' : '#f5f5f5',
          padding: 12,
          borderRadius: 8
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text variant="headlineSmall" style={{ 
              fontWeight: 'bold', 
              color: todayMatches > 0 ? '#1976d2' : '#666'
            }}>
              {todayMatches}
            </Text>
            <Text variant="bodySmall">Hoy</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#4caf50' }}>
              {upcomingMatches}
            </Text>
            <Text variant="bodySmall">Próximos</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text variant="headlineSmall" style={{ 
              fontWeight: 'bold', 
              color: pendingPayments > 0 ? '#f57c00' : '#666'
            }}>
              {pendingPayments}
            </Text>
            <Text variant="bodySmall">Pago Pend.</Text>
          </View>
        </View>

        {/* Barra de búsqueda */}
        <Searchbar
          placeholder="Buscar partidos..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ marginBottom: 16 }}
        />

        {/* Filtros */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row' }}>
            {filterOptions.map((option) => (
              <Chip
                key={option.value}
                selected={filter === option.value}
                onPress={() => setFilter(option.value as any)}
                style={{ marginRight: 8 }}
              >
                {option.label}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </Surface>

      {/* Lista de partidos */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredMatches.length === 0 ? (
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: 32,
            minHeight: 300
          }}>
            <Avatar.Icon 
              size={64} 
              icon="whistle" 
              style={{ backgroundColor: '#1976d2', marginBottom: 16 }} 
            />
            <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 8 }}>
              {searchQuery ? 'Sin resultados' : `Sin partidos ${filterOptions.find(f => f.value === filter)?.label.toLowerCase()}`}
            </Text>
            <Text variant="bodyMedium" style={{ textAlign: 'center', color: '#666' }}>
              {searchQuery 
                ? 'Intenta con otros términos de búsqueda'
                : 'No hay partidos en esta categoría'
              }
            </Text>
          </View>
        ) : (
          <View style={{ padding: 16 }}>
            {filteredMatches.map((match) => (
              <Card key={match.id} style={{ 
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: getRoleColor(match.referee_role)
              }}>
                <Card.Content>
                  {/* Header del partido */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                        {match.home_team.name} vs {match.away_team.name}
                      </Text>
                      <Text variant="bodySmall" style={{ color: '#666' }}>
                        {match.tournament.name} • {match.tournament.category}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Chip 
                        style={{ backgroundColor: `${getStatusColor(match.status)}20`, marginBottom: 4 }}
                        textStyle={{ color: getStatusColor(match.status), fontWeight: 'bold', fontSize: 12 }}
                      >
                        {getStatusLabel(match.status)}
                      </Chip>
                      <Chip 
                        style={{ backgroundColor: `${getRoleColor(match.referee_role)}20` }}
                        textStyle={{ color: getRoleColor(match.referee_role), fontWeight: 'bold', fontSize: 10 }}
                      >
                        {getRoleLabel(match.referee_role)}
                      </Chip>
                    </View>
                  </View>

                  {/* Información del partido */}
                  <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    marginBottom: 12,
                    padding: 12,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 8
                  }}>
                    <View>
                      <Text variant="bodySmall" style={{ fontWeight: 'bold' }}>Fecha y Hora</Text>
                      <Text variant="bodySmall">{formatDate(match.date)}</Text>
                      <Text variant="bodySmall">{match.time}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text variant="bodySmall" style={{ fontWeight: 'bold' }}>Lugar</Text>
                      <Text variant="bodySmall" style={{ textAlign: 'right' }}>{match.venue.name}</Text>
                      <Text variant="bodySmall" style={{ textAlign: 'right', color: '#666' }}>{match.venue.address}</Text>
                    </View>
                  </View>

                  {/* Resultado (si está disponible) */}
                  {match.score && (
                    <View style={{ 
                      marginBottom: 12, 
                      padding: 12, 
                      backgroundColor: '#e8f5e8', 
                      borderRadius: 8 
                    }}>
                      <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 4 }}>
                        Resultado Final:
                      </Text>
                      <Text variant="titleMedium" style={{ fontWeight: 'bold', textAlign: 'center' }}>
                        {match.home_team.name} {match.score.home_sets} - {match.score.away_sets} {match.away_team.name}
                      </Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 4 }}>
                        {match.score.sets.map((set, index) => (
                          <Text key={index} variant="bodySmall" style={{ marginHorizontal: 4, color: '#666' }}>
                            ({set.home_points}-{set.away_points})
                          </Text>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Información de pago */}
                  {match.payment_amount && (
                    <View style={{ 
                      flexDirection: 'row', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: 12,
                      padding: 12,
                      backgroundColor: match.payment_status === 'paid' ? '#e8f5e8' : '#fff3e0',
                      borderRadius: 8
                    }}>
                      <View>
                        <Text variant="bodySmall" style={{ fontWeight: 'bold' }}>Pago del Arbitraje</Text>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: '#1976d2' }}>
                          ${match.payment_amount.toLocaleString()}
                        </Text>
                      </View>
                      <Chip 
                        style={{ 
                          backgroundColor: match.payment_status === 'paid' ? '#4caf5020' : '#f57c0020'
                        }}
                        textStyle={{ 
                          color: match.payment_status === 'paid' ? '#4caf50' : '#f57c00',
                          fontWeight: 'bold'
                        }}
                      >
                        {match.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                      </Chip>
                    </View>
                  )}

                  {/* Notas adicionales */}
                  {match.notes && (
                    <View style={{ marginBottom: 12 }}>
                      <Text variant="bodySmall" style={{ fontWeight: 'bold', marginBottom: 4 }}>Notas:</Text>
                      <Text variant="bodySmall" style={{ color: '#666' }}>{match.notes}</Text>
                    </View>
                  )}

                  {/* Acciones */}
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {match.status === 'scheduled' && isToday(match.date) && (
                      <Button
                        mode="contained"
                        onPress={() => handleStartMatch(match.id)}
                        style={{ marginRight: 8, marginBottom: 4 }}
                        compact
                      >
                        Iniciar Partido
                      </Button>
                    )}
                    {match.status === 'in_progress' && (
                      <Button
                        mode="contained"
                        onPress={() => handleStartMatch(match.id)}
                        style={{ marginRight: 8, marginBottom: 4 }}
                        compact
                      >
                        Continuar
                      </Button>
                    )}
                    <Button
                      mode="outlined"
                      onPress={() => handleViewMatch(match.id)}
                      style={{ marginRight: 8, marginBottom: 4 }}
                      compact
                    >
                      Ver Detalle
                    </Button>
                    {match.status === 'scheduled' && !isToday(match.date) && (
                      <>
                        <Button
                          mode="text"
                          onPress={() => handleAcceptMatch(match.id)}
                          style={{ marginRight: 8, marginBottom: 4 }}
                          compact
                        >
                          Aceptar
                        </Button>
                        <Button
                          mode="text"
                          onPress={() => handleDeclineMatch(match.id)}
                          style={{ marginBottom: 4 }}
                          textColor="#f44336"
                          compact
                        >
                          Rechazar
                        </Button>
                      </>
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB para escanear QR */}
      <FAB
        icon="qrcode-scan"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: '#1976d2'
        }}
        onPress={() => navigation.navigate('QRScanner')}
      />

      {/* Información adicional */}
      {todayMatches > 0 && (
        <Surface style={{ padding: 16, elevation: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar.Icon 
              size={32} 
              icon="calendar-today" 
              style={{ backgroundColor: '#1976d2', marginRight: 12 }} 
            />
            <View style={{ flex: 1 }}>
              <Text variant="bodySmall" style={{ color: '#666' }}>
                Tienes {todayMatches} partido(s) programado(s) para hoy. ¡Prepárate!
              </Text>
            </View>
          </View>
        </Surface>
      )}
    </View>
  );
};

export default RefereeMatchesScreen;