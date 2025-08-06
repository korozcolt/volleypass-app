// Interfaces principales para la aplicación VolleyPass

export interface User {
  id: number;
  name: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  birth_date?: string;
  gender?: 'male' | 'female';
  address?: string;
  roles: string[];
  user_type: 'player' | 'coach' | 'referee' | 'admin' | 'league';
  profile?: UserProfile;
  player_info?: PlayerInfo;
  location?: Location;
}

export interface UserProfile {
  nickname?: string;
  bio?: string;
  avatar_url?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  blood_type?: string;
  allergies?: string;
  medical_conditions?: string;
  t_shirt_size?: string;
  social_media?: {
    instagram?: string;
    facebook?: string;
  };
}

export interface PlayerInfo {
  position: string;
  jersey_number: number;
  height?: number;
  weight?: number;
  current_club?: string;
  category?: string;
  years_playing?: number;
}

export interface Location {
  city: string;
  department: string;
  country: string;
}

export interface Team {
  id: number;
  name: string;
  logo?: string;
  club: Club;
  category: Category;
  players_count?: number;
  coach?: Coach;
  players?: Player[];
  statistics?: TeamStatistics;
}

export interface Club {
  id: number;
  name: string;
  logo?: string;
}

export interface Category {
  id: number;
  name: string;
  min_age?: number;
  max_age?: number;
  gender: 'male' | 'female' | 'mixed';
}

export interface Coach {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

export interface Player {
  id: number;
  name: string;
  jersey_number: number;
  position: string;
  is_captain?: boolean;
  federation_status?: string;
  user?: User;
}

export interface TeamStatistics {
  matches_played: number;
  wins: number;
  losses: number;
  sets_won: number;
  sets_lost: number;
}

export interface Match {
  id: number;
  home_team: Team;
  away_team: Team;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_at: string;
  started_at?: string;
  venue: Venue;
  tournament: Tournament;
  home_sets: number;
  away_sets: number;
  current_set?: number;
  sets?: Set[];
  referees?: Referee[];
}

export interface Venue {
  id: number;
  name: string;
  address: string;
}

export interface Tournament {
  id: number;
  name: string;
  description?: string;
  status: 'upcoming' | 'active' | 'completed';
  start_date: string;
  end_date: string;
  league: League;
  categories: Category[];
  teams_count?: number;
  matches_count?: number;
}

export interface League {
  id: number;
  name: string;
}

export interface Set {
  set_number: number;
  home_score: number;
  away_score: number;
  status: 'in_progress' | 'completed';
  duration_minutes?: number;
}

export interface Referee {
  id: number;
  name: string;
  type: 'main' | 'assistant';
}

export interface Standing {
  position: number;
  team: Team;
  matches_played: number;
  wins: number;
  losses: number;
  sets_won: number;
  sets_lost: number;
  points_for: number;
  points_against: number;
  points: number;
  percentage: number;
}

export interface Sanction {
  id: number;
  type: 'yellow_card' | 'red_card' | 'suspension';
  severity: 'minor' | 'major' | 'severe';
  status: 'active' | 'expired' | 'appealed';
  reason: string;
  applied_at: string;
  expires_at?: string;
  match?: Match;
  applied_by: string;
  appeal_reason?: string;
  appeal_date?: string;
  player?: Player;
  team?: Team;
}

export interface Rotation {
  match_id: number;
  set_number: number;
  home_rotation: RotationPosition[];
  away_rotation: RotationPosition[];
}

export interface RotationPosition {
  position: number;
  player: Player;
}

export interface Payment {
  id: number;
  type: 'monthly_fee' | 'federation' | 'tournament';
  status: 'pending' | 'completed' | 'overdue' | 'under_verification';
  amount: number;
  currency: string;
  description: string;
  due_date: string;
  payment_date?: string;
  reference_number: string;
  club: Club;
  transaction_reference?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  error_code?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
    has_next_page: boolean;
    has_previous_page: boolean;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LiveMatchUpdate {
  match_id: number;
  type: 'score' | 'status' | 'rotation' | 'set_completed';
  data: any;
  timestamp: string;
}

// Tipos para filtros y búsquedas
export interface MatchFilters {
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  team_id?: number;
  tournament_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface TournamentFilters {
  status?: 'upcoming' | 'active' | 'completed';
  league_id?: number;
  category_id?: number;
}

export interface TeamFilters {
  club_id?: number;
  category_id?: number;
  search?: string;
}

export interface SanctionFilters {
  status?: 'pending' | 'completed' | 'overdue';
  type?: 'monthly_fee' | 'federation' | 'tournament';
}

// Tipos para notificaciones push
export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  type: 'match_update' | 'sanction' | 'payment' | 'general';
  timestamp: string;
  read: boolean;
}

// Tipos para configuración de la app
export interface AppConfig {
  api_base_url: string;
  pusher_key: string;
  pusher_cluster: string;
  app_version: string;
  theme: 'light' | 'dark' | 'auto';
  language: 'es' | 'en';
  notifications_enabled: boolean;
}

// Tipos para el estado de la aplicación
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  config: AppConfig;
}

export interface MatchState {
  liveMatches: Match[];
  selectedMatch: Match | null;
  isLoadingMatches: boolean;
  matchError: string | null;
}

export interface TournamentState {
  tournaments: Tournament[];
  selectedTournament: Tournament | null;
  standings: Standing[];
  isLoadingTournaments: boolean;
  tournamentError: string | null;
}