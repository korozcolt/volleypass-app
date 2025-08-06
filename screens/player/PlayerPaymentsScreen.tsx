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
} from 'react-native-paper';
import { useAuth } from '../../providers/AuthProvider';

interface PlayerPaymentsScreenProps {
  navigation: any;
}

interface Payment {
  id: string;
  type: 'registration' | 'monthly_fee' | 'fine' | 'equipment' | 'tournament' | 'other';
  description: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  payment_method?: 'cash' | 'card' | 'transfer' | 'online';
  reference_number?: string;
  related_id?: string; // ID de sanción, torneo, etc.
  installments?: {
    total: number;
    paid: number;
    next_due_date: string;
  };
}

const PlayerPaymentsScreen: React.FC<PlayerPaymentsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      
      // Aquí iría la llamada a la API para obtener los pagos del jugador
      // Por ahora, usamos datos simulados
      const mockPayments: Payment[] = [
        {
          id: '1',
          type: 'monthly_fee',
          description: 'Cuota mensual - Enero 2024',
          amount: 50000,
          due_date: '2024-01-31',
          paid_date: '2024-01-28',
          status: 'paid',
          payment_method: 'transfer',
          reference_number: 'TRF-2024-001'
        },
        {
          id: '2',
          type: 'monthly_fee',
          description: 'Cuota mensual - Febrero 2024',
          amount: 50000,
          due_date: '2024-02-29',
          status: 'pending'
        },
        {
          id: '3',
          type: 'fine',
          description: 'Multa por ausencia injustificada',
          amount: 25000,
          due_date: '2024-02-15',
          status: 'overdue',
          related_id: 'sanction_3'
        },
        {
          id: '4',
          type: 'tournament',
          description: 'Inscripción Torneo Regional 2024',
          amount: 75000,
          due_date: '2024-03-01',
          status: 'pending',
          installments: {
            total: 3,
            paid: 1,
            next_due_date: '2024-02-15'
          }
        },
        {
          id: '5',
          type: 'equipment',
          description: 'Uniforme oficial temporada 2024',
          amount: 120000,
          due_date: '2024-01-15',
          paid_date: '2024-01-10',
          status: 'paid',
          payment_method: 'card',
          reference_number: 'CARD-2024-005'
        },
        {
          id: '6',
          type: 'registration',
          description: 'Inscripción anual 2024',
          amount: 200000,
          due_date: '2024-01-01',
          paid_date: '2023-12-28',
          status: 'paid',
          payment_method: 'cash',
          reference_number: 'CASH-2023-120'
        }
      ];
      
      setPayments(mockPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
      Alert.alert('Error', 'No se pudieron cargar los pagos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  }, []);

  const handlePayment = (paymentId: string, amount: number) => {
    Alert.alert(
      'Realizar pago',
      `¿Deseas proceder con el pago de $${amount.toLocaleString()}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Pagar',
          onPress: () => {
            // Aquí iría la navegación al sistema de pagos
            navigation.navigate('PaymentMethods', { paymentId, amount });
          }
        }
      ]
    );
  };

  const handleViewReceipt = (payment: Payment) => {
    if (payment.status === 'paid' && payment.reference_number) {
      navigation.navigate('PaymentReceipt', { 
        paymentId: payment.id,
        referenceNumber: payment.reference_number 
      });
    }
  };

  const getPaymentIcon = (type: Payment['type']) => {
    switch (type) {
      case 'registration': return 'account-plus';
      case 'monthly_fee': return 'calendar-month';
      case 'fine': return 'gavel';
      case 'equipment': return 'tshirt-crew';
      case 'tournament': return 'trophy';
      case 'other': return 'currency-usd';
      default: return 'currency-usd';
    }
  };

  const getPaymentColor = (type: Payment['type']) => {
    switch (type) {
      case 'registration': return '#4caf50';
      case 'monthly_fee': return '#2196f3';
      case 'fine': return '#f44336';
      case 'equipment': return '#ff9800';
      case 'tournament': return '#9c27b0';
      case 'other': return '#607d8b';
      default: return '#757575';
    }
  };

  const getPaymentTypeLabel = (type: Payment['type']) => {
    switch (type) {
      case 'registration': return 'Inscripción';
      case 'monthly_fee': return 'Cuota Mensual';
      case 'fine': return 'Multa';
      case 'equipment': return 'Equipamiento';
      case 'tournament': return 'Torneo';
      case 'other': return 'Otro';
      default: return 'Pago';
    }
  };

  const getStatusLabel = (status: Payment['status']) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'paid': return 'Pagado';
      case 'overdue': return 'Vencido';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'paid': return '#4caf50';
      case 'overdue': return '#f44336';
      case 'cancelled': return '#9e9e9e';
      default: return '#757575';
    }
  };

  const getPaymentMethodLabel = (method?: Payment['payment_method']) => {
    switch (method) {
      case 'cash': return 'Efectivo';
      case 'card': return 'Tarjeta';
      case 'transfer': return 'Transferencia';
      case 'online': return 'Pago Online';
      default: return 'N/A';
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

  const isOverdue = (dueDate: string, status: Payment['status']) => {
    return status === 'pending' && new Date(dueDate) < new Date();
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return isOverdue(payment.due_date, payment.status);
    return payment.status === filter;
  });

  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const overduePayments = payments.filter(p => isOverdue(p.due_date, p.status)).length;
  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const filterOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'overdue', label: 'Vencidos' },
    { value: 'paid', label: 'Pagados' },
  ];

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando pagos...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header con resumen */}
      <Surface style={{ padding: 16, elevation: 2 }}>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
            Mis Pagos
          </Text>
          <Text variant="bodyMedium" style={{ color: '#666' }}>
            {user?.name} - #{user?.jersey_number || 'N/A'}
          </Text>
        </View>

        {/* Resumen de pagos */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-around', 
          marginBottom: 16,
          backgroundColor: overduePayments > 0 ? '#ffebee' : pendingPayments > 0 ? '#fff3e0' : '#e8f5e8',
          padding: 12,
          borderRadius: 8
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text variant="headlineSmall" style={{ 
              fontWeight: 'bold', 
              color: overduePayments > 0 ? '#d32f2f' : pendingPayments > 0 ? '#f57c00' : '#2e7d32'
            }}>
              {pendingPayments}
            </Text>
            <Text variant="bodySmall">Pendientes</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text variant="headlineSmall" style={{ 
              fontWeight: 'bold', 
              color: overduePayments > 0 ? '#d32f2f' : '#666'
            }}>
              {overduePayments}
            </Text>
            <Text variant="bodySmall">Vencidos</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text variant="titleMedium" style={{ 
              fontWeight: 'bold', 
              color: totalPending > 0 ? '#d32f2f' : '#2e7d32'
            }}>
              ${(totalPending / 1000).toFixed(0)}K
            </Text>
            <Text variant="bodySmall">Total Pendiente</Text>
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

      {/* Lista de pagos */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredPayments.length === 0 ? (
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: 32,
            minHeight: 300
          }}>
            <Avatar.Icon 
              size={64} 
              icon="credit-card-check" 
              style={{ backgroundColor: '#4caf50', marginBottom: 16 }} 
            />
            <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 8 }}>
              {filter === 'all' ? 'Sin pagos registrados' : `Sin pagos ${filterOptions.find(f => f.value === filter)?.label.toLowerCase()}`}
            </Text>
            <Text variant="bodyMedium" style={{ textAlign: 'center', color: '#666' }}>
              {filter === 'all' 
                ? 'No tienes pagos registrados en el sistema'
                : 'No hay pagos en esta categoría'
              }
            </Text>
          </View>
        ) : (
          <View style={{ padding: 16 }}>
            {filteredPayments.map((payment) => {
              const isPaymentOverdue = isOverdue(payment.due_date, payment.status);
              
              return (
                <Card key={payment.id} style={{ 
                  marginBottom: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: isPaymentOverdue ? '#f44336' : getStatusColor(payment.status)
                }}>
                  <Card.Content>
                    {/* Header del pago */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Avatar.Icon
                          size={40}
                          icon={getPaymentIcon(payment.type)}
                          style={{ backgroundColor: getPaymentColor(payment.type), marginRight: 12 }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                            {getPaymentTypeLabel(payment.type)}
                          </Text>
                          <Text variant="bodySmall" style={{ color: '#666' }}>
                            Vence: {formatDate(payment.due_date)}
                          </Text>
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text variant="titleLarge" style={{ fontWeight: 'bold', color: '#1976d2' }}>
                          ${payment.amount.toLocaleString()}
                        </Text>
                        <Chip 
                          style={{ backgroundColor: `${getStatusColor(isPaymentOverdue ? 'overdue' : payment.status)}20` }}
                          textStyle={{ 
                            color: getStatusColor(isPaymentOverdue ? 'overdue' : payment.status), 
                            fontWeight: 'bold',
                            fontSize: 12
                          }}
                        >
                          {isPaymentOverdue ? 'Vencido' : getStatusLabel(payment.status)}
                        </Chip>
                      </View>
                    </View>

                    {/* Descripción */}
                    <Text variant="bodyMedium" style={{ marginBottom: 12, color: '#666' }}>
                      {payment.description}
                    </Text>

                    {/* Información de cuotas (si aplica) */}
                    {payment.installments && (
                      <View style={{ 
                        marginBottom: 12, 
                        padding: 12, 
                        backgroundColor: '#e3f2fd', 
                        borderRadius: 8 
                      }}>
                        <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 4 }}>
                          Plan de cuotas:
                        </Text>
                        <Text variant="bodySmall">
                          {payment.installments.paid} de {payment.installments.total} cuotas pagadas
                        </Text>
                        <Text variant="bodySmall" style={{ color: '#666' }}>
                          Próxima cuota: {formatDate(payment.installments.next_due_date)}
                        </Text>
                      </View>
                    )}

                    {/* Información de pago (si está pagado) */}
                    {payment.status === 'paid' && (
                      <View style={{ 
                        marginBottom: 12, 
                        padding: 12, 
                        backgroundColor: '#e8f5e8', 
                        borderRadius: 8 
                      }}>
                        <Text variant="titleSmall" style={{ fontWeight: 'bold', marginBottom: 4 }}>
                          Información de pago:
                        </Text>
                        <Text variant="bodySmall">
                          Fecha: {payment.paid_date ? formatDate(payment.paid_date) : 'N/A'}
                        </Text>
                        <Text variant="bodySmall">
                          Método: {getPaymentMethodLabel(payment.payment_method)}
                        </Text>
                        {payment.reference_number && (
                          <Text variant="bodySmall" style={{ color: '#666' }}>
                            Referencia: {payment.reference_number}
                          </Text>
                        )}
                      </View>
                    )}

                    {/* Acciones */}
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                      {payment.status === 'pending' && (
                        <Button
                          mode="contained"
                          onPress={() => handlePayment(payment.id, payment.amount)}
                          style={{ marginRight: 8 }}
                          compact
                        >
                          Pagar
                        </Button>
                      )}
                      {payment.status === 'paid' && payment.reference_number && (
                        <Button
                          mode="outlined"
                          onPress={() => handleViewReceipt(payment)}
                          style={{ marginRight: 8 }}
                          compact
                        >
                          Ver Recibo
                        </Button>
                      )}
                      {payment.related_id && (
                        <Button
                          mode="text"
                          onPress={() => {
                            if (payment.type === 'fine') {
                              navigation.navigate('PlayerSanctions');
                            } else if (payment.type === 'tournament') {
                              navigation.navigate('TournamentDetail', { tournamentId: payment.related_id });
                            }
                          }}
                          compact
                        >
                          Ver Detalle
                        </Button>
                      )}
                    </View>
                  </Card.Content>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* FAB para agregar pago manual */}
      <FAB
        icon="plus"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: '#1976d2'
        }}
        onPress={() => navigation.navigate('AddPayment')}
      />

      {/* Información adicional */}
      {(pendingPayments > 0 || overduePayments > 0) && (
        <Surface style={{ padding: 16, elevation: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar.Icon 
              size={32} 
              icon={overduePayments > 0 ? "alert" : "information"} 
              style={{ 
                backgroundColor: overduePayments > 0 ? '#f44336' : '#2196f3', 
                marginRight: 12 
              }} 
            />
            <View style={{ flex: 1 }}>
              <Text variant="bodySmall" style={{ color: '#666' }}>
                {overduePayments > 0 
                  ? `Tienes ${overduePayments} pago(s) vencido(s). Realiza el pago lo antes posible.`
                  : `Tienes ${pendingPayments} pago(s) pendiente(s) por un total de $${totalPending.toLocaleString()}.`
                }
              </Text>
            </View>
          </View>
        </Surface>
      )}
    </View>
  );
};

export default PlayerPaymentsScreen;