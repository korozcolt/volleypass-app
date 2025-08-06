import Pusher from 'pusher-js';
import Echo from 'laravel-echo';
import { LiveMatchUpdate, Match } from '../types';
import authService from './auth';

export interface WebSocketEventHandlers {
  onMatchScoreUpdated?: (data: any) => void;
  onMatchStatusChanged?: (data: any) => void;
  onSetCompleted?: (data: any) => void;
  onPlayerRotationUpdated?: (data: any) => void;
  onSanctionApplied?: (data: any) => void;
  onPlayerSubstitution?: (data: any) => void;
  onMatchStarted?: (data: any) => void;
  onMatchEnded?: (data: any) => void;
  onTimeoutCalled?: (data: any) => void;
  onError?: (error: any) => void;
}

export interface UserChannelEventHandlers {
  onNotificationReceived?: (data: any) => void;
  onSanctionUpdate?: (data: any) => void;
  onPaymentUpdate?: (data: any) => void;
  onError?: (error: any) => void;
}

export interface TournamentChannelEventHandlers {
  onTournamentUpdate?: (data: any) => void;
  onMatchScheduled?: (data: any) => void;
  onStandingsUpdate?: (data: any) => void;
  onError?: (error: any) => void;
}

type AllEventHandlers = WebSocketEventHandlers | UserChannelEventHandlers | TournamentChannelEventHandlers;

class WebSocketService {
  private static instance: WebSocketService;
  private echo: Echo<any> | null = null;
  private pusher: Pusher | null = null;
  private isConnected: boolean = false;
  private subscribedChannels: Set<string> = new Set();
  private eventHandlers: Map<string, AllEventHandlers> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000; // 1 segundo inicial

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  // Inicializar la conexión WebSocket
  async initialize(config: {
    key: string;
    cluster: string;
    forceTLS?: boolean;
    authEndpoint?: string;
  }): Promise<void> {
    try {
      // Get the auth token
      const token = await authService.getToken();
      
      // Configurar Pusher
      this.pusher = new Pusher(config.key, {
        cluster: config.cluster,
        forceTLS: config.forceTLS ?? true,
        authEndpoint: config.authEndpoint || 'http://volleypass-new.test/api/broadcasting/auth',
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      });

      // Configurar Laravel Echo
      this.echo = new Echo({
        broadcaster: 'pusher',
        key: config.key,
        cluster: config.cluster,
        forceTLS: config.forceTLS ?? true,
        authEndpoint: config.authEndpoint || 'http://volleypass-new.test/api/broadcasting/auth',
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      });

      // Configurar eventos de conexión
      this.setupConnectionEvents();

      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('WebSocket service initialized successfully');
    } catch (error) {
      console.error('Error initializing WebSocket service:', error);
      this.handleConnectionError(error);
      throw error;
    }
  }

  // Configurar eventos de conexión
  private setupConnectionEvents(): void {
    if (!this.pusher) return;

    this.pusher.connection.bind('connected', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.pusher.connection.bind('disconnected', () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
      this.handleReconnection();
    });

    this.pusher.connection.bind('error', (error: any) => {
      console.error('WebSocket connection error:', error);
      this.handleConnectionError(error);
    });

    this.pusher.connection.bind('unavailable', () => {
      console.warn('WebSocket connection unavailable');
      this.isConnected = false;
    });
  }

  // Manejar errores de conexión
  private handleConnectionError(error: any): void {
    this.isConnected = false;
    
    // Notificar a todos los handlers sobre el error
    this.eventHandlers.forEach(handlers => {
      if (handlers.onError) {
        handlers.onError(error);
      }
    });
  }

