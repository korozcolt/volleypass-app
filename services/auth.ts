import { createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthResponse } from '../types';
import api from './api';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  checkAuthStatus: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  isPlayer: () => boolean;
  isCoach: () => boolean;
  isReferee: () => boolean;
  isAdmin: () => boolean;
  isLeague: () => boolean;
  getToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export class AuthService {
  private static instance: AuthService;
  private user: User | null = null;
  private isAuthenticated: boolean = false;
  private isLoading: boolean = false;
  private listeners: Array<(user: User | null, isAuthenticated: boolean) => void> = [];

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Suscribirse a cambios de autenticación
  subscribe(listener: (user: User | null, isAuthenticated: boolean) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.user, this.isAuthenticated));
  }

  // Inicializar el servicio de autenticación
  async initialize(): Promise<void> {
    console.log('AuthService: Starting initialization, setting isLoading to true');
    this.isLoading = true;
    this.notifyListeners();

    try {
      console.log('AuthService: Checking for stored auth token');
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        console.log('AuthService: Token found, verifying...');
        // Agregar timeout para evitar que se quede colgado
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 10000)
        );
        
        try {
          await Promise.race([api.verifyToken(), timeoutPromise]);
          console.log('AuthService: Token verified, getting user profile...');
          const userData = await Promise.race([api.getUserProfile(), timeoutPromise]);
          console.log('AuthService: User profile retrieved, setting user');
           this.setUser(userData as User);
        } catch (verifyError) {
          console.warn('Token verification failed or timed out:', verifyError);
          await this.clearAuth();
        }
      } else {
        // No hay token, usuario no autenticado
        console.log('AuthService: No auth token found, user not authenticated');
      }
    } catch (error) {
      console.error('AuthService: Error initializing auth:', error);
      await this.clearAuth();
    } finally {
      console.log('AuthService: Initialization complete, setting isLoading to false');
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  // Iniciar sesión
  async login(email: string, password: string): Promise<void> {
    this.isLoading = true;
    this.notifyListeners();

    try {
      const authResponse: AuthResponse = await api.login(email, password);
      this.setUser(authResponse.user);
      
      // Guardar información adicional del usuario
      await AsyncStorage.setItem('user_data', JSON.stringify(authResponse.user));
    } catch (error) {
      this.isLoading = false;
      this.notifyListeners();
      throw error;
    }

    this.isLoading = false;
    this.notifyListeners();
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    this.isLoading = true;
    this.notifyListeners();

    try {
      await api.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      await this.clearAuth();
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  // Actualizar datos del usuario
  async updateUserProfile(profileData: Partial<User>): Promise<void> {
    if (!this.user) {
      throw new Error('No user logged in');
    }

    try {
      const updatedUser = await api.updateUserProfile(profileData);
      this.setUser(updatedUser);
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Actualizar usuario en memoria
  updateUser(userData: Partial<User>): void {
    if (this.user) {
      this.user = { ...this.user, ...userData };
      this.notifyListeners();
    }
  }

  // Verificar estado de autenticación
  async checkAuthStatus(): Promise<void> {
    if (!this.isAuthenticated) {
      await this.initialize();
    }
  }

  // Establecer usuario autenticado
  private setUser(user: User): void {
    this.user = user;
    this.isAuthenticated = true;
  }

  // Limpiar autenticación
  private async clearAuth(): Promise<void> {
    this.user = null;
    this.isAuthenticated = false;
    await AsyncStorage.multiRemove(['auth_token', 'user_data']);
  }

  // Verificar si el usuario tiene un rol específico
  hasRole(role: string): boolean {
    if (!this.user || !this.user.roles) {
      return false;
    }
    return this.user.roles.includes(role) || this.user.user_type === role.toLowerCase();
  }

  // Verificar si el usuario tiene alguno de los roles especificados
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  // Verificar tipos de usuario específicos
  isPlayer(): boolean {
    return this.user?.user_type === 'player' || this.hasRole('Player');
  }

  isCoach(): boolean {
    return this.user?.user_type === 'coach' || this.hasRole('Coach');
  }

  isReferee(): boolean {
    return this.user?.user_type === 'referee' || this.hasRole('Referee');
  }

  isAdmin(): boolean {
    return this.user?.user_type === 'admin' || this.hasRole('Admin');
  }

  isLeague(): boolean {
    return this.user?.user_type === 'league' || this.hasRole('League');
  }

  // Verificar si es técnico o dirigente
  isCoachOrManager(): boolean {
    return this.isCoach() || this.hasAnyRole(['Coach', 'Manager', 'Technical']);
  }

  // Verificar si puede gestionar jugadores
  canManagePlayers(): boolean {
    return this.isCoachOrManager() || this.isAdmin();
  }

  // Verificar si puede gestionar partidos
  canManageMatches(): boolean {
    return this.isReferee() || this.isLeague() || this.isAdmin();
  }

  // Verificar si puede ver información de árbitro
  canAccessRefereeFeatures(): boolean {
    return this.isReferee() || this.isAdmin();
  }

  // Verificar si puede apelar sanciones
  canAppealSanctions(): boolean {
    return this.isPlayer() || this.isCoachOrManager();
  }

  // Verificar si puede gestionar sanciones
  canManageSanctions(): boolean {
    return this.isLeague() || this.isAdmin();
  }

  // Obtener información del usuario actual
  getCurrentUser(): User | null {
    return this.user;
  }

  // Verificar si está autenticado
  getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  // Verificar si está cargando
  getIsLoading(): boolean {
    return this.isLoading;
  }

  // Obtener el club del usuario (si es jugador)
  getUserClub(): string | null {
    if (this.isPlayer() && this.user?.player_info?.current_club) {
      return this.user.player_info.current_club;
    }
    return null;
  }

  // Obtener la posición del jugador
  getPlayerPosition(): string | null {
    if (this.isPlayer() && this.user?.player_info?.position) {
      return this.user.player_info.position;
    }
    return null;
  }

  // Obtener el número de camiseta del jugador
  getPlayerJerseyNumber(): number | null {
    if (this.isPlayer() && this.user?.player_info?.jersey_number) {
      return this.user.player_info.jersey_number;
    }
    return null;
  }

  // Verificar si el usuario puede acceder a funciones públicas
  canAccessPublicFeatures(): boolean {
    return true; // Todos pueden acceder a funciones públicas
  }

  // Verificar si el usuario puede acceder a funciones autenticadas
  canAccessAuthenticatedFeatures(): boolean {
    return this.isAuthenticated;
  }

  // Obtener permisos del usuario
  getUserPermissions(): string[] {
    const permissions: string[] = ['view_public_content'];

    if (!this.isAuthenticated) {
      return permissions;
    }

    permissions.push('view_profile', 'update_profile');

    if (this.isPlayer()) {
      permissions.push(
        'view_player_stats',
        'view_player_sanctions',
        'appeal_sanctions',
        'view_payments'
      );
    }

    if (this.isCoachOrManager()) {
      permissions.push(
        'manage_team_players',
        'view_team_stats',
        'appeal_sanctions'
      );
    }

    if (this.isReferee()) {
      permissions.push(
        'manage_match_control',
        'scan_player_qr',
        'update_match_score',
        'manage_rotations',
        'apply_sanctions'
      );
    }

    if (this.isLeague()) {
      permissions.push(
        'manage_matches',
        'manage_sanctions',
        'view_all_tournaments'
      );
    }

    if (this.isAdmin()) {
      permissions.push(
        'manage_all',
        'view_all_data',
        'manage_users',
        'manage_system'
      );
    }

    return permissions;
  }

  // Verificar si el usuario tiene un permiso específico
  hasPermission(permission: string): boolean {
    return this.getUserPermissions().includes(permission);
  }

  // Get the stored authentication token
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }
}

export const authService = AuthService.getInstance();
export default authService;