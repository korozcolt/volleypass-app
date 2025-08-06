import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Portal, Snackbar } from 'react-native-paper';
import { useAuth } from '../../providers/AuthProvider';
import { NotificationService } from '../../services/notifications';
import { PushNotification } from '../../types';

interface NotificationHandlerProps {
  children: React.ReactNode;
}

interface NotificationState {
  visible: boolean;
  message: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const NotificationHandler: React.FC<NotificationHandlerProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [notification, setNotification] = React.useState<NotificationState>({
    visible: false,
    message: '',
  });
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const notificationService = useRef<NotificationService>();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Inicializar el servicio de notificaciones
      notificationService.current = new NotificationService();
      initializeNotifications();
    } else {
      // Limpiar listeners cuando el usuario no está autenticado
      cleanupListeners();
    }

    return () => {
      cleanupListeners();
    };
  }, [isAuthenticated, user]);

  const initializeNotifications = async () => {
    try {
      // Verificar si estamos en Expo Go (no soporta notificaciones push)
      if (__DEV__ && Platform.OS === 'android') {
        console.warn('Push notifications not supported in Expo Go on Android');
        return;
      }

      if (!notificationService.current) return;

      // Solicitar permisos
      const hasPermission = await notificationService.current.requestPermissions();
      if (!hasPermission) {
        console.warn('Permisos de notificación denegados');
        return;
      }

      // Configurar canales de Android
      await notificationService.current.setupAndroidChannels();

      // Configurar listeners
      setupNotificationListeners();

      // Obtener token de Expo Push
      const token = await notificationService.current.getExpoPushToken();
      if (token && user) {
        // Aquí podrías enviar el token al backend para asociarlo con el usuario
        console.log('Expo Push Token:', token);
      }
    } catch (error) {
      console.error('Error inicializando notificaciones:', error);
    }
  };

  const setupNotificationListeners = () => {
    try {
      // Listener para notificaciones recibidas mientras la app está en primer plano
      notificationListener.current = Notifications.addNotificationReceivedListener(
        (notification) => {
          handleNotificationReceived(notification);
        }
      );

      // Listener para cuando el usuario toca una notificación
      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          handleNotificationResponse(response);
        }
      );
    } catch (error) {
      console.warn('Could not setup notification listeners:', error);
    }
  };

  const cleanupListeners = () => {
    try {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    } catch (error) {
      console.warn('Could not cleanup notification listeners:', error);
    }
  };

  const handleNotificationReceived = (notification: Notifications.Notification) => {
    const { title, body, data } = notification.request.content;
    
    // Mostrar snackbar para notificaciones recibidas en primer plano
    setNotification({
      visible: true,
      message: body || title || 'Nueva notificación',
      action: data?.actionUrl ? {
        label: 'Ver',
        onPress: () => handleNotificationAction(data)
      } : undefined
    });

    // Guardar la notificación localmente
    if (notificationService.current) {
      const pushNotification: PushNotification = {
        id: notification.request.identifier,
        title: title || '',
        body: body || '',
        data: data || {},
        timestamp: new Date(),
        read: false,
        type: data?.type || 'general'
      };
      notificationService.current.saveNotification(pushNotification);
    }
  };

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const { data } = response.notification.request.content;
    handleNotificationAction(data);
  };

  const handleNotificationAction = (data: any) => {
    if (!data) return;

    switch (data.type) {
      case 'match_update':
        // Navegar a la pantalla de detalle del partido
        if (data.matchId) {
          // Aquí implementarías la navegación
          console.log('Navegar a partido:', data.matchId);
        }
        break;
      
      case 'sanction':
        // Navegar a la pantalla de sanciones
        console.log('Navegar a sanciones');
        break;
      
      case 'payment':
        // Navegar a la pantalla de pagos
        console.log('Navegar a pagos');
        break;
      
      case 'tournament_update':
        // Navegar a la pantalla del torneo
        if (data.tournamentId) {
          console.log('Navegar a torneo:', data.tournamentId);
        }
        break;
      
      default:
        console.log('Tipo de notificación no manejado:', data.type);
    }
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  return (
    <>
      {children}
      <Portal>
        <Snackbar
          visible={notification.visible}
          onDismiss={hideNotification}
          duration={4000}
          action={notification.action}
          style={{
            marginBottom: Platform.OS === 'ios' ? 90 : 60,
          }}
        >
          {notification.message}
        </Snackbar>
      </Portal>
    </>
  );
};

export default NotificationHandler;