  // Manejar reconexión automática
  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts); // Backoff exponencial
    this.reconnectAttempts++;

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.reconnect();
    }, delay);
  }

  // Reconectar
  private async reconnect(): Promise<void> {
    try {
      if (this.pusher) {
        this.pusher.connect();
      }
    } catch (error) {
      console.error('Error during reconnection:', error);
      this.handleReconnection();
    }
  }

  // Suscribirse a un canal de partido
  subscribeToMatch(matchId: number, handlers: WebSocketEventHandlers): () => void {
    if (!this.echo) {
      throw new Error('WebSocket service not initialized');
    }

    const channelName = `match.${matchId}`;
    this.eventHandlers.set(channelName, handlers);

    const channel = this.echo.channel(channelName);

    // Configurar listeners para eventos de partido
    if (handlers.onMatchScoreUpdated) {
      channel.listen('MatchScoreUpdated', handlers.onMatchScoreUpdated);
    }

    if (handlers.onMatchStatusChanged) {
      channel.listen('MatchStatusChanged', handlers.onMatchStatusChanged);
    }

    if (handlers.onSetCompleted) {
      channel.listen('SetCompleted', handlers.onSetCompleted);
    }

    if (handlers.onPlayerRotationUpdated) {
      channel.listen('PlayerRotationUpdated', handlers.onPlayerRotationUpdated);
    }

    if (handlers.onSanctionApplied) {
      channel.listen('SanctionApplied', handlers.onSanctionApplied);
    }

    if (handlers.onPlayerSubstitution) {
      channel.listen('PlayerSubstitution', handlers.onPlayerSubstitution);
    }

    if (handlers.onMatchStarted) {
      channel.listen('MatchStarted', handlers.onMatchStarted);
    }

    if (handlers.onMatchEnded) {
      channel.listen('MatchEnded', handlers.onMatchEnded);
    }

    if (handlers.onTimeoutCalled) {
      channel.listen('TimeoutCalled', handlers.onTimeoutCalled);
    }

    this.subscribedChannels.add(channelName);
    console.log(`Subscribed to match channel: ${channelName}`);

    // Retornar función para desuscribirse
    return () => {
      this.unsubscribeFromMatch(matchId);
    };
  }

  // Desuscribirse de un canal de partido
  unsubscribeFromMatch(matchId: number): void {
    if (!this.echo) return;

    const channelName = `match.${matchId}`;
    
    try {
      this.echo.leaveChannel(channelName);
      this.subscribedChannels.delete(channelName);
      this.eventHandlers.delete(channelName);
      console.log(`Unsubscribed from match channel: ${channelName}`);
    } catch (error) {
      console.error(`Error unsubscribing from channel ${channelName}:`, error);
    }
  }

  // Suscribirse a canal privado de usuario
  subscribeToUserChannel(userId: number, handlers: UserChannelEventHandlers): () => void {
    if (!this.echo) {
      throw new Error('WebSocket service not initialized');
    }

    const channelName = `user.${userId}`;
    this.eventHandlers.set(channelName, handlers);

    const channel = this.echo.private(channelName);

    if (handlers.onNotificationReceived) {
      channel.listen('NotificationReceived', handlers.onNotificationReceived);
    }

    if (handlers.onSanctionUpdate) {
      channel.listen('SanctionUpdate', handlers.onSanctionUpdate);
    }

    if (handlers.onPaymentUpdate) {
      channel.listen('PaymentUpdate', handlers.onPaymentUpdate);
    }

    this.subscribedChannels.add(channelName);
    console.log(`Subscribed to user channel: ${channelName}`);

    return () => {
      this.unsubscribeFromUserChannel(userId);
    };
  }

  // Desuscribirse de canal de usuario
  unsubscribeFromUserChannel(userId: number): void {
    if (!this.echo) return;

    const channelName = `user.${userId}`;
    
    try {
      this.echo.leaveChannel(channelName);
      this.subscribedChannels.delete(channelName);
      this.eventHandlers.delete(channelName);
      console.log(`Unsubscribed from user channel: ${channelName}`);
    } catch (error) {
      console.error(`Error unsubscribing from channel ${channelName}:`, error);
    }
  }

  // Suscribirse a canal de torneo
  subscribeToTournament(tournamentId: number, handlers: TournamentChannelEventHandlers): () => void {
    if (!this.echo) {
      throw new Error('WebSocket service not initialized');
    }

    const channelName = `tournament.${tournamentId}`;
    this.eventHandlers.set(channelName, handlers);

    const channel = this.echo.channel(channelName);

    if (handlers.onTournamentUpdate) {
      channel.listen('TournamentUpdate', handlers.onTournamentUpdate);
    }

    if (handlers.onMatchScheduled) {
      channel.listen('MatchScheduled', handlers.onMatchScheduled);
    }

    if (handlers.onStandingsUpdate) {
      channel.listen('StandingsUpdate', handlers.onStandingsUpdate);
    }

    this.subscribedChannels.add(channelName);
    console.log(`Subscribed to tournament channel: ${channelName}`);

    return () => {
      this.unsubscribeFromTournament(tournamentId);
    };
  }

  // Desuscribirse de canal de torneo
  unsubscribeFromTournament(tournamentId: number): void {
    if (!this.echo) return;

    const channelName = `tournament.${tournamentId}`;
    
    try {
      this.echo.leaveChannel(channelName);
      this.subscribedChannels.delete(channelName);
      this.eventHandlers.delete(channelName);
      console.log(`Unsubscribed from tournament channel: ${channelName}`);
    } catch (error) {
      console.error(`Error unsubscribing from channel ${channelName}:`, error);
    }
  }

  // Desconectar y limpiar
  disconnect(): void {
    try {
      // Desuscribirse de todos los canales
      this.subscribedChannels.forEach(channelName => {
        if (this.echo) {
          this.echo.leaveChannel(channelName);
        }
      });

      // Limpiar
      this.subscribedChannels.clear();
      this.eventHandlers.clear();

      // Desconectar Pusher
      if (this.pusher) {
        this.pusher.disconnect();
      }

      // Limpiar Echo
      if (this.echo) {
        this.echo.disconnect();
      }

      this.isConnected = false;
      this.reconnectAttempts = 0;
      
      console.log('WebSocket service disconnected');
    } catch (error) {
      console.error('Error disconnecting WebSocket service:', error);
    }
  }

  // Verificar estado de conexión
  getConnectionStatus(): {
    isConnected: boolean;
    subscribedChannels: string[];
    reconnectAttempts: number;
  } {
    return {
      isConnected: this.isConnected,
      subscribedChannels: Array.from(this.subscribedChannels),
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // Verificar si está conectado
  isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  // Obtener canales suscritos
  getSubscribedChannels(): string[] {
    return Array.from(this.subscribedChannels);
  }

  // Forzar reconexión
  forceReconnect(): void {
    this.reconnectAttempts = 0;
    this.reconnect();
  }

  // Configurar configuración de reconexión
  setReconnectionConfig(maxAttempts: number, initialDelay: number): void {
    this.maxReconnectAttempts = maxAttempts;
    this.reconnectDelay = initialDelay;
  }
}

export const webSocketService = WebSocketService.getInstance();
export default webSocketService;