import {
  ApiResponse,
  AuthResponse,
  Match,
  MatchFilters,
  PaginatedResponse,
  Payment,
  Rotation,
  Sanction,
  SanctionFilters,
  Standing,
  Team,
  TeamFilters,
  Tournament,
  TournamentFilters,
  User,
} from '../types';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../config/env';

class VolleyPassAPI {
  private baseURL = CONFIG.API.BASE_URL;
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  private async loadToken(): Promise<void> {
    try {
      this.token = await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error loading token:', error);
    }
  }

  private async saveToken(token: string): Promise<void> {
    try {
      this.token = token;
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  private async removeToken(): Promise<void> {
    try {
      this.token = null;
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Log de la URL completa que se está consultando
    console.log(`🌐 API Request URL: ${url}`);
    console.log(`📤 Request Method: ${options.method || 'GET'}`);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: 'cors',
        credentials: 'omit',
      });

      const data = await response.json();
      
      // Log de la respuesta
      console.log(`📥 API Response Status: ${response.status}`);
      console.log(`📥 API Response Data:`, JSON.stringify(data, null, 2));

      if (!response.ok) {
        console.error(`❌ API Error Response:`, data);
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error(`❌ API Request Error for ${url}:`, error);
      throw error;
    }
  }

  private async paginatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<PaginatedResponse<T>> {
    return this.request<T[]>(endpoint, options) as Promise<PaginatedResponse<T>>;
  }

  // Autenticación
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      await this.saveToken(response.data.token);
      return response.data;
    }

    throw new Error(response.message || 'Login failed');
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      await this.removeToken();
    }
  }

  // Perfil de usuario
  async getUserProfile(): Promise<User> {
    const response = await this.request<User>('/users/profile');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get user profile');
  }

  async updateUserProfile(profileData: Partial<User>): Promise<User> {
    const response = await this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });

    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to update profile');
  }

  async getPublicUserProfile(userId: number): Promise<User> {
    const response = await this.request<User>(`/users/${userId}/profile`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get user profile');
  }

  // Partidos
  async getMatches(filters: MatchFilters = {}): Promise<PaginatedResponse<Match>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const endpoint = `/matches/scheduled${params.toString() ? `?${params.toString()}` : ''}`;
    return this.paginatedRequest<Match>(endpoint);
  }

  async getMatch(matchId: number): Promise<Match> {
    const response = await this.request<Match>(`/matches/${matchId}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get match');
  }

  async getLiveMatches(): Promise<Match[]> {
    const response = await this.request<Match[]>('/matches/live');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get live matches');
  }

  async getMatchPlayers(matchId: number): Promise<{ players: any[]; officials: any[] }> {
    const response = await this.request<{ players: any[]; officials: any[] }>(
      `/public/matches/${matchId}/players`
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get match players');
  }

  async getTeamPlayersInMatch(matchId: number, teamId: number): Promise<any[]> {
    const response = await this.request<any[]>(
      `/public/matches/${matchId}/teams/${teamId}/players`
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get team players');
  }

  // Torneos
  async getTournaments(filters: TournamentFilters = {}): Promise<Tournament[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const endpoint = `/public/tournaments${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.request<Tournament[]>(endpoint);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get tournaments');
  }

  async getTournamentStandings(tournamentId: number): Promise<Standing[]> {
    const response = await this.request<Standing[]>(`/public/tournaments/${tournamentId}/standings`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get tournament standings');
  }

  async getPublicTournamentStandings(tournamentId: number): Promise<any> {
    const response = await this.request<any>(`/public/tournaments/${tournamentId}/standings`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get tournament standings');
  }

  async getGroupStandings(tournamentId: number, groupId: number): Promise<any> {
    const response = await this.request<any>(
      `/public/tournaments/${tournamentId}/groups/${groupId}/standings`
    );
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get group standings');
  }

  // Equipos
  async getTeams(filters: TeamFilters = {}): Promise<Team[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const endpoint = `/teams${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.request<Team[]>(endpoint);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get teams');
  }

  async getTeam(teamId: number): Promise<Team> {
    const response = await this.request<Team>(`/teams/${teamId}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get team');
  }

  // Sanciones
  async getPlayerSanctions(): Promise<Sanction[]> {
    const response = await this.request<Sanction[]>('/sanctions/player');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get player sanctions');
  }

  async getMatchSanctions(matchId: number): Promise<Sanction[]> {
    const response = await this.request<Sanction[]>(`/sanctions/match/${matchId}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get match sanctions');
  }

  async appealSanction(sanctionId: number, reason: string): Promise<void> {
    const response = await this.request(`/sanctions/${sanctionId}/appeal`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to appeal sanction');
    }
  }

  // Rotaciones
  async getCurrentRotation(matchId: number): Promise<Rotation> {
    const response = await this.request<Rotation>(`/rotation/${matchId}/current`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get current rotation');
  }

  async updateRotation(
    matchId: number,
    team: 'home' | 'away',
    rotations: { position: number; player_id: number }[]
  ): Promise<Rotation> {
    const response = await this.request<Rotation>(`/rotation/${matchId}/update`, {
      method: 'POST',
      body: JSON.stringify({ team, rotations }),
    });

    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to update rotation');
  }

  async getAvailablePositions(): Promise<any> {
    const response = await this.request<any>('/rotation/available-positions');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get available positions');
  }

  // Pagos
  async getPlayerPayments(filters: SanctionFilters = {}): Promise<Payment[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const endpoint = `/payments/player${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.request<Payment[]>(endpoint);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get player payments');
  }

  async registerPayment(
    paymentId: number,
    paymentData: {
      payment_method: string;
      transaction_reference: string;
      payment_date: string;
      notes?: string;
    }
  ): Promise<Payment> {
    const response = await this.request<Payment>(`/payments/${paymentId}/register`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });

    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to register payment');
  }

  // Estadísticas de jugador
  async getPlayerStats(playerId: number): Promise<any> {
    const response = await this.request<any>(`/players/${playerId}/stats`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get player stats');
  }

  // Verificar si el token es válido
  async verifyToken(): Promise<boolean> {
    try {
      await this.getUserProfile();
      return true;
    } catch {
      await this.removeToken();
      return false;
    }
  }

  // Obtener el token actual
  getToken(): string | null {
    return this.token;
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return this.token !== null;
  }
}

export const api = new VolleyPassAPI();
export default api;