import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import authService, { AuthContextType } from '../services/auth';
import notificationService from '../services/notifications';
import webSocketService from '../services/websocket';
import { User } from '../types';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Inicializar el servicio de autenticación
    const initializeAuth = async () => {
      try {
        console.log('AuthProvider: Initializing auth service...');
        await authService.initialize();
        console.log('AuthProvider: Auth service initialized');
      } catch (error) {
        console.error('Error initializing auth service:', error);
      }
    };

    initializeAuth();

    // Suscribirse a cambios de autenticación
    const unsubscribe = authService.subscribe((userData, authenticated) => {
      console.log('AuthProvider: Auth state changed:', { userData: userData?.email, authenticated, isLoading: authService.getIsLoading() });
      setUser(userData);
      setIsAuthenticated(authenticated);
      setIsLoading(authService.getIsLoading());

      // Si el usuario se autentica, inicializar servicios adicionales
      if (authenticated && userData) {
        initializeUserServices(userData);
      } else {
        // Si se desautentica, limpiar servicios
        cleanupUserServices();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Inicializar servicios específicos del usuario
  const initializeUserServices = async (userData: User) => {
    try {
      // Inicializar notificaciones
      const pushToken = await notificationService.initialize({
        onNotificationReceived: (notification) => {
          console.log('Notification received in AuthProvider:', notification);
        },
        onNotificationResponse: (response) => {
          console.log('Notification response in AuthProvider:', response);
          // Aquí puedes manejar la navegación basada en la notificación
        },
        onError: (error) => {
          console.error('Notification error:', error);
        },
      });

      if (pushToken) {
        console.log('Push token obtained:', pushToken);
        // Aquí podrías enviar el token al backend para asociarlo con el usuario
      }

      // Inicializar WebSocket con configuración desde variables de entorno
      await webSocketService.initialize();

      // Suscribirse al canal del usuario para notificaciones personales
      webSocketService.subscribeToUserChannel(userData.id, {
        onNotificationReceived: (data) => {
          console.log('User notification received:', data);
          // Mostrar notificación local si la app está en primer plano
          notificationService.scheduleLocalNotification(
            data.title || 'Nueva notificación',
            data.message || 'Tienes una nueva notificación',
            { type: 'general', ...data }
          );
        },
        onSanctionUpdate: (data) => {
          console.log('Sanction update received:', data);
          notificationService.scheduleLocalNotification(
            'Actualización de Sanción',
            data.message || 'Se ha actualizado una sanción',
            { type: 'sanction', sanction_id: data.sanction_id }
          );
        },
        onPaymentUpdate: (data) => {
          console.log('Payment update received:', data);
          notificationService.scheduleLocalNotification(
            'Actualización de Pago',
            data.message || 'Se ha actualizado un pago',
            { type: 'payment', payment_id: data.payment_id }
          );
        },
      });

    } catch (error) {
      console.error('Error initializing user services:', error);
    }
  };

  // Limpiar servicios del usuario
  const cleanupUserServices = () => {
    try {
      webSocketService.disconnect();
      notificationService.cleanup();
    } catch (error) {
      console.error('Error cleaning up user services:', error);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.login(email, password);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>): void => {
    authService.updateUser(userData);
  };

  const checkAuthStatus = async (): Promise<void> => {
    await authService.checkAuthStatus();
  };

  const hasRole = (role: string): boolean => {
    return authService.hasRole(role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return authService.hasAnyRole(roles);
  };

  const isPlayer = (): boolean => {
    return authService.isPlayer();
  };

  const isCoach = (): boolean => {
    return authService.isCoach();
  };

  const isReferee = (): boolean => {
    return authService.isReferee();
  };

  const isAdmin = (): boolean => {
    return authService.isAdmin();
  };

  const isLeague = (): boolean => {
    return authService.isLeague();
  };

  const getToken = async (): Promise<string | null> => {
    return authService.getToken();
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    checkAuthStatus,
    hasRole,
    hasAnyRole,
    isPlayer,
    isCoach,
    isReferee,
    isAdmin,
    isLeague,
    getToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;