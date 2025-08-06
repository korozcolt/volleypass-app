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
} from 'react-native-paper';
import { useAuth } from '../../providers/AuthProvider';

interface PlayerSanctionsScreenProps {
  navigation: any;
}

interface Sanction {
  id: string;
  type: 'warning' | 'yellow_card' | 'red_card' | 'suspension' | 'fine';
  reason: string;
  description: string;
  match_id?: string;
  match_info?: {
    date: string;
    opponent: string;
    tournament: string;
  };
  applied_date: string;
  applied_by: string; // Nombre del árbitro
  status: 'active' | 'served' | 'appealed' | 'cancelled';
  expiry_date?: string;
  fine_amount?: number;
  appeal_deadline?: string;
}

const PlayerSanctionsScreen: React.FC<PlayerSanctionsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'served' | 'appealed'>('all');

  useEffect(() => {
    loadSanctions();
  }, []);

  const loadSanctions = async () => {
    try {
      setLoading(true);
      
      // Aquí iría la llamada a la API para obtener las sanciones del jugador
      // Por ahora, usamos datos simulados
      const mockSanctions: Sanction[] = [
        {
          id: '1',
          type: 'yellow_card',
          reason: 'Conducta antideportiva',
          description: 'Protesta excesiva hacia el árbitro durante el segundo set',
          match_id: '123',
          match_info: {
            date: '2024-01-15',
            opponent: 'Club Deportivo A',
            tournament: 'Liga Regional 2024'
          },
          applied_date: '2024-01-15',
          applied_by: 'Árbitro Juan Pérez',
          status: 'served',
          expiry_date: '2024-01-15'
        },
        {
          id: '2',
          type: 'warning',
          reason: 'Retraso en el inicio del partido',
          description: 'Llegada tardía al calentamiento previo al partido',
          match_id: '124',
          match_info: {
            date: '2024-01-08',
            opponent: 'Equipo Rival B',
            tournament: 'Liga Regional 2024'
          },
          applied_date: '2024-01-08',
          applied_by: 'Árbitro María González',
          status: 'served',
          expiry_date: '2024-01-08'
        },
        {
          id: '3',
          type: 'fine',
          reason: 'Ausencia injustificada',
          description: 'No presentación al partido sin aviso previo',
          match_id: '125',
          match_info: {
            date: '2023-12-20',
            opponent: 'Academia D',
            tournament: 'Liga Regional 2024'
          },
          applied_date: '2023-12-21',
          applied_by: 'Comisión Disciplinaria',
          status: 'active',
          fine_amount: 25000,
          appeal_deadline: '2024-02-01'
        },
        {
          id: '4',
          type: 'suspension',
          reason: 'Acumulación de tarjetas amarillas',
          description: 'Suspensión automática por acumular 3 tarjetas amarillas en la temporada',
          applied_date: '2023-11-15',
          applied_by: 'Sistema Automático',
          status: 'served',
          expiry_date: '2023-11-22'
        }
      ];
      
      setSanctions(mockSanctions);
    } catch (error) {
      console.error('Error loading sanctions:', error);
      Alert.alert('Error', 'No se pudieron cargar las sanciones');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSanctions();
    setRefreshing(false);
  }, []);

  const handleAppeal = (sanctionId: string) => {
    Alert.alert(
      'Apelar sanción',
      '¿Deseas apelar esta sanción? Se enviará una solicitud a la comisión disciplinaria.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apelar',
          onPress: async () => {
            try {
              // Aquí iría la llamada a la API para apelar la sanción
              setSanctions(prev => 
                prev.map(sanction => 
                  sanction.id === sanctionId 
                    ? { ...sanction, status: 'appealed' as const }
                    : sanction
                )
              );
              Alert.alert('Éxito', 'Apelación enviada correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo enviar la apelación');
            }
          }
        }
      ]
    );
  };

  const handlePayFine = (sanctionId: string, amount: number) => {
    Alert.alert(
      'Pagar multa',
      `¿Deseas proceder con el pago de $${amount.toLocaleString()}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Pagar',
          onPress: () => {
            // Aquí iría la navegación al sistema de pagos
            navigation.navigate('Payments', { sanctionId, amount });
          }
        }
      ]
    );
  };

  const getSanctionIcon = (type: Sanction['type']) => {
    switch (type) {
      case 'warning': return 'alert';
      case 'yellow_card': return 'card';
      case 'red_card': return 'card';
      case 'suspension': return 'account-cancel';
      case 'fine': return 'currency-usd';
      default: return 'alert-circle';
    }
  };

  const getSanctionColor = (type: Sanction['type']) => {
    switch (type) {
      case 'warning': return '#ff9800';
      case 'yellow_card': return '#ffc107';
      case 'red_card': return '#f44336';
      case 'suspension': return '#9c27b0';
      case 'fine': return '#2196f3';
      default: return '#757575';
    }
  };

  const getSanctionTypeLabel = (type: Sanction['type']) => {
    switch (type) {
      case 'warning': return 'Amonestación';
      case 'yellow_card': return 'Tarjeta Amarilla';
      case 'red_card': return 'Tarjeta Roja';
      case 'suspension': return 'Suspensión';
      case 'fine': return 'Multa';
      default: return 'Sanción';
    }
  };

  const getStatusLabel = (status: Sanction['status']) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'served': return 'Cumplida';
      case 'appealed': return 'Apelada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getStatusColor = (status: Sanction['status']) => {
    switch (status) {
      case 'active': return '#f44336';
      case 'served': return '#4caf50';
      case 'appealed': return '#ff9800';
      case 'cancelled': return '#9e9e9e';
      default: return '#757575';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredSanctions = sanctions.filter(sanction => {
    if (filter === 'all') return true;
    return sanction.status === filter;
  });

  const activeSanctions = sanctions.filter(s => s.status === 'active').length;
  const totalSanctions = sanctions.length;

  const filterOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'active', label: 'Activas' },
    { value: 'served', label: 'Cumplidas' },
    { value: 'appealed', label: 'Apeladas' },
  ];

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando sanciones...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header con resumen */}
      <Surface style={{ padding: 16, elevation: 2 }}>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
            Mis Sanciones
          </Text>
          <Text variant="bodyMedium" style={{ color: '#666' }}>
            {user?.name} - #{user?.jersey_number || 'N/A'}
          </Text>
        </View>

        {/* Resumen de sanciones */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-around', 
          marginBottom: 16,
          backgroundColor: activeSanctions > 0 ? '#ffebee' : '#e8f5e8',
          padding: 12,
          borderRadius: 8
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text variant="headlineSmall" style={{ 
              fontWeight: 'bold', 
              color: activeSanctions > 0 ? '#d32f2f' : '#2e7d32'
            }}>
              {activeSanctions}
            </Text>
            <Text variant="bodySmall">Activas</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: '#1976d2' }}>
              {totalSanctions}
            </Text>
            <Text variant="bodySmall">Total</Text>
          </View>
        </View>

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

      {/* Lista de sanciones */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredSanctions.length === 0 ? (
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: 32,
            minHeight: 300
          }}>
            <Avatar.Icon 
              size={64} 
              icon="shield-check" 
              style={{ backgroundColor: '#4caf50', marginBottom: 16 }} 
            />
            <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 8 }}>
              {filter === 'all' ? 'Sin sanciones' : `Sin sanciones ${filterOptions.find(f => f.value === filter)?.label.toLowerCase()}`}
            </Text>
            <Text variant="bodyMedium" style={{ textAlign: 'center', color: '#666' }}>
              {filter === 'all' 
                ? '¡Excelente! No tienes sanciones registradas'
                : 'No hay sanciones en esta categoría'
              }
            </Text>
          </View>
        ) : (
          <View style={{ padding: 16 }}>
            {filteredSanctions.map((sanction) => (
              <Card key={sanction.id} style={{ marginBottom: 16 }}>
                <Card.Content>
                  {/* Header de la sanción */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <Avatar.Icon
                        size={40}
                        icon={getSanctionIcon(sanction.type)}
                        style={{ backgroundColor: getSanctionColor(sanction.type), marginRight: 12 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                          {getSanctionTypeLabel(sanction.type)}
                        </Text>
                        <Text variant="bodySmall" style={{ color: '#666' }}>
                          {formatDate(sanction.applied_date)}
                        </Text>
                      </View>
                    </View>
                    <Chip 
                      style={{ backgroundColor: `${getStatusColor(sanction.status)}20` }}
                      textStyle={{ color: getStatusColor(sanction.status), fontWeight: 'bold' }}
                    >
                      {getStatusLabel(sanction.status)}
                    </Chip>
                  </View>

                  {/* Información de la sanción */}
                  <View style={{ marginBottom: 12 }}>
                    <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 4 }}>
                      Motivo:
                    </Text>
                    <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
                      {sanction.reason}
                    </Text>
                    <Text variant="bodyMedium" style={{ color: '#666' }}>
                      {sanction.description}
                    </Text>
                  </View>

                  {/* Información del partido (si aplica) */}
                  {sanction.match_info && (
                    <View style={{ marginBottom: 12, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                      <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 4 }}>
                        Partido:
                      </Text>
                      <Text variant="bodySmall">
                        vs {sanction.match_info.opponent} • {formatDate(sanction.match_info.date)}
                      </Text>
                      <Text variant="bodySmall" style={{ color: '#666' }}>
                        {sanction.match_info.tournament}
                      </Text>
                    </View>
                  )}

                  {/* Información adicional */}
                  <View style={{ marginBottom: 12 }}>
                    <Text variant="bodySmall" style={{ color: '#666' }}>
                      Aplicada por: {sanction.applied_by}
                    </Text>
                    {sanction.expiry_date && (
                      <Text variant="bodySmall" style={{ color: '#666' }}>
                        Vencimiento: {formatDate(sanction.expiry_date)}
                      </Text>
                    )}
                    {sanction.fine_amount && (
                      <Text variant="bodySmall" style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                        Multa: ${sanction.fine_amount.toLocaleString()}
                      </Text>
                    )}
                    {sanction.appeal_deadline && sanction.status === 'active' && (
                      <Text variant="bodySmall" style={{ color: '#ff9800' }}>
                        Plazo para apelar: {formatDate(sanction.appeal_deadline)}
                      </Text>
                    )}
                  </View>

                  {/* Acciones */}
                  {sanction.status === 'active' && (
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                      {sanction.appeal_deadline && new Date(sanction.appeal_deadline) > new Date() && (
                        <Button
                          mode="outlined"
                          onPress={() => handleAppeal(sanction.id)}
                          style={{ marginRight: 8 }}
                          compact
                        >
                          Apelar
                        </Button>
                      )}
                      {sanction.fine_amount && (
                        <Button
                          mode="contained"
                          onPress={() => handlePayFine(sanction.id, sanction.fine_amount!)}
                          compact
                        >
                          Pagar Multa
                        </Button>
                      )}
                      {sanction.match_id && (
                        <Button
                          mode="text"
                          onPress={() => navigation.navigate('MatchDetail', { matchId: sanction.match_id })}
                          compact
                        >
                          Ver Partido
                        </Button>
                      )}
                    </View>
                  )}
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Información adicional */}
      {activeSanctions > 0 && (
        <Surface style={{ padding: 16, elevation: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar.Icon 
              size={32} 
              icon="information" 
              style={{ backgroundColor: '#2196f3', marginRight: 12 }} 
            />
            <View style={{ flex: 1 }}>
              <Text variant="bodySmall" style={{ color: '#666' }}>
                Tienes sanciones activas. Revisa los detalles y toma las acciones necesarias.
              </Text>
            </View>
          </View>
        </Surface>
      )}
    </View>
  );
};

export default PlayerSanctionsScreen;