// Tipos de navegación para la aplicación VolleyPass

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  EditProfile: undefined;
  Notifications: undefined;
  PlayerSanctions: undefined;
  PlayerPayments: undefined;
  MatchControl: { matchId: number };
  PlayerManagement: undefined;
  MatchDetail: { matchId: number; title: string };
  TournamentDetail: { tournamentId: number };
};

export type TabParamList = {
  Home: undefined;
  Tournaments: undefined;
  LiveMatches: undefined;
  Standings: undefined;
  Stats: undefined;
  Profile: undefined;
  MyMatches: undefined;
  QRScanner: undefined;
  TeamManagement: undefined;
  MatchManagement: undefined;
  SanctionManagement: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}