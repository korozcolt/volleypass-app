import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Platform } from 'react-native';
import { PushNotification } from '../types';

// Configurar el comportamiento de las notificaciones solo si no estamos en Expo Go
if (!__DEV__ || Platform.OS !== 'android') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (error) {
    console.warn('Notifications not available in Expo Go:', error);
  }
}

export interface NotificationHandlers {
  onNotificationReceived?: (notification: Notifications.Notification) => void;
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void;
  onError?: (error: any) => void;
}

class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;
  private isInitialized: boolean = false;
  private handlers: NotificationHandlers = {};
  private localNotifications: PushNotification[] = [];

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Inicializar el servicio de notificaciones
  async initialize(handlers: NotificationHandlers = {}): Promise<string | null> {
    try {
      this.handlers = handlers;

      // Verificar si estamos en Expo Go (no soporta notificaciones push)
      if (__DEV__ && Platform.OS === 'android') {
        console.warn('Push notifications not supported in Expo Go on Android');
        return null;
      }

      // Verificar si es un dispositivo físico
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return null;
      }

      // Solicitar permisos
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return null;
      }

      // Obtener el token de Expo Push (solo si no estamos en Expo Go)
      try {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: 'your-expo-project-id', // Reemplazar con el ID real del proyecto
        });

        this.expoPushToken = token.data;
        console.log('Expo Push Token:', this.expoPushToken);
      } catch (tokenError) {
        console.warn('Could not get push token, likely running in Expo Go:', tokenError);
        return null;
      }

      // Configurar canal de notificaciones para Android
      if (Platform.OS === 'android') {
        await this.setupAndroidNotificationChannel();
      }

      // Configurar listeners
      this.setupNotificationListeners();

      // Cargar notificaciones locales guardadas
      await this.loadLocalNotifications();

      this.isInitialized = true;
      return this.expoPushToken;
    } catch (error) {
      console.error('Error initializing notification service:', error);
      if (this.handlers.onError) {
        this.handlers.onError(error);
      }
      throw error;
    }
  }

  // Configurar canal de notificaciones para Android
  private async setupAndroidNotificationChannel(): Promise<void> {
    await Notifications.setNotificationChannelAsync('volleypass-default', {
      name: 'VolleyPass Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
      showBadge: true,
    });

    await Notifications.setNotificationChannelAsync('volleypass-matches', {
      name: 'Match Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('volleypass-sanctions', {
      name: 'Sanctions & Appeals',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500, 250, 500],
      lightColor: '#FFFF0000',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('volleypass-payments', {
      name: 'Payment Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250],
      lightColor: '#FF00FF00',
      sound: 'default',
    });
  }

  // Configurar listeners de notificaciones
  private setupNotificationListeners(): void {
    // Listener para notificaciones recibidas mientras la app está en primer plano
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        this.handleNotificationReceived(notification);
        
        if (this.handlers.onNotificationReceived) {
          this.handlers.onNotificationReceived(notification);
        }
      }
    );

    // Listener para respuestas a notificaciones (cuando el usuario toca la notificación)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        this.handleNotificationResponse(response);
        
        if (this.handlers.onNotificationResponse) {
          this.handlers.onNotificationResponse(response);
        }
      }
    );
  }

  // Manejar notificación recibida
  private async handleNotificationReceived(notification: Notifications.Notification): Promise<void> {
    const pushNotification: PushNotification = {
      id: notification.request.identifier,
      title: notification.request.content.title || '',
      body: notification.request.content.body || '',
      data: notification.request.content.data || {},
      type: this.getNotificationType(notification.request.content.data),
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Agregar a notificaciones locales
    this.localNotifications.unshift(pushNotification);
    
    // Mantener solo las últimas 50 notificaciones
    if (this.localNotifications.length > 50) {
      this.localNotifications = this.localNotifications.slice(0, 50);
    }

    // Guardar en AsyncStorage
    await this.saveLocalNotifications();
  }

  // Manejar respuesta a notificación
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const data = response.notification.request.content.data;
    
    // Marcar notificación como leída
    this.markNotificationAsRead(response.notification.request.identifier);

    // Manejar navegación basada en el tipo de notificación
    if (data?.type === 'match_update' && data?.match_id) {
      // Navegar a la pantalla del partido
      console.log('Navigate to match:', data.match_id);
    } else if (data?.type === 'sanction' && data?.sanction_id) {
      // Navegar a la pantalla de sanciones
      console.log('Navigate to sanctions');
    } else if (data?.type === 'payment' && data?.payment_id) {
      // Navegar a la pantalla de pagos
      console.log('Navigate to payments');
    }
  }

  // Determinar el tipo de notificación
  private getNotificationType(data: any): PushNotification['type'] {
    if (data?.type) {
      return data.type;
    }
    
    // Inferir tipo basado en los datos
    if (data?.match_id) return 'match_update';
    if (data?.sanction_id) return 'sanction';
    if (data?.payment_id) return 'payment';
    
    return 'general';
  }

  // Programar notificación local
  async scheduleLocalNotification(
    title: string,
    body: string,
    data: any = {},
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const channelId = this.getChannelId(data.type);
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          ...(Platform.OS === 'android' && { channelId }),
        },
        trigger: trigger || null, // null = inmediata
      });

      console.log('Local notification scheduled:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      throw error;
    }
  }

  // Obtener ID del canal basado en el tipo
  private getChannelId(type?: string): string {
    switch (type) {
      case 'match_update':
        return 'volleypass-matches';
      case 'sanction':
        return 'volleypass-sanctions';
      case 'payment':
        return 'volleypass-payments';
      default:
        return 'volleypass-default';
    }
  }

  // Cancelar notificación programada
  async cancelScheduledNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  // Cancelar todas las notificaciones programadas
  async cancelAllScheduledNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All scheduled notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  // Limpiar todas las notificaciones mostradas
  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      console.log('All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  // Obtener notificaciones locales
  getLocalNotifications(): PushNotification[] {
    return this.localNotifications;
  }

  // Obtener notificaciones no leídas
  getUnreadNotifications(): PushNotification[] {
    return this.localNotifications.filter(notification => !notification.read);
  }

  // Marcar notificación como leída
  async markNotificationAsRead(notificationId: string): Promise<void> {
    const notification = this.localNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      await this.saveLocalNotifications();
    }
  }

  // Marcar todas las notificaciones como leídas
  async markAllNotificationsAsRead(): Promise<void> {
    this.localNotifications.forEach(notification => {
      notification.read = true;
    });
    await this.saveLocalNotifications();
  }

  // Eliminar notificación local
  async deleteLocalNotification(notificationId: string): Promise<void> {
    this.localNotifications = this.localNotifications.filter(n => n.id !== notificationId);
    await this.saveLocalNotifications();
  }

  // Limpiar notificaciones locales
  async clearLocalNotifications(): Promise<void> {
    this.localNotifications = [];
    await this.saveLocalNotifications();
  }

  // Cargar notificaciones locales desde AsyncStorage
  private async loadLocalNotifications(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('local_notifications');
      if (stored) {
        this.localNotifications = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading local notifications:', error);
    }
  }

  // Guardar notificaciones locales en AsyncStorage
  private async saveLocalNotifications(): Promise<void> {
    try {
      await AsyncStorage.setItem('local_notifications', JSON.stringify(this.localNotifications));
    } catch (error) {
      console.error('Error saving local notifications:', error);
    }
  }

  // Obtener token de push
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // Verificar si está inicializado
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  // Verificar permisos de notificaciones
  async checkPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
    return await Notifications.getPermissionsAsync();
  }

  // Solicitar permisos de notificaciones
  async requestPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
    return await Notifications.requestPermissionsAsync();
  }

  // Obtener configuración de notificaciones
  async getNotificationSettings(): Promise<any> {
    try {
      const settings = await AsyncStorage.getItem('notification_settings');
      return settings ? JSON.parse(settings) : {
        enabled: true,
        matchUpdates: true,
        sanctions: true,
        payments: true,
        general: true,
        sound: true,
        vibration: true,
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return {};
    }
  }

  // Guardar configuración de notificaciones
  async saveNotificationSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem('notification_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  // Limpiar listeners
  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }

    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }

    this.isInitialized = false;
    console.log('Notification service cleaned up');
  }

  // Programar recordatorio de pago
  async schedulePaymentReminder(paymentId: number, dueDate: string, amount: number): Promise<string> {
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - 3); // 3 días antes

    return this.scheduleLocalNotification(
      'Recordatorio de Pago',
      `Tienes un pago pendiente de $${amount.toLocaleString()} que vence el ${new Date(dueDate).toLocaleDateString()}`,
      { type: 'payment_reminder', payment_id: paymentId, due_date: dueDate, amount },
      { type: SchedulableTriggerInputTypes.DATE, date: reminderDate }
    );
  }

  // Programar notificación de partido
  async scheduleMatchReminder(matchId: number, matchDate: string, teams: string): Promise<string> {
    const reminderDate = new Date(matchDate);
    reminderDate.setHours(reminderDate.getHours() - 1); // 1 hora antes

    return this.scheduleLocalNotification(
      'Recordatorio de Partido',
      `Tu partido ${teams} comienza en 1 hora`,
      { type: 'match_reminder', match_id: matchId, match_date: matchDate, teams },
      { type: SchedulableTriggerInputTypes.DATE, date: reminderDate }
    );
  }
}

export const notificationService = NotificationService.getInstance();
export default notificationService;