import { jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { notificationService } from '../../services/notifications';
import authService from '../../services/auth';
import { PushNotification } from '../../types';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-notifications');
jest.mock('expo-device');
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj: any) => obj.ios)
  }
}));
jest.mock('../../services/auth');

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockNotifications = Notifications as jest.Mocked<typeof Notifications>;
const mockDevice = Device as jest.Mocked<typeof Device>;
const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset service state
    (notificationService as any).isInitialized = false;
    (notificationService as any).expoPushToken = null;
    (notificationService as any).localNotifications = [];
    
    // Default mocks
    Object.defineProperty(mockDevice, 'isDevice', {
      value: true,
      writable: true,
      configurable: true
    });
    mockNotifications.getPermissionsAsync.mockResolvedValue({
      status: 'granted',
      granted: true,
      canAskAgain: true,
      expires: 'never'
    } as any);
    mockNotifications.getExpoPushTokenAsync.mockResolvedValue({
      data: 'ExponentPushToken[test-token]'
    } as any);
    mockNotifications.addNotificationReceivedListener.mockReturnValue({
      remove: jest.fn()
    } as any);
    mockNotifications.addNotificationResponseReceivedListener.mockReturnValue({
      remove: jest.fn()
    } as any);
    mockNotifications.setNotificationHandler = jest.fn();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = notificationService;
      const instance2 = notificationService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('Initialization', () => {
    it('should initialize successfully on physical device', async () => {
      const handlers = {
        onNotificationReceived: jest.fn(),
        onNotificationResponse: jest.fn()
      };

      const token = await notificationService.initialize(handlers);

      expect(token).toBe('ExponentPushToken[test-token]');
      expect(notificationService.isServiceInitialized()).toBe(true);
      expect(mockNotifications.getPermissionsAsync).toHaveBeenCalled();
      expect(mockNotifications.getExpoPushTokenAsync).toHaveBeenCalled();
    });

    it('should return null on simulator/emulator', async () => {
      Object.defineProperty(mockDevice, 'isDevice', {
        value: false,
        writable: true,
        configurable: true
      });

      const token = await notificationService.initialize();

      expect(token).toBeNull();
      expect(notificationService.isServiceInitialized()).toBe(false);
    });

    it('should handle permission denied', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'denied',
        granted: false,
        canAskAgain: false,
        expires: 'never'
      } as any);
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'denied',
        granted: false,
        canAskAgain: false,
        expires: 'never'
      } as any);

      const token = await notificationService.initialize();

      expect(token).toBeNull();
      expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should handle initialization error', async () => {
      mockNotifications.getPermissionsAsync.mockRejectedValue(new Error('Permission error'));
      const errorHandler = jest.fn();

      const token = await notificationService.initialize({ onError: errorHandler });

      expect(token).toBeNull();
      expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Local Notifications', () => {
    beforeEach(async () => {
      await notificationService.initialize();
    });

    it('should schedule local notification', async () => {
      mockNotifications.scheduleNotificationAsync.mockResolvedValue('notification-id');

      const notificationId = await notificationService.scheduleLocalNotification(
        'Test Title',
        'Test Body',
        { type: 'match_reminder' }
      );

      expect(notificationId).toBe('notification-id');
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Test Title',
          body: 'Test Body',
          data: { type: 'match_reminder' },
          sound: true,
          priority: 'high'
        },
        trigger: null
      });
    });

    it('should schedule notification with trigger', async () => {
      mockNotifications.scheduleNotificationAsync.mockResolvedValue('notification-id');
      const trigger = { 
        type: 'timeInterval' as any,
        seconds: 60 
      };

      await notificationService.scheduleLocalNotification(
        'Test Title',
        'Test Body',
        {},
        trigger
      );

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Test Title',
          body: 'Test Body',
          data: {},
          sound: true,
          priority: 'high'
        },
        trigger
      });
    });

    it('should cancel scheduled notification', async () => {
      await notificationService.cancelScheduledNotification('notification-id');

      expect(mockNotifications.cancelScheduledNotificationAsync)
        .toHaveBeenCalledWith('notification-id');
    });

    it('should cancel all scheduled notifications', async () => {
      await notificationService.cancelAllScheduledNotifications();

      expect(mockNotifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });

    it('should clear all notifications', async () => {
      await notificationService.clearAllNotifications();

      expect(mockNotifications.dismissAllNotificationsAsync).toHaveBeenCalled();
    });
  });

  describe('Local Notification Management', () => {
    beforeEach(async () => {
      await notificationService.initialize();
    });

    it('should get local notifications', () => {
      const notifications = notificationService.getLocalNotifications();
      expect(Array.isArray(notifications)).toBe(true);
    });

    it('should get unread notifications', () => {
      const unreadNotifications = notificationService.getUnreadNotifications();
      expect(Array.isArray(unreadNotifications)).toBe(true);
    });

    it('should mark notification as read', async () => {
      // Add a mock notification
      const mockNotification: PushNotification = {
        id: 'test-id',
        title: 'Test',
        body: 'Test body',
        data: {},
        type: 'general',
        timestamp: new Date().toISOString(),
        read: false
      };
      (notificationService as any).localNotifications = [mockNotification];

      await notificationService.markNotificationAsRead('test-id');

      const notifications = notificationService.getLocalNotifications();
      expect(notifications[0].read).toBe(true);
    });

    it('should mark all notifications as read', async () => {
      // Add mock notifications
      const mockNotifications: PushNotification[] = [
        {
          id: 'test-1',
          title: 'Test 1',
          body: 'Test body 1',
          data: {},
          type: 'general',
          timestamp: new Date().toISOString(),
          read: false
        },
        {
          id: 'test-2',
          title: 'Test 2',
          body: 'Test body 2',
          data: {},
          type: 'general',
          timestamp: new Date().toISOString(),
          read: false
        }
      ];
      (notificationService as any).localNotifications = mockNotifications;

      await notificationService.markAllNotificationsAsRead();

      const notifications = notificationService.getLocalNotifications();
      notifications.forEach(notification => {
        expect(notification.read).toBe(true);
      });
    });

    it('should delete local notification', async () => {
      // Add a mock notification
      const mockNotification: PushNotification = {
        id: 'test-id',
        title: 'Test',
        body: 'Test body',
        data: {},
        type: 'general',
        timestamp: new Date().toISOString(),
        read: false
      };
      (notificationService as any).localNotifications = [mockNotification];

      await notificationService.deleteLocalNotification('test-id');

      const notifications = notificationService.getLocalNotifications();
      expect(notifications).toHaveLength(0);
    });

    it('should clear all local notifications', async () => {
      // Add mock notifications
      (notificationService as any).localNotifications = [
        { id: 'test-1', title: 'Test 1' },
        { id: 'test-2', title: 'Test 2' }
      ];

      await notificationService.clearLocalNotifications();

      const notifications = notificationService.getLocalNotifications();
      expect(notifications).toHaveLength(0);
    });
  });

  describe('Permissions and Settings', () => {
    it('should check permissions', async () => {
      const permissions = await notificationService.checkPermissions();

      expect(permissions.status).toBe('granted');
      expect(mockNotifications.getPermissionsAsync).toHaveBeenCalled();
    });

    it('should request permissions', async () => {
      const permissions = await notificationService.requestPermissions();

      expect(permissions.status).toBe('granted');
      expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should get notification settings', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        enabled: true,
        sound: true,
        vibration: true
      }));

      const settings = await notificationService.getNotificationSettings();

      expect(settings.enabled).toBe(true);
      expect(settings.sound).toBe(true);
      expect(settings.vibration).toBe(true);
    });

    it('should save notification settings', async () => {
      const settings = {
        enabled: false,
        sound: false,
        vibration: true
      };

      await notificationService.saveNotificationSettings(settings);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'notification_settings',
        JSON.stringify(settings)
      );
    });
  });

  describe('Specialized Notifications', () => {
    beforeEach(async () => {
      await notificationService.initialize();
      mockNotifications.scheduleNotificationAsync.mockResolvedValue('notification-id');
    });

    it('should schedule payment reminder', async () => {
      const notificationId = await notificationService.schedulePaymentReminder(
        123,
        '2024-12-31',
        50000
      );

      expect(notificationId).toBe('notification-id');
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: 'Recordatorio de Pago',
            body: 'Tienes un pago pendiente de $50.000 que vence el 31/12/2024',
            data: {
              type: 'payment_reminder',
              payment_id: 123,
              due_date: '2024-12-31',
              amount: 50000
            }
          })
        })
      );
    });

    it('should schedule match reminder', async () => {
      const notificationId = await notificationService.scheduleMatchReminder(
        456,
        '2024-12-25T15:00:00Z',
        'Equipo A vs Equipo B'
      );

      expect(notificationId).toBe('notification-id');
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            title: 'Recordatorio de Partido',
            body: 'Tu partido Equipo A vs Equipo B comienza en 1 hora',
            data: {
              type: 'match_reminder',
              match_id: 456,
              match_date: '2024-12-25T15:00:00Z',
              teams: 'Equipo A vs Equipo B'
            }
          }),
          trigger: {
            type: 'timeInterval' as any,
            seconds: 3600
          }
        })
      );
    });
  });

  describe('Utility Methods', () => {
    it('should get expo push token', () => {
      (notificationService as any).expoPushToken = 'test-token';
      
      const token = notificationService.getExpoPushToken();
      
      expect(token).toBe('test-token');
    });

    it('should check if service is initialized', () => {
      expect(notificationService.isServiceInitialized()).toBe(false);
      
      (notificationService as any).isInitialized = true;
      
      expect(notificationService.isServiceInitialized()).toBe(true);
    });

    it('should cleanup listeners', () => {
      const mockRemove = jest.fn();
      (notificationService as any).notificationListener = { remove: mockRemove };
      (notificationService as any).responseListener = { remove: mockRemove };

      notificationService.cleanup();

      expect(mockRemove).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle AsyncStorage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      
      const settings = await notificationService.getNotificationSettings();
      
      // Should return default settings
      expect(settings.enabled).toBe(true);
    });

    it('should handle notification scheduling errors', async () => {
      await notificationService.initialize();
      mockNotifications.scheduleNotificationAsync.mockRejectedValue(new Error('Schedule error'));
      
      const notificationId = await notificationService.scheduleLocalNotification(
        'Test',
        'Test body'
      );
      
      expect(notificationId).toBeNull();
    });
  });
});