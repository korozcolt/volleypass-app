import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl, Alert } from 'react-native';
import {
  Surface,
  Text,
  List,
  Avatar,
  Button,
  Chip,
  Divider,
  ActivityIndicator,
  IconButton,
  Badge,
  FAB,
} from 'react-native-paper';
import { useAuth } from '../../providers/AuthProvider';

interface NotificationsScreenProps {
  navigation: any;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'match' | 'tournament' | 'system' | 'sanction' | 'payment' | 'general';
  read: boolean;
  created_at: string;
  data?: any; // Datos adicionales específicos del tipo de notificación
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'match' | 'tournament' | 'system'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // Aquí iría la llamada a la API para obtener las notificaciones
      // Por ahora, usamos datos simulados
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Partido próximo',
          message: 'Tienes un partido programado para mañana a las 19:00 vs Club Deportivo',
          type: 'match',
          read: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
          data: { match_id: '123', opponent: 'Club Deportivo' }
        },
        {
          id: '2',
          title: 'Nuevo torneo disponible',
          message: 'Se ha abierto la inscripción para el Torneo Regional 2024',
          type: 'tournament',
          read: false,
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 horas atrás
          data: { tournament_id: '456' }
        },
        {
          id: '3',
          title: 'Sanción aplicada',
          message: 'Se te ha aplicado una amonestación por conducta antideportiva',
          type: 'sanction',
          read: true,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
          data: { sanction_type: 'warning', match_id: '122' }
        },
        {
          id: '4',
          title: 'Pago pendiente',
          message: 'Tienes un pago pendiente de $50.000 por inscripción al torneo',
          type: 'payment',
          read: false,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días atrás
          data: { amount: 50000, concept: 'Inscripción torneo' }
        },
        {
          id: '5',
          title: 'Actualización del sistema',
          message: 'Nueva versión de la aplicación disponible con mejoras en el rendimiento',
          type: 'system',
          read: true,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 días atrás
        },
        {
          id: '6',
          title: 'Cambio de horario',
          message: 'El partido del sábado se ha reprogramado para las 16:00',
          type: 'match',
          read: true,
          created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 días atrás
          data: { match_id: '124', new_time: '16:00' }
        },
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'No se pudieron cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      // Aquí iría la llamada a la API para marcar como leída
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Aquí iría la llamada a la API para marcar todas como leídas
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      Alert.alert('Error', 'No se pudieron marcar las notificaciones como leídas');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    Alert.alert(
      'Eliminar notificación',
      '¿Estás seguro de que quieres eliminar esta notificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Aquí iría la llamada a la API para eliminar
              setNotifications(prev => 
                prev.filter(notif => notif.id !== notificationId)
              );
            } catch (error) {
              console.error('Error deleting notification:', error);
              Alert.alert('Error', 'No se pudo eliminar la notificación');
            }
          }
        }
      ]
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    // Marcar como leída si no lo está
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navegar según el tipo de notificación
    switch (notification.type) {
      case 'match':
        if (notification.data?.match_id) {
          navigation.navigate('MatchDetail', { matchId: notification.data.match_id });
        }
        break;
      case 'tournament':
        if (notification.data?.tournament_id) {
          navigation.navigate('TournamentDetail', { tournamentId: notification.data.tournament_id });
        }
        break;
      case 'payment':
        navigation.navigate('Payments');
        break;
      case 'sanction':
        navigation.navigate('Sanctions');
        break;
      default:
        // Para notificaciones generales o del sistema, no navegar
        break;
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'match': return 'volleyball';
      case 'tournament': return 'trophy';
      case 'sanction': return 'alert-circle';
      case 'payment': return 'credit-card';
      case 'system': return 'cog';
      default: return 'bell';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'match': return '#4caf50';
      case 'tournament': return '#ff9800';
      case 'sanction': return '#f44336';
      case 'payment': return '#2196f3';
      case 'system': return '#9c27b0';
      default: return '#757575';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread': return !notif.read;
      case 'match': return notif.type === 'match';
      case 'tournament': return notif.type === 'tournament';
      case 'system': return notif.type === 'system';
      default: return true;
    }
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;

  const filterOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'unread', label: 'No leídas' },
    { value: 'match', label: 'Partidos' },
    { value: 'tournament', label: 'Torneos' },
    { value: 'system', label: 'Sistema' },
  ];

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando notificaciones...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header con estadísticas */}
      <Surface style={{ padding: 16, elevation: 2 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
              Notificaciones
            </Text>
            <Text variant="bodyMedium" style={{ color: '#666' }}>
              {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas leídas'}
            </Text>
          </View>
          {unreadCount > 0 && (
            <Button
              mode="outlined"
              onPress={markAllAsRead}
              compact
            >
              Marcar todas como leídas
            </Button>
          )}
        </View>

        {/* Filtros */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 16 }}
        >
          <View style={{ flexDirection: 'row' }}>
            {filterOptions.map((option) => (
              <Chip
                key={option.value}
                selected={filter === option.value}
                onPress={() => setFilter(option.value as any)}
                style={{ marginRight: 8 }}
              >
                {option.label}
                {option.value === 'unread' && unreadCount > 0 && (
                  <Badge size={16} style={{ marginLeft: 4 }}>{unreadCount}</Badge>
                )}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </Surface>

      {/* Lista de notificaciones */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: 32,
            minHeight: 300
          }}>
            <Avatar.Icon 
              size={64} 
              icon="bell-off" 
              style={{ backgroundColor: '#e0e0e0', marginBottom: 16 }} 
            />
            <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 8 }}>
              No hay notificaciones
            </Text>
            <Text variant="bodyMedium" style={{ textAlign: 'center', color: '#666' }}>
              {filter === 'unread' 
                ? 'No tienes notificaciones sin leer'
                : 'No tienes notificaciones en esta categoría'
              }
            </Text>
          </View>
        ) : (
          <View style={{ padding: 16 }}>
            {filteredNotifications.map((notification, index) => (
              <Surface 
                key={notification.id} 
                style={{ 
                  marginBottom: 12, 
                  borderRadius: 12, 
                  elevation: 2,
                  backgroundColor: notification.read ? '#fff' : '#f3f4f6'
                }}
              >
                <List.Item
                  title={notification.title}
                  description={notification.message}
                  onPress={() => handleNotificationPress(notification)}
                  left={(props) => (
                    <View style={{ position: 'relative' }}>
                      <Avatar.Icon
                        {...props}
                        icon={getNotificationIcon(notification.type)}
                        style={{ backgroundColor: getNotificationColor(notification.type) }}
                      />
                      {!notification.read && (
                        <Badge 
                          size={12} 
                          style={{ 
                            position: 'absolute', 
                            top: 0, 
                            right: 0,
                            backgroundColor: '#f44336'
                          }} 
                        />
                      )}
                    </View>
                  )}
                  right={(props) => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text variant="bodySmall" style={{ color: '#666', marginRight: 8 }}>
                        {formatTime(notification.created_at)}
                      </Text>
                      <IconButton
                        {...props}
                        icon="delete"
                        size={20}
                        onPress={() => deleteNotification(notification.id)}
                      />
                    </View>
                  )}
                  titleNumberOfLines={2}
                  descriptionNumberOfLines={3}
                  style={{ paddingVertical: 8 }}
                />
                {index < filteredNotifications.length - 1 && <Divider />}
              </Surface>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB para configuración de notificaciones */}
      <FAB
        icon="cog"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        onPress={() => {
          // Aquí iría la navegación a configuración de notificaciones
          Alert.alert('Próximamente', 'Configuración de notificaciones en desarrollo');
        }}
      />
    </View>
  );
};

export default NotificationsScreen;