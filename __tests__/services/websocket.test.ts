import { jest } from '@jest/globals';
import Pusher from 'pusher-js';
import Echo from 'laravel-echo';
import { webSocketService } from '../../services/websocket';
import authService from '../../services/auth';

// Mock dependencies
jest.mock('pusher-js');
jest.mock('laravel-echo');
jest.mock('../../services/auth', () => ({
  default: {
    getToken: jest.fn(),
    getCurrentUser: jest.fn(),
    initialize: jest.fn(),
    getInstance: jest.fn()
  }
}));

const mockPusher = Pusher as jest.MockedClass<typeof Pusher>;
const mockEcho = Echo as jest.MockedClass<typeof Echo<any>>;
const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('WebSocketService', () => {
  let mockPusherInstance: jest.Mocked<Pusher>;
  let mockEchoInstance: jest.Mocked<Echo<any>>;
  let mockChannel: any;
  let mockPrivateChannel: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset service state
    (webSocketService as any).isConnected = false;
    (webSocketService as any).subscribedChannels = new Set();
    (webSocketService as any).eventHandlers = new Map();
    (webSocketService as any).reconnectAttempts = 0;
    
    // Mock channel objects
    mockChannel = {
      listen: jest.fn().mockReturnThis(),
      stopListening: jest.fn().mockReturnThis(),
      subscribed: jest.fn()
    };
    
    mockPrivateChannel = {
      listen: jest.fn().mockReturnThis(),
      stopListening: jest.fn().mockReturnThis(),
      subscribed: jest.fn()
    };
    
    // Mock Pusher instance
    mockPusherInstance = {
      connection: {
        bind: jest.fn(),
        unbind: jest.fn(),
        state: 'connected'
      },
      disconnect: jest.fn(),
      connect: jest.fn()
    } as any;
    
    // Mock Echo instance
    mockEchoInstance = {
      channel: jest.fn().mockReturnValue(mockChannel),
      private: jest.fn().mockReturnValue(mockPrivateChannel),
      leave: jest.fn(),
      disconnect: jest.fn(),
      connector: {
        pusher: mockPusherInstance
      }
    } as any;
    
    mockPusher.mockImplementation(() => mockPusherInstance);
    mockEcho.mockImplementation(() => mockEchoInstance);
    
    // Mock auth service
    mockAuthService.getToken.mockResolvedValue('mock-token');
    mockAuthService.getCurrentUser.mockReturnValue({
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    } as any);
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = webSocketService;
      const instance2 = webSocketService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('Initialization', () => {
    it('should initialize WebSocket connection successfully', async () => {
      const config = {
        key: 'test-key',
        cluster: 'test-cluster',
        forceTLS: true,
        authEndpoint: '/api/broadcasting/auth'
      };

      await webSocketService.initialize(config);

      expect(mockPusher).toHaveBeenCalledWith('test-key', {
        cluster: 'test-cluster',
        forceTLS: true,
        auth: {
          headers: {
            Authorization: 'Bearer mock-token'
          }
        }
      });
      expect(mockEcho).toHaveBeenCalled();
      expect(webSocketService.isWebSocketConnected()).toBe(true);
    });

    it('should handle initialization without auth token', async () => {
      (mockAuthService as any).getToken.mockResolvedValue(null);
      
      const config = {
        key: 'test-key',
        cluster: 'test-cluster'
      };

      await webSocketService.initialize(config);

      expect(mockPusher).toHaveBeenCalledWith('test-key', {
        cluster: 'test-cluster',
        forceTLS: true,
        auth: {
          headers: {}
        }
      });
    });

    it('should handle initialization error', async () => {
      mockPusher.mockImplementation(() => {
        throw new Error('Connection failed');
      });
      
      const config = {
        key: 'test-key',
        cluster: 'test-cluster'
      };

      await expect(webSocketService.initialize(config)).rejects.toThrow('Connection failed');
    });
  });

  describe('Match Subscription', () => {
    beforeEach(async () => {
      await webSocketService.initialize({
        key: 'test-key',
        cluster: 'test-cluster'
      });
    });

    it('should subscribe to match channel with handlers', () => {
      const handlers = {
        onMatchScoreUpdated: jest.fn(),
        onMatchStatusChanged: jest.fn(),
        onSetCompleted: jest.fn(),
        onPlayerRotationUpdated: jest.fn(),
        onSanctionApplied: jest.fn(),
        onPlayerSubstitution: jest.fn(),
        onMatchStarted: jest.fn(),
        onMatchEnded: jest.fn(),
        onTimeoutCalled: jest.fn()
      };

      const unsubscribe = webSocketService.subscribeToMatch(123, handlers);

      expect(mockEchoInstance.channel).toHaveBeenCalledWith('match.123');
      expect(mockChannel.listen).toHaveBeenCalledTimes(9); // All event types
      expect(typeof unsubscribe).toBe('function');
      
      const subscribedChannels = webSocketService.getSubscribedChannels();
      expect(subscribedChannels).toContain('match.123');
    });

    it('should handle match events correctly', () => {
      const handlers = {
        onMatchScoreUpdated: jest.fn(),
        onMatchStatusChanged: jest.fn()
      };

      webSocketService.subscribeToMatch(123, handlers);

      // Simulate receiving events
      const mockData = { score: { home: 2, away: 1 } };
      
      // Get the callback passed to listen for score updates
      const scoreUpdateCall = mockChannel.listen.mock.calls.find(
        (call: any) => call[0] === 'MatchScoreUpdated'
      );
      expect(scoreUpdateCall).toBeDefined();
      
      // Execute the callback
      if (scoreUpdateCall) {
        scoreUpdateCall[1](mockData);
        expect(handlers.onMatchScoreUpdated).toHaveBeenCalledWith(mockData);
      }
    });

    it('should unsubscribe from match channel', () => {
      const handlers = { onMatchScoreUpdated: jest.fn() };
      
      webSocketService.subscribeToMatch(123, handlers);
      webSocketService.unsubscribeFromMatch(123);

      expect(mockEchoInstance.leave).toHaveBeenCalledWith('match.123');
      
      const subscribedChannels = webSocketService.getSubscribedChannels();
      expect(subscribedChannels).not.toContain('match.123');
    });

    it('should return unsubscribe function that works', () => {
      const handlers = { onMatchScoreUpdated: jest.fn() };
      
      const unsubscribe = webSocketService.subscribeToMatch(123, handlers);
      unsubscribe();

      expect(mockEchoInstance.leave).toHaveBeenCalledWith('match.123');
    });
  });

  describe('User Channel Subscription', () => {
    beforeEach(async () => {
      await webSocketService.initialize({
        key: 'test-key',
        cluster: 'test-cluster'
      });
    });

    it('should subscribe to user private channel', () => {
      const handlers = {
        onNotificationReceived: jest.fn(),
        onSanctionUpdate: jest.fn(),
        onPaymentUpdate: jest.fn()
      };

      const unsubscribe = webSocketService.subscribeToUserChannel(456, handlers);

      expect(mockEchoInstance.private).toHaveBeenCalledWith('user.456');
      expect(mockPrivateChannel.listen).toHaveBeenCalledTimes(3);
      expect(typeof unsubscribe).toBe('function');
    });

    it('should handle user channel events', () => {
      const handlers = {
        onNotificationReceived: jest.fn(),
        onSanctionUpdate: jest.fn()
      };

      webSocketService.subscribeToUserChannel(456, handlers);

      const mockNotificationData = {
        id: 1,
        title: 'New Notification',
        body: 'You have a new message'
      };

      // Get the callback for notification events
      const notificationCall = mockPrivateChannel.listen.mock.calls.find(
        (call: any) => call[0] === 'NotificationReceived'
      );
      
      if (notificationCall) {
        notificationCall[1](mockNotificationData);
        expect(handlers.onNotificationReceived).toHaveBeenCalledWith(mockNotificationData);
      }
    });

    it('should unsubscribe from user channel', () => {
      const handlers = { onNotificationReceived: jest.fn() };
      
      webSocketService.subscribeToUserChannel(456, handlers);
      webSocketService.unsubscribeFromUserChannel(456);

      expect(mockEchoInstance.leave).toHaveBeenCalledWith('user.456');
    });
  });

  describe('Tournament Subscription', () => {
    beforeEach(async () => {
      await webSocketService.initialize({
        key: 'test-key',
        cluster: 'test-cluster'
      });
    });

    it('should subscribe to tournament channel', () => {
      const handlers = {
        onTournamentUpdate: jest.fn(),
        onMatchScheduled: jest.fn(),
        onStandingsUpdate: jest.fn()
      };

      const unsubscribe = webSocketService.subscribeToTournament(789, handlers);

      expect(mockEchoInstance.channel).toHaveBeenCalledWith('tournament.789');
      expect(mockChannel.listen).toHaveBeenCalledTimes(3);
      expect(typeof unsubscribe).toBe('function');
    });

    it('should handle tournament events', () => {
      const handlers = {
        onTournamentUpdate: jest.fn(),
        onStandingsUpdate: jest.fn()
      };

      webSocketService.subscribeToTournament(789, handlers);

      const mockTournamentData = {
        id: 789,
        name: 'Updated Tournament',
        status: 'active'
      };

      // Get the callback for tournament update events
      const tournamentUpdateCall = mockChannel.listen.mock.calls.find(
        (call: any) => call[0] === 'TournamentUpdated'
      );
      
      if (tournamentUpdateCall) {
        tournamentUpdateCall[1](mockTournamentData);
        expect(handlers.onTournamentUpdate).toHaveBeenCalledWith(mockTournamentData);
      }
    });

    it('should unsubscribe from tournament channel', () => {
      const handlers = { onTournamentUpdate: jest.fn() };
      
      webSocketService.subscribeToTournament(789, handlers);
      webSocketService.unsubscribeFromTournament(789);

      expect(mockEchoInstance.leave).toHaveBeenCalledWith('tournament.789');
    });
  });

  describe('Connection Management', () => {
    beforeEach(async () => {
      await webSocketService.initialize({
        key: 'test-key',
        cluster: 'test-cluster'
      });
    });

    it('should get connection status', () => {
      const status = webSocketService.getConnectionStatus();

      expect(status).toEqual({
        isConnected: true,
        subscribedChannels: [],
        reconnectAttempts: 0
      });
    });

    it('should check if WebSocket is connected', () => {
      expect(webSocketService.isWebSocketConnected()).toBe(true);
      
      (webSocketService as any).isConnected = false;
      expect(webSocketService.isWebSocketConnected()).toBe(false);
    });

    it('should get subscribed channels', () => {
      // Subscribe to some channels
      webSocketService.subscribeToMatch(123, {});
      webSocketService.subscribeToUserChannel(456, {});
      
      const channels = webSocketService.getSubscribedChannels();
      expect(channels).toContain('match.123');
      expect(channels).toContain('user.456');
    });

    it('should force reconnection', () => {
      const reconnectSpy = jest.spyOn(webSocketService as any, 'reconnect');
      
      webSocketService.forceReconnect();
      
      expect(reconnectSpy).toHaveBeenCalled();
    });

    it('should set reconnection config', () => {
      webSocketService.setReconnectionConfig(10, 2000);
      
      expect((webSocketService as any).maxReconnectAttempts).toBe(10);
      expect((webSocketService as any).reconnectDelay).toBe(2000);
    });

    it('should disconnect properly', () => {
      // Subscribe to some channels first
      webSocketService.subscribeToMatch(123, {});
      webSocketService.subscribeToUserChannel(456, {});
      
      webSocketService.disconnect();

      expect(mockEchoInstance.disconnect).toHaveBeenCalled();
      expect(webSocketService.isWebSocketConnected()).toBe(false);
      expect(webSocketService.getSubscribedChannels()).toHaveLength(0);
    });
  });

  describe('Connection Events', () => {
    beforeEach(async () => {
      await webSocketService.initialize({
        key: 'test-key',
        cluster: 'test-cluster'
      });
    });

    it('should handle connection state changes', () => {
      // Get the connection event bindings
      const connectionBindCalls = mockPusherInstance.connection.bind.mock.calls;
      
      expect(connectionBindCalls).toContainEqual(['connected', expect.any(Function)]);
      expect(connectionBindCalls).toContainEqual(['disconnected', expect.any(Function)]);
      expect(connectionBindCalls).toContainEqual(['error', expect.any(Function)]);
    });

    it('should handle connection errors', () => {
      const errorHandler = jest.spyOn(webSocketService as any, 'handleConnectionError');
      
      // Get the error callback
      const errorCall = mockPusherInstance.connection.bind.mock.calls.find(
        (call: any) => call[0] === 'error'
      );
      
      if (errorCall) {
        const errorCallback = errorCall[1];
        const mockError = { type: 'WebSocketError', error: { message: 'Connection failed' } };
        
        errorCallback(mockError);
        
        expect(errorHandler).toHaveBeenCalledWith(mockError);
      }
    });

    it('should handle reconnection attempts', () => {
      const reconnectHandler = jest.spyOn(webSocketService as any, 'handleReconnection');
      
      // Simulate disconnection
      const disconnectedCall = mockPusherInstance.connection.bind.mock.calls.find(
        (call: any) => call[0] === 'disconnected'
      );
      
      if (disconnectedCall) {
        const disconnectedCallback = disconnectedCall[1];
        disconnectedCallback();
        
        expect(reconnectHandler).toHaveBeenCalled();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle subscription errors gracefully', async () => {
      await webSocketService.initialize({
        key: 'test-key',
        cluster: 'test-cluster'
      });
      
      mockEchoInstance.channel.mockImplementation(() => {
        throw new Error('Subscription failed');
      });
      
      const handlers = { onMatchScoreUpdated: jest.fn() };
      
      // Should not throw, but handle error gracefully
      expect(() => {
        webSocketService.subscribeToMatch(123, handlers);
      }).not.toThrow();
    });

    it('should handle missing handlers gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Subscribe without handlers
      const unsubscribe = webSocketService.subscribeToMatch(123, {});
      
      expect(typeof unsubscribe).toBe('function');
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle reconnection failures', async () => {
      await webSocketService.initialize({
        key: 'test-key',
        cluster: 'test-cluster'
      });
      
      // Set max attempts to 1 for quick testing
      (webSocketService as any).maxReconnectAttempts = 1;
      
      // Mock reconnection failure
      const reconnectSpy = jest.spyOn(webSocketService as any, 'reconnect')
        .mockRejectedValue(new Error('Reconnection failed'));
      
      // Trigger reconnection with proper error handling
      try {
        await (webSocketService as any).handleReconnection();
      } catch (error) {
        // Expected to fail in test environment
      }
      
      expect(reconnectSpy).toHaveBeenCalled();
    });
  });
